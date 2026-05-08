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
    const { nombre, email, mensaje, session_id, pagina_origen } = body;

    if (!nombre || !mensaje) {
      return NextResponse.json({ success: false, error: "Nombre y mensaje son requeridos" }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const empresaId = "6186f014-c8c7-4027-9f08-8acf2bae3eae";
    const visitorSessionId = session_id || randomUUID();
    let salaId: string;

    // Buscar o crear sala (rápido: 1 query)
    if (session_id) {
      const { data: existente } = await supabaseAdmin
        .from("chat_visitantes")
        .select("sala_id").eq("session_id", session_id).eq("estado", "activo")
        .maybeSingle();

      if (existente?.sala_id) {
        salaId = existente.sala_id;
      } else {
        const { data: sala } = await supabaseAdmin
          .from("chat_salas")
          .insert({ empresa_id: empresaId, tipo: "visitante", nombre: `Visitante: ${nombre}` })
          .select("id").single();
        if (!sala) return NextResponse.json({ success: false, error: "Error creando sala" }, { status: 500 });
        salaId = sala.id;
      }
    } else {
      const { data: sala } = await supabaseAdmin
        .from("chat_salas")
        .insert({ empresa_id: empresaId, tipo: "visitante", nombre: `Visitante: ${nombre}` })
        .select("id").single();
      if (!sala) return NextResponse.json({ success: false, error: "Error creando sala" }, { status: 500 });
      salaId = sala.id;
    }

    // Upsert visitante + insert mensaje en paralelo
    const [visitorResult, msgResult] = await Promise.allSettled([
      supabaseAdmin.from("chat_visitantes").upsert({
        sala_id: salaId, empresa_id: empresaId, nombre, email: email || null,
        session_id: visitorSessionId, pagina_origen: pagina_origen || null,
        estado: "activo", ultima_actividad: new Date().toISOString(),
      }, { onConflict: "session_id" }),
      supabaseAdmin.from("chat_mensajes").insert({
        sala_id: salaId, user_id: null, tipo: "texto",
        contenido: mensaje, enviado: true,
      })
    ]);

    // Obtener historial (rápido)
    const { data: historial } = await supabaseAdmin
      .from("chat_mensajes")
      .select("id, tipo, contenido, creado_en, user_id")
      .eq("sala_id", salaId).eq("eliminado", false)
      .order("creado_en", { ascending: true }).limit(30);

    return NextResponse.json({
      success: true,
      session_id: visitorSessionId,
      sala_id: salaId,
      historial: historial || [],
    });
  } catch (error: any) {
    console.error("[chat/visitor POST] Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Error interno" }, { status: 500 });
  }
}
