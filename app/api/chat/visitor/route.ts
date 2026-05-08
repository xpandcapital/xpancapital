import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthUser } from "@/lib/supabase/api-auth";
import { randomUUID } from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    const estado = searchParams.get("estado") || "activo";

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Si hay session_id (visitante anónimo), devolver historial público
    if (sessionId) {
      const { data: visitante } = await supabaseAdmin
        .from("chat_visitantes")
        .select("sala_id")
        .eq("session_id", sessionId)
        .single();

      if (!visitante?.sala_id) {
        return NextResponse.json({ success: true, historial: [] });
      }

      const { data: historial, error } = await supabaseAdmin
        .from("chat_mensajes")
        .select("*")
        .eq("sala_id", visitante.sala_id)
        .eq("eliminado", false)
        .order("creado_en", { ascending: true });

      if (error) throw error;
      return NextResponse.json({ success: true, historial: historial || [] });
    }

    // Sin session_id: requiere auth (admin)
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("chat_visitantes")
      .select(`
        *,
        sala:chat_salas(id, nombre, ultima_actividad)
      `)
      .eq("estado", estado)
      .order("ultima_actividad", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error("[chat/visitor GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nombre,
      email,
      mensaje,
      session_id,
      pagina_origen,
      utm_source,
      utm_medium,
      utm_campaign,
    } = body;

    if (!nombre || !mensaje) {
      return NextResponse.json(
        { success: false, error: "Nombre y mensaje son requeridos" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const empresaId = "6186f014-c8c7-4027-9f08-8acf2bae3eae";

    let visitorSessionId = session_id || randomUUID();
    let salaId: string;
    let isNewConversation = false;

    // Verificar si ya existe sesión activa
    if (session_id) {
      const { data: existente } = await supabaseAdmin
        .from("chat_visitantes")
        .select("sala_id, nombre, email")
        .eq("session_id", session_id)
        .eq("estado", "activo")
        .single();

      if (existente?.sala_id) {
        salaId = existente.sala_id;
        // Actualizar última actividad
        await supabaseAdmin
          .from("chat_visitantes")
          .update({ ultima_actividad: new Date().toISOString() })
          .eq("session_id", session_id);
      } else {
        isNewConversation = true;
        const { data: sala, error: salaError } = await supabaseAdmin
          .from("chat_salas")
          .insert({
            empresa_id: empresaId,
            tipo: "visitante",
            nombre: `Visitante: ${nombre}`,
          })
          .select()
          .single();

        if (salaError) throw salaError;
        salaId = sala.id;
      }
    } else {
      isNewConversation = true;
      const { data: sala, error: salaError } = await supabaseAdmin
        .from("chat_salas")
        .insert({
          empresa_id: empresaId,
          tipo: "visitante",
          nombre: `Visitante: ${nombre}`,
        })
        .select()
        .single();

      if (salaError) throw salaError;
      salaId = sala.id;
    }

    // Upsert visitante con empresa_id
    const { error: visitorError } = await supabaseAdmin
      .from("chat_visitantes")
      .upsert({
        sala_id: salaId,
        empresa_id: empresaId,
        nombre,
        email: email || null,
        session_id: visitorSessionId,
        pagina_origen: pagina_origen || null,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        estado: "activo",
        ultima_actividad: new Date().toISOString(),
      }, { onConflict: "session_id" });

    if (visitorError) {
      console.error("[chat/visitor] Error upsert visitante:", visitorError);
      throw visitorError;
    }

    // Insertar mensaje del visitante
    const { error: msgError } = await supabaseAdmin
      .from("chat_mensajes")
      .insert({
        sala_id: salaId,
        user_id: null,
        tipo: "texto",
        contenido: mensaje,
        enviado: true,
      });

    if (msgError) throw msgError;

    // Si es conversación nueva, enviar mensaje de bienvenida configurable
    if (isNewConversation) {
      const { data: chatConfig } = await supabaseAdmin
        .from("chat_config")
        .select("widget_mensaje_bienvenida, widget_mensaje_fuera_horario")
        .eq("empresa_id", empresaId)
        .single();

      const mensajeBienvenida = chatConfig?.widget_mensaje_bienvenida || `¡Hola ${nombre}! Bienvenido a BLIS Corp. ¿En qué podemos ayudarte hoy?`;

      await supabaseAdmin.from("chat_mensajes").insert({
        sala_id: salaId,
        user_id: null,
        tipo: "sistema",
        contenido: mensajeBienvenida,
        enviado: true,
      });
    }

    // Crear notificación para agentes disponibles
    try {
      const { data: agentes } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("empresa_id", empresaId)
        .eq("estado_chat", "online")
        .in("rol", ["admin", "editor", "superadmin", "empleado"]);

      if (agentes && agentes.length > 0) {
        for (const agente of agentes) {
          await supabaseAdmin.from("notificaciones").insert({
            user_id: agente.id,
            empresa_id: empresaId,
            tipo: "chat",
            titulo: "Nuevo mensaje de chat",
            mensaje: `${nombre}: ${mensaje.slice(0, 100)}${mensaje.length > 100 ? '...' : ''}`,
            link: "/superadmin/chat",
            enviado_por: null,
            destinatario_tipo: "miembro",
            destinatario_ids: [agente.id],
          });
        }
      }
    } catch (notifErr) {
      // No fallar si la notificación no se puede crear
      console.error("[chat/visitor] Error creando notificación:", notifErr);
    }

    // Obtener historial de mensajes de esta sala para retornar al visitante
    const { data: historial } = await supabaseAdmin
      .from("chat_mensajes")
      .select("*")
      .eq("sala_id", salaId)
      .eq("eliminado", false)
      .order("creado_en", { ascending: true });

    return NextResponse.json({
      success: true,
      session_id: visitorSessionId,
      sala_id: salaId,
      historial: historial || [],
    });
  } catch (error: any) {
    console.error("[chat/visitor POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno" },
      { status: 500 }
    );
  }
}
