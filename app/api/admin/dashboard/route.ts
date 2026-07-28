import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/server"
import { DEFAULT_EMPRESA_ID } from "@/lib/empresa"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const empresaId = DEFAULT_EMPRESA_ID

    const [
      rEmpresa, rProdCount, rCliCount, rBlogCount, rLeadsTotal,
      rProjectsData, rComprasData, rLastLeads, rLastCompras, rLastPosts,
    ] = await Promise.all([
      supabase.from("empresas").select("id, nombre").eq("id", empresaId).single(),
      supabase.from("productos").select("id", { count: "exact", head: true }).eq("empresa_id", empresaId).eq("activo", true),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("empresa_id", empresaId).neq("rol", "superadmin").neq("rol", "admin"),
      supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("empresa_id", empresaId),
      supabase.from("leads").select("id", { count: "exact", head: true }).eq("empresa_id", empresaId),
      supabase.from("projects").select("id").eq("empresa_id", empresaId).eq("is_active", true),
      supabase.from("compras").select("id, monto_usd, estado, creado_en, user_id").eq("estado", "completado").order("creado_en", { ascending: false }).limit(100),
      supabase.from("leads").select("id, nombre, email, creado_en, estado").eq("empresa_id", empresaId).order("creado_en", { ascending: false }).limit(5),
      supabase.from("compras").select("id, monto_usd, estado, creado_en, user_id").order("creado_en", { ascending: false }).limit(5),
      supabase.from("blog_posts").select("id, titulo, creado_en, estado").eq("empresa_id", empresaId).order("creado_en", { ascending: false }).limit(5),
    ])

    return NextResponse.json({
      success: true,
      empresa: rEmpresa.data,
      prodCount: rProdCount.count || 0,
      cliCount: rCliCount.count || 0,
      blogCount: rBlogCount.count || 0,
      leadsCount: rLeadsTotal.count || 0,
      projectsCount: (rProjectsData.data || []).length,
      compras: rComprasData.data || [],
      lastLeads: rLastLeads.data || [],
      lastCompras: rLastCompras.data || [],
      lastPosts: rLastPosts.data || [],
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
