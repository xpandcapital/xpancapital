import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  const empresaId = searchParams.get('empresa_id') || DEFAULT_EMPRESA_ID

  if (!q || q.length < 2) {
    return NextResponse.json({ success: true, results: [] })
  }

  try {
    const supabase = getAdminClient()
    const pattern = `%${q}%`

    const [productos, clientes, leads, blog, proyectos] = await Promise.allSettled([
      supabase.from('productos').select('id,nombre,precio_usd,imagen_principal').eq('empresa_id', empresaId).ilike('nombre', pattern).limit(5),
      supabase.from('profiles').select('id,nombre,email').eq('empresa_id', empresaId).ilike('nombre', pattern).limit(5),
      supabase.from('leads').select('id,nombre,email,estado').eq('empresa_id', empresaId).ilike('nombre', pattern).limit(5),
      supabase.from('blog_posts').select('id,titulo,estado').eq('empresa_id', empresaId).ilike('titulo', pattern).limit(5),
      supabase.from('projects').select('id,name,status').eq('empresa_id', empresaId).ilike('name', pattern).limit(5),
    ])

    const results: Record<string, any[]> = {}

    if (productos.status === 'fulfilled' && !productos.value.error && productos.value.data) {
      results.productos = productos.value.data.map((p: any) => ({
        id: p.id,
        title: p.nombre,
        subtitle: p.precio_usd ? `$${p.precio_usd}` : undefined,
        url: `/superadmin/productos?id=${p.id}`,
        image: p.imagen_principal || undefined,
      }))
    }

    if (clientes.status === 'fulfilled' && !clientes.value.error && clientes.value.data) {
      results.clientes = clientes.value.data.map((c: any) => ({
        id: c.id,
        title: c.nombre || c.email,
        subtitle: c.email || undefined,
        url: `/superadmin/clientes/${c.id}`,
      }))
    }

    if (leads.status === 'fulfilled' && !leads.value.error && leads.value.data) {
      results.leads = leads.value.data.map((l: any) => ({
        id: l.id,
        title: l.nombre,
        subtitle: l.email || l.estado || undefined,
        url: `/superadmin/leads?id=${l.id}`,
      }))
    }

    if (blog.status === 'fulfilled' && !blog.value.error && blog.value.data) {
      results.blog = blog.value.data.map((b: any) => ({
        id: b.id,
        title: b.titulo,
        subtitle: b.estado || undefined,
        url: `/superadmin/blog/crear?id=${b.id}`,
      }))
    }

    if (proyectos.status === 'fulfilled' && !proyectos.value.error && proyectos.value.data) {
      results.proyectos = proyectos.value.data.map((pr: any) => ({
        id: pr.id,
        title: pr.name,
        subtitle: pr.status || undefined,
        url: `/superadmin/proyectos/${pr.id}`,
      }))
    }

    return NextResponse.json({ success: true, results })
  } catch {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
