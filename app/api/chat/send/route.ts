import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthUser } from "@/lib/supabase/api-auth";

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

    const { data: msgData, error: msgError } = await supabaseAdmin
      .from("chat_mensajes")
      .insert({
        sala_id,
        user_id: user_id || auth.id,
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

    return NextResponse.json({ success: true, data: msgData });
  } catch (error: any) {
    console.error("[chat/send POST] Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Error interno" },
      { status: 500 }
    );
  }
}