import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

function stripAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const rawQ = searchParams.get('q')?.trim()
  const empresaId = searchParams.get('empresa_id') || DEFAULT_EMPRESA_ID

  if (!rawQ || rawQ.length < 2) {
    return NextResponse.json({ success: true, results: {}, query: rawQ || '' })
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ success: false, error: 'Configuración del servidor incompleta' }, { status: 500 })
  }

  const q = stripAccents(rawQ.toLowerCase()).replace(/[^a-z0-9]/g, ' ').trim()
  if (q.length < 2) {
    return NextResponse.json({ success: true, results: {}, query: rawQ })
  }

  const pattern = `%${q}%`

  try {
    const supabase = getAdminClient()

    // ── Productos ──
    const { data: productos, error: errProd } = await supabase
      .from('productos')
      .select('id,nombre,descripcion,precio_usd,imagen_principal,slug')
      .eq('empresa_id', empresaId)
      .eq('activo', true)
      .ilike('nombre', pattern)
      .limit(8)

    // ── Clientes (profiles) ──
    const { data: clientes, error: errCli } = await supabase
      .from('profiles')
      .select('id,nombre,email,profilepic')
      .eq('empresa_id', empresaId)
      .ilike('nombre', pattern)
      .limit(8)

    // ── Leads ──
    const { data: leads, error: errLead } = await supabase
      .from('leads')
      .select('id,nombre,email,estado')
      .eq('empresa_id', empresaId)
      .ilike('nombre', pattern)
      .limit(8)

    // ── Blog ──
    const { data: blog, error: errBlog } = await supabase
      .from('blog_posts')
      .select('id,titulo,slug,estado,extracto,imagen_url')
      .eq('empresa_id', empresaId)
      .ilike('titulo', pattern)
      .limit(8)

    // ── Proyectos ──
    const { data: proyectos, error: errProy } = await supabase
      .from('projects')
      .select('id,name,status,description,cover_image')
      .eq('empresa_id', empresaId)
      .ilike('name', pattern)
      .limit(8)

    // ── Cursos ──
    const { data: cursos, error: errCurso } = await supabase
      .from('cursos')
      .select('id,nombre,descripcion,imagen_principal,slug')
      .ilike('nombre', pattern)
      .limit(8)

    // ── Templates ──
    const { data: templates, error: errTpl } = await supabase
      .from('templates')
      .select('id,nombre,slug,tipo_contenido,estado,thumbnail_url')
      .eq('empresa_id', empresaId)
      .ilike('nombre', pattern)
      .limit(8)

    const errors: string[] = []
    if (errProd) errors.push(`productos: ${errProd.message}`)
    if (errCli)  errors.push(`clientes: ${errCli.message}`)
    if (errLead) errors.push(`leads: ${errLead.message}`)
    if (errBlog) errors.push(`blog: ${errBlog.message}`)
    if (errProy) errors.push(`proyectos: ${errProy.message}`)
    if (errCurso) errors.push(`cursos: ${errCurso.message}`)
    if (errTpl)  errors.push(`templates: ${errTpl.message}`)
    if (errors.length > 0) {
      console.error(`[Search API] Errores "${rawQ}" → "${q}": ${errors.join('; ')}`)
    }

    const results: Record<string, any[]> = {}

    if (productos && productos.length > 0) {
      results.productos = productos.map((p: any) => ({
        id: p.id,
        title: p.nombre,
        subtitle: p.precio_usd ? `USD ${p.precio_usd}` : (p.descripcion?.slice(0, 60) || ''),
        url: `/superadmin/productos?id=${p.id}`,
        image: p.imagen_principal || undefined,
      }))
    }

    if (clientes && clientes.length > 0) {
      results.clientes = clientes.map((c: any) => ({
        id: c.id,
        title: c.nombre || c.email,
        subtitle: c.email || '',
        url: `/superadmin/clientes/${c.id}`,
        image: c.profilepic || undefined,
      }))
    }

    if (leads && leads.length > 0) {
      results.leads = leads.map((l: any) => ({
        id: l.id,
        title: l.nombre,
        subtitle: `${l.email || 'Sin email'} · ${l.estado || 'nuevo'}`,
        url: `/superadmin/leads?id=${l.id}`,
        image: undefined as string | undefined,
      }))
    }

    if (blog && blog.length > 0) {
      results.blog = blog.map((b: any) => ({
        id: b.id,
        title: b.titulo,
        subtitle: b.extracto?.slice(0, 80) || b.estado || '',
        url: `/superadmin/blog/crear?id=${b.id}`,
        image: b.imagen_url || undefined,
      }))
    }

    if (proyectos && proyectos.length > 0) {
      results.proyectos = proyectos.map((p: any) => ({
        id: p.id,
        title: p.name,
        subtitle: p.status || '',
        url: `/superadmin/proyectos/${p.id}`,
        image: p.cover_image || undefined,
      }))
    }

    if (cursos && cursos.length > 0) {
      results.cursos = cursos.map((c: any) => ({
        id: c.id,
        title: c.nombre,
        subtitle: c.descripcion?.slice(0, 60) || '',
        url: `/superadmin/cursos?id=${c.id}`,
        image: c.imagen_principal || undefined,
      }))
    }

    if (templates && templates.length > 0) {
      results.templates = templates.map((t: any) => ({
        id: t.id,
        title: t.nombre,
        subtitle: `${t.tipo_contenido || 'pagina'} · ${t.estado || 'borrador'}`,
        url: `/superadmin/templates?id=${t.id}`,
        image: t.thumbnail_url || undefined,
      }))
    }

    return NextResponse.json({ success: true, results, query: rawQ })
  } catch (err) {
    console.error('[Search API] Error fatal:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
