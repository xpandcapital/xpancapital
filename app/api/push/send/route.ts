import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, titulo, mensaje, url, tipo } = body;

    if (!user_id || !titulo) {
      return NextResponse.json({ error: "user_id y titulo son requeridos" }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { sendPushToUsers } = await import("@/lib/push-notifications");

    const result = await sendPushToUsers(supabaseAdmin, [user_id], titulo, mensaje || "", url || "/superadmin/chat", tipo || "sistema");

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("[push/send] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}