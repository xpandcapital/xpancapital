export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js'
import { getAuthUser, isAdmin } from "@/lib/supabase/api-auth";
import { notifyUser } from '@/lib/notifications';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth || !isAdmin(auth)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { titulo, mensaje, link, destinatario_tipo, destinatario_roles, destinatario_ids, enviar_whatsapp } = body;

    if (!titulo || !mensaje) {
      return NextResponse.json({ error: "titulo y mensaje son requeridos" }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const empresaId = auth.empresaId;

    let targetUsers: { id: string }[] = [];

    // Determinar destinatarios según el tipo
    if (destinatario_ids && destinatario_ids.length > 0) {
      // Miembro específico o grupo personalizado
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .in("id", destinatario_ids)
        .eq("empresa_id", empresaId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      targetUsers = data || [];
    } else if (destinatario_tipo === "por_rol" && destinatario_roles && destinatario_roles.length > 0) {
      // Filtrar por roles
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("empresa_id", empresaId)
        .in("rol", destinatario_roles);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      targetUsers = data || [];
    } else {
      // Todos los miembros de la empresa
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("empresa_id", empresaId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      targetUsers = data || [];
    }

    if (targetUsers.length === 0) {
      return NextResponse.json({ success: true, enviadas: 0 });
    }

    // Insertar registros en notificaciones
    const records = targetUsers.map((u) => ({
      user_id: u.id,
      empresa_id: empresaId,
      tipo: "sistema",
      titulo: titulo.trim(),
      mensaje: mensaje.trim(),
      link: link?.trim() || null,
      leida: false,
    }));

    const { error: insertError } = await supabaseAdmin
      .from("notificaciones")
      .insert(records);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // WhatsApp (si se solicitó)
    if (enviar_whatsapp) {
      for (const user of targetUsers) {
        notifyUser({ userId: user.id, titulo, mensaje, link, canales: ['whatsapp'] }).catch(() => {})
      }
    }

    // Intentar push notifications para los que tengan suscripción
    const userIds = targetUsers.map((u) => u.id);
    try {
      const { data: subs } = await supabaseAdmin
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth")
        .in("user_id", userIds);

      if (subs && subs.length > 0 && process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        const webPush = await import("web-push");
        webPush.default.setVapidDetails(
          "mailto:soporte@bliscorp.com",
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          process.env.VAPID_PRIVATE_KEY
        );
        const payload = JSON.stringify({ titulo: titulo.trim(), mensaje: mensaje.trim(), url: link?.trim() || '/' });
        await Promise.allSettled(
          subs.map((s) =>
            webPush.default.sendNotification(
              { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
              payload
            ).catch((err) => console.error("[notificaciones/enviar] Push individual error:", err?.statusCode, err?.message))
          )
        );
      }
    } catch (pushError) {
      console.error("[notificaciones/enviar] Error enviando push:", pushError);
    }

    return NextResponse.json({ success: true, enviadas: records.length });
  } catch (error) {
    console.error("[notificaciones/enviar] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

