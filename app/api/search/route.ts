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
    return NextResponse.json({ success: true, results: {} })
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[Search API] Missing Supabase ENV vars')
    return NextResponse.json({ success: false, error: 'Configuración del servidor incompleta' }, { status: 500 })
  }

  try {
    const supabase = getAdminClient()
    const pattern = `%${q}%`

    const [productos, clientes, leads, blog, proyectos] = await Promise.allSettled([
      supabase.from('productos')
        .select('id,nombre,precio_usd,imagen_principal')
        .eq('empresa_id', empresaId)
        .or(`nombre.ilike.*${q}*,descripcion.ilike.*${q}*`)
        .limit(5),
      supabase.from('profiles')
        .select('id,nombre,email')
        .eq('empresa_id', empresaId)
        .or(`nombre.ilike.*${q}*,email.ilike.*${q}*`)
        .limit(5),
      supabase.from('leads')
        .select('id,nombre,email,estado')
        .eq('empresa_id', empresaId)
        .or(`nombre.ilike.*${q}*,email.ilike.*${q}*`)
        .limit(5),
      supabase.from('blog_posts')
        .select('id,titulo,slug,estado')
        .eq('empresa_id', empresaId)
        .or(`titulo.ilike.*${q}*,contenido.ilike.*${q}*,extracto.ilike.*${q}*`)
        .limit(5),
      supabase.from('projects')
        .select('id,name,status')
        .eq('empresa_id', empresaId)
        .or(`name.ilike.*${q}*,description.ilike.*${q}*`)
        .limit(5),
    ])

    const failures = [
      { name: 'productos', result: productos },
      { name: 'clientes', result: clientes },
      { name: 'leads', result: leads },
      { name: 'blog', result: blog },
      { name: 'proyectos', result: proyectos },
    ].filter(f => f.result.status === 'rejected' || f.result.value?.error)

    if (failures.length > 0) {
      console.error('[Search API] Fallos:', JSON.stringify(failures.map(f => ({
        name: f.name,
        error: f.result.status === 'rejected'
          ? String(f.result.reason)
          : JSON.stringify(f.result.value?.error)
      }))))
    }

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
  } catch (err) {
    console.error('[Search API] Error general:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
