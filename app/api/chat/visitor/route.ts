import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
    const empresaId = "6186f014-c8c7-4027-9f08-8acf2bae3eae"; // Default empresa

    let visitorSessionId = session_id || crypto.randomUUID();

    // Buscar sala existente para este visitante
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
        // Crear nueva sala
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
      // Crear nueva sala
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

    // Crear o actualizar visitante
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

    // Insertar mensaje
    const { error: msgError } = await supabaseAdmin.from("chat_mensajes").insert({
      sala_id: salaId,
      user_id: null,
      tipo: "texto",
      contenido: mensaje,
      enviado: true,
    });

    if (msgError) throw msgError;

    // Notificar a agentes (esto se haría vía trigger, pero también podemos forzar aquí)
    // Por ahora, la notificación se maneja por el trigger de notificaciones

    return NextResponse.json({
      success: true,
      session_id: visitorSessionId,
      sala_id: salaId,
    });
  } catch (error: any) {
    console.error("[chat/visitor] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno" },
      { status: 500 }
    );
  }
}
