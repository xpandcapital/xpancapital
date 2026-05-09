let webpush: any = null;
let initialized = false;

async function ensureVapid() {
  if (!webpush) {
    const mod = await import("web-push");
    webpush = mod.default || mod;
  }
  if (initialized) return;
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;
  webpush.setVapidDetails(
    "mailto:soporte@blis-corp.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  initialized = true;
}

export async function sendPushToUsers(
  supabaseAdmin: any,
  userIds: string[],
  titulo: string,
  mensaje: string,
  url: string = "/superadmin/chat",
  tipo: string = "chat"
) {
  try {
    await ensureVapid();

    const { data: subs } = await supabaseAdmin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth, user_id")
      .in("user_id", userIds);

    if (!subs || subs.length === 0) return { sent: 0 };

    const payload = JSON.stringify({ titulo, mensaje, url, tipo });
    let sent = 0;
    const expired: string[] = [];

    for (const sub of subs) {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        }, payload, { TTL: 3600, urgency: "high" });
        sent++;
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          expired.push(sub.endpoint);
        }
      }
    }

    if (expired.length > 0) {
      await supabaseAdmin.from("push_subscriptions").delete().in("endpoint", expired);
    }

    return { sent, expired: expired.length };
  } catch (err) {
    console.error("[sendPushToUsers] Error:", err);
    return { sent: 0, error: true };
  }
}