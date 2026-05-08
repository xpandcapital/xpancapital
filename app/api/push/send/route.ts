import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;

webpush.setVapidDetails("mailto:soporte@blis-corp.com", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, titulo, mensaje, url, tipo } = body;

    if (!user_id || !titulo) {
      return NextResponse.json({ error: "user_id y titulo son requeridos" }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: subscriptions, error } = await supabaseAdmin
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", user_id);

    if (error) {
      console.error("[push/send] Error fetching subscriptions:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: "No hay suscripciones" });
    }

    const payload = JSON.stringify({
      titulo,
      mensaje: mensaje || "",
      url: url || "/superadmin/chat",
      tipo: tipo || "sistema",
    });

    let sent = 0;
    let failed = 0;
    const expiredEndpoints: string[] = [];

    for (const sub of subscriptions) {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, payload, {
          TTL: 3600,
          urgency: "high",
        });
        sent++;
      } catch (err: any) {
        failed++;
        if (err.statusCode === 410 || err.statusCode === 404) {
          expiredEndpoints.push(sub.endpoint);
        }
        console.error("[push/send] Error sending to:", sub.endpoint, err.statusCode, err.message);
      }
    }

    if (expiredEndpoints.length > 0) {
      await supabaseAdmin
        .from("push_subscriptions")
        .delete()
        .in("endpoint", expiredEndpoints);
    }

    return NextResponse.json({ success: true, sent, failed, expired: expiredEndpoints.length });
  } catch (error: any) {
    console.error("[push/send] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}