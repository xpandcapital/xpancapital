export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthUser } from "@/lib/supabase/api-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET — listar todas las formas de pago (admin)
export async function GET(request: NextRequest) {
  try {
    // Si es público (sin auth), solo devolver activas
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get("public") === "1";

    const supabase = createClient(supabaseUrl, supabaseKey);

    if (isPublic) {
      const { data } = await supabase
        .from("formas_pago")
        .select("*")
        .eq("activo", true)
        .order("orden", { ascending: true });

      const formas = data || []

      const enriched = formas.map((f: any) => {
        if (f.slug !== 'whatsapp') return f
        const asesoresData = f.config?.asesores_whatsapp || []
        if (asesoresData.length === 0) return f
        const asesoresPublic = asesoresData.map((a: any) => ({
          id: a.id,
          nombre: a.nombre,
          foto_url: a.foto_url || '',
        }))
        return { ...f, asesores: asesoresPublic }
      })

      return NextResponse.json({ success: true, formas: enriched });
    }

    const auth = await getAuthUser(request);
    if (!auth || !["superadmin", "admin"].includes(auth.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data } = await supabase
      .from("formas_pago")
      .select("*")
      .order("orden", { ascending: true });

    return NextResponse.json({ success: true, formas: data || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT — actualizar forma de pago (toggle activo, config, etc.)
export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth || !["superadmin", "admin"].includes(auth.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase
      .from("formas_pago")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

