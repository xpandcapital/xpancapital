import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthUser } from "@/lib/supabase/api-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from("profiles")
      .select("id, nombre, email, rol, avatar_url")
      .not("email", "is", null)
      .order("nombre", { ascending: true })
      .limit(limit);

    if (search) {
      query = query.or(`nombre.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, contactos: data || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
