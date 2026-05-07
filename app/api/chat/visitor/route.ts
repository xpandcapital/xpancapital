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

    if (session_id) {
      const { data: existente } = await supabaseAdmin
        .from("chat_visitantes")
        .select("sala_id")
        .eq("session_id", session_id)
        .eq("estado", "activo")
        .single();

      if (existente) {
        salaId = existente.sala_id;
      } else {
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

    await supabaseAdmin.from("chat_visitantes").upsert({
      sala_id: salaId,
      nombre,
      email: email || null,
      session_id: visitorSessionId,
      pagina_origen: pagina_origen || null,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      estado: "activo",
    });

    const { error: msgError } = await supabaseAdmin.from("chat_mensajes").insert({
      sala_id: salaId,
      user_id: null,
      tipo: "texto",
      contenido: mensaje,
      enviado: true,
    });

    if (msgError) throw msgError;

    return NextResponse.json({
      success: true,
      session_id: visitorSessionId,
      sala_id: salaId,
    });
  } catch (error: any) {
    console.error("[chat/visitor POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno" },
      { status: 500 }
    );
  }
}
