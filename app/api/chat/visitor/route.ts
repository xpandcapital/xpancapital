import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthUser } from "@/lib/supabase/api-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado") || "activo";

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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

    let visitorSessionId = session_id || crypto.randomUUID();
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

    // Si es conversación nueva, buscar primer agente online y asignar
    if (isNewConversation) {
      const { data: agenteOnline } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("empresa_id", empresaId)
        .eq("estado_chat", "online")
        .in("rol", ["admin", "editor", "superadmin"])
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (agenteOnline) {
        // Agregar agente como admin de la sala
        await supabaseAdmin.from("chat_miembros").insert({
          sala_id: salaId,
          user_id: agenteOnline.id,
          rol_sala: "admin",
        });

        // Mensaje de sistema de bienvenida
        await supabaseAdmin.from("chat_mensajes").insert({
          sala_id: salaId,
          user_id: null,
          tipo: "sistema",
          contenido: `¡Hola ${nombre}! Bienvenido a BLIS Corp. Un asesor te atenderá en breve. Mientras tanto, cuéntanos en qué podemos ayudarte.`,
          enviado: true,
        });

        // Notificar al agente
        await supabaseAdmin.from("notificaciones").insert({
          user_id: agenteOnline.id,
          empresa_id: empresaId,
          tipo: "sistema",
          titulo: "Nuevo visitante en chat",
          mensaje: `${nombre} ha iniciado una conversación desde ${pagina_origen || "la web"}`,
          link: "/superadmin/chat",
        });
      } else {
        // Sin agentes online: mensaje de fuera de horario
        await supabaseAdmin.from("chat_mensajes").insert({
          sala_id: salaId,
          user_id: null,
          tipo: "sistema",
          contenido: `¡Hola ${nombre}! Gracias por contactarnos. En este momento no hay asesores disponibles, pero dejaste tu mensaje y te responderemos lo antes posible.`,
          enviado: true,
        });
      }
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
