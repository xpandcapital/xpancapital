export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthUser } from "@/lib/supabase/api-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET — listar todos (incluyendo inactivos) para admin
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth || !["superadmin", "admin", "editor"].includes(auth.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error, count } = await supabase
      .from("biblioteca_libros")
      .select("*", { count: "exact" })
      .order("orden", { ascending: true })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return NextResponse.json({ success: true, libros: data, total: count });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST — crear libro
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await request.json();
    const { titulo, autor, categoria, portada_url, descripcion, download_link, is_featured } = body;

    if (!titulo) return NextResponse.json({ error: "Título requerido" }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("biblioteca_libros")
      .insert({
        titulo,
        autor: autor || "Blis Editorial",
        categoria: categoria || "General",
        portada_url: portada_url || null,
        descripcion: descripcion || null,
        download_link: download_link || null,
        is_featured: is_featured || false,
        orden: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, libro: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT — actualizar libro
export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("biblioteca_libros")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, libro: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE — eliminar libro
export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.from("biblioteca_libros").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

