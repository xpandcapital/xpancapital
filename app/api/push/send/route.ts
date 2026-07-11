import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js'
import { getAuthUser, isAdmin } from "@/lib/supabase/api-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth || !isAdmin(auth)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { user_id, titulo, mensaje, url, tipo } = await request.json();
    if (!user_id || !titulo || !mensaje) {
      return NextResponse.json({ error: "user_id, titulo y mensaje requeridos" }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: subs } = await supabaseAdmin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", user_id);

    if (!subs || subs.length === 0) {
      return NextResponse.json({ success: true, enviadas: 0, mensaje: "Sin suscripciones push" });
    }

    if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      return NextResponse.json({ error: "VAPID keys no configuradas" }, { status: 500 });
    }

    const webPush = await import("web-push");
    webPush.default.setVapidDetails(
      "mailto:soporte@bliscorp.com",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    const payload = JSON.stringify({ titulo: titulo.trim(), mensaje: mensaje.trim(), url: url?.trim() || '/', tipo: tipo || 'sistema' });

    const results = await Promise.allSettled(
      subs.map((s) =>
        webPush.default.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        ).catch((err) => console.error("[push/send] Error individual:", err?.statusCode, err?.message))
      )
    );

    const enviadas = results.filter(r => r.status === 'fulfilled').length;
    return NextResponse.json({ success: true, enviadas });
  } catch (error) {
    console.error("[push/send] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
