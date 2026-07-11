export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 500);
    const categoria = searchParams.get("categoria") || "";
    const search = searchParams.get("search") || "";

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    let query = supabase
      .from("biblioteca_libros")
      .select("*", { count: "exact" })
      .eq("activo", true)
      .order("orden", { ascending: true })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (categoria) query = query.eq("categoria", categoria);
    if (search) query = query.ilike("titulo", `%${search}%`);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      libros: data,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

