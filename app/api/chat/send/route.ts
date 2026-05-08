import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthUser } from "@/lib/supabase/api-auth";
import { sendPushToUsers } from "@/lib/push-notifications";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { sala_id, contenido, tipo = "texto", user_id, reply_to, metadata } = body;

    if (!sala_id || !contenido?.trim()) {
      return NextResponse.json(
        { error: "sala_id y contenido son requeridos" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const senderId = user_id || auth.id;

    // Insertar mensaje
    const { data: msgData, error: msgError } = await supabaseAdmin
      .from("chat_mensajes")
      .insert({
        sala_id,
        user_id: senderId,
        tipo,
        contenido: contenido.trim(),
        reply_to: reply_to || null,
        metadata: metadata || {},
        enviado: true,
      })
      .select("id, tipo, contenido, creado_en, user_id")
      .single();

    if (msgError) {
      console.error("[chat/send POST] Error:", msgError.message, msgError.code);
      return NextResponse.json(
        { error: `Error enviando mensaje: ${msgError.message}` },
        { status: 500 }
      );
    }

    // Obtener info del remitente y miembros de la sala para notificar
    try {
      const [senderRes, miembrosRes, salaRes] = await Promise.all([
        supabaseAdmin.from("profiles").select("nombre, rol").eq("id", senderId).single(),
        supabaseAdmin.from("chat_miembros").select("user_id").eq("sala_id", sala_id),
        supabaseAdmin.from("chat_salas").select("tipo, nombre").eq("id", sala_id).single(),
      ]);

      const senderName = senderRes.data?.nombre || "Usuario";
      const senderRol = senderRes.data?.rol || "";
      const salaTipo = salaRes.data?.tipo || "";
      const miembros = (miembrosRes.data || []) as { user_id: string }[];

      // Filtrar: no notificar al que envió
      const targetIds = miembros.map((m: { user_id: string }) => m.user_id).filter((id: string) => id !== senderId);

      if (targetIds.length > 0) {
        const tipoLabel = salaTipo === "visitante" ? "Visitante" : salaTipo === "soporte" ? "Soporte" : salaTipo === "ventas" ? "Ventas" : salaTipo === "ia" ? "IA" : senderRol === "admin" || senderRol === "superadmin" ? "Admin" : "Mensaje";

        await sendPushToUsers(
          supabaseAdmin,
          targetIds,
          `${tipoLabel}: ${senderName}`,
          contenido.trim().slice(0, 100),
          "/superadmin/chat",
          "chat"
        );
      }
    } catch (pushErr) {
      console.warn("[chat/send] Push notification error (non-critical):", pushErr);
    }

    return NextResponse.json({ success: true, data: msgData });
  } catch (error: any) {
    console.error("[chat/send POST] Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Error interno" },
      { status: 500 }
    );
  }
}