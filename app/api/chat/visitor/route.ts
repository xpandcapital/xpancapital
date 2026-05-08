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

    if (sessionId) {
      const { data: visitante, error: vError } = await supabaseAdmin
        .from("chat_visitantes")
        .select("sala_id")
        .eq("session_id", sessionId)
        .order("creado_en", { ascending: false })
        .limit(1);

      if (vError) {
        console.error("[chat/visitor GET] Error finding visitor:", vError);
        return NextResponse.json({ success: true, historial: [] });
      }

      const salaId = visitante?.[0]?.sala_id;
      if (!salaId) {
        return NextResponse.json({ success: true, historial: [] });
      }

      const { data: historial, error: hError } = await supabaseAdmin
        .from("chat_mensajes")
        .select("id, tipo, contenido, creado_en, user_id")
        .eq("sala_id", salaId)
        .eq("eliminado", false)
        .order("creado_en", { ascending: true });

      if (hError) {
        console.error("[chat/visitor GET] Error fetching historial:", hError);
        return NextResponse.json({ success: true, historial: [] });
      }

      return NextResponse.json({ success: true, historial: historial || [] });
    }

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
    console.error("[chat/visitor GET] Error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, email, mensaje, session_id, pagina_origen } = body;

    if (!nombre || !mensaje) {
      return NextResponse.json(
        { success: false, error: "Nombre y mensaje son requeridos" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const empresaId = "6186f014-c8c7-4027-9f08-8acf2bae3eae";

    let salaId: string;
    let visitorSessionId = session_id;

    // PASO 1: Buscar sala existente o crear nueva
    if (visitorSessionId) {
      const { data: existente, error: veError } = await supabaseAdmin
        .from("chat_visitantes")
        .select("sala_id, estado")
        .eq("session_id", visitorSessionId)
        .order("creado_en", { ascending: false })
        .limit(1);

      if (veError) {
        console.error("[chat/visitor POST] Error buscando visitante:", veError);
      }

      const existingSalaId = existente?.[0]?.sala_id;
      if (existingSalaId) {
        salaId = existingSalaId;
      } else {
        const { data: sala, error: sError } = await supabaseAdmin
          .from("chat_salas")
          .insert({ empresa_id: empresaId, tipo: "visitante", nombre: `Visitante: ${nombre}` })
          .select("id")
          .single();

        if (sError || !sala) {
          console.error("[chat/visitor POST] Error creando sala:", sError);
          return NextResponse.json(
            { success: false, error: `Error creando sala: ${sError?.message || "unknown"}` },
            { status: 500 }
          );
        }
        salaId = sala.id;
      }
    } else {
      visitorSessionId = randomUUID();
      const { data: sala, error: sError } = await supabaseAdmin
        .from("chat_salas")
        .insert({ empresa_id: empresaId, tipo: "visitante", nombre: `Visitante: ${nombre}` })
        .select("id")
        .single();

      if (sError || !sala) {
        console.error("[chat/visitor POST] Error creando sala (nueva):", sError);
        return NextResponse.json(
          { success: false, error: `Error creando sala: ${sError?.message || "unknown"}` },
          { status: 500 }
        );
      }
      salaId = sala.id;
    }

    // PASO 2: Upsert visitante (non-critical)
    const { error: upsertError } = await supabaseAdmin
      .from("chat_visitantes")
      .upsert({
        sala_id: salaId,
        empresa_id: empresaId,
        nombre,
        email: email || null,
        session_id: visitorSessionId,
        pagina_origen: pagina_origen || null,
        estado: "activo",
        ultima_actividad: new Date().toISOString(),
      }, { onConflict: "session_id" });

    if (upsertError) {
      console.warn("[chat/visitor POST] Visitante upsert error:", upsertError.message);
    }

    // PASO 3: Insertar mensaje
    const { data: msgData, error: msgError } = await supabaseAdmin
      .from("chat_mensajes")
      .insert({
        sala_id: salaId,
        user_id: null,
        tipo: "texto",
        contenido: mensaje,
        enviado: true,
      })
      .select("id, tipo, contenido, creado_en, user_id")
      .single();

    if (msgError) {
      console.error("[chat/visitor POST] Error insertando mensaje:", msgError.message, msgError.code, msgError.details);
      return NextResponse.json(
        { success: false, error: `Error enviando mensaje: ${msgError.message}` },
        { status: 500 }
      );
    }

    // PASO 4: Obtener historial completo
    const { data: historial, error: hError } = await supabaseAdmin
      .from("chat_mensajes")
      .select("id, tipo, contenido, creado_en, user_id")
      .eq("sala_id", salaId)
      .eq("eliminado", false)
      .order("creado_en", { ascending: true })
      .limit(50);

    if (hError) {
      console.warn("[chat/visitor POST] Error obteniendo historial:", hError.message);
    }

    return NextResponse.json({
      success: true,
      session_id: visitorSessionId,
      sala_id: salaId,
      historial: historial || [],
    });
  } catch (error: any) {
    console.error("[chat/visitor POST] Error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno" },
      { status: 500 }
    );
  }
}