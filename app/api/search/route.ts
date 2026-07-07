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

  const q = stripAccents(rawQ.toLowerCase()).replace(/[^a-z0-9\s]/g, ' ').trim()
  if (q.length < 2) {
    return NextResponse.json({ success: true, results: {}, query: rawQ })
  }

  try {
    const supabase = getAdminClient()

    const queries = [
      {
        key: 'productos',
        run: () => supabase.from('productos')
          .select('id,nombre,descripcion,precio_usd,imagen_principal,slug')
          .eq('empresa_id', empresaId)
          .or(`nombre.ilike.%${q}%,descripcion.ilike.%${q}%`)
          .eq('activo', true)
          .limit(8),
        map: (p: any) => ({
          id: p.id,
          title: p.nombre,
          subtitle: p.precio_usd ? `USD ${p.precio_usd}` : (p.descripcion?.slice(0, 60) || ''),
          url: `/superadmin/productos?id=${p.id}`,
          image: p.imagen_principal || undefined,
        })
      },
      {
        key: 'clientes',
        run: () => supabase.from('profiles')
          .select('id,nombre,email,profilepic')
          .eq('empresa_id', empresaId)
          .or(`nombre.ilike.%${q}%,email.ilike.%${q}%`)
          .limit(8),
        map: (c: any) => ({
          id: c.id,
          title: c.nombre || c.email,
          subtitle: c.email || '',
          url: `/superadmin/clientes/${c.id}`,
          image: c.profilepic || undefined,
        })
      },
      {
        key: 'leads',
        run: () => supabase.from('leads')
          .select('id,nombre,email,estado')
          .eq('empresa_id', empresaId)
          .or(`nombre.ilike.%${q}%,email.ilike.%${q}%`)
          .limit(8),
        map: (l: any) => ({
          id: l.id,
          title: l.nombre,
          subtitle: `${l.email || 'Sin email'} · ${l.estado || 'nuevo'}`,
          url: `/superadmin/leads?id=${l.id}`,
          image: undefined as string | undefined,
        })
      },
      {
        key: 'blog',
        run: () => supabase.from('blog_posts')
          .select('id,titulo,slug,estado,extracto,imagen_url')
          .eq('empresa_id', empresaId)
          .or(`titulo.ilike.%${q}%,contenido.ilike.%${q}%,extracto.ilike.%${q}%`)
          .limit(8),
        map: (b: any) => ({
          id: b.id,
          title: b.titulo,
          subtitle: b.extracto?.slice(0, 80) || b.estado || '',
          url: `/superadmin/blog/crear?id=${b.id}`,
          image: b.imagen_url || undefined,
        })
      },
      {
        key: 'proyectos',
        run: () => supabase.from('projects')
          .select('id,name,status,description,cover_image')
          .eq('empresa_id', empresaId)
          .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
          .limit(8),
        map: (p: any) => ({
          id: p.id,
          title: p.name,
          subtitle: p.status || '',
          url: `/superadmin/proyectos/${p.id}`,
          image: p.cover_image || undefined,
        })
      },
      {
        key: 'cursos',
        run: () => supabase.from('cursos')
          .select('id,nombre,descripcion,imagen_principal,slug')
          .or(`nombre.ilike.%${q}%,descripcion.ilike.%${q}%`)
          .limit(8),
        map: (c: any) => ({
          id: c.id,
          title: c.nombre,
          subtitle: c.descripcion?.slice(0, 60) || '',
          url: `/superadmin/cursos?id=${c.id}`,
          image: c.imagen_principal || undefined,
        })
      },
      {
        key: 'templates',
        run: () => supabase.from('templates')
          .select('id,nombre,slug,tipo_contenido,estado,thumbnail_url')
          .eq('empresa_id', empresaId)
          .or(`nombre.ilike.%${q}%,slug.ilike.%${q}%`)
          .limit(8),
        map: (t: any) => ({
          id: t.id,
          title: t.nombre,
          subtitle: `${t.tipo_contenido || 'pagina'} · ${t.estado || 'borrador'}`,
          url: `/superadmin/templates?id=${t.id}`,
          image: t.thumbnail_url || undefined,
        })
      },
    ]

    const settled = await Promise.allSettled(queries.map(q => q.run()))

    const failures: string[] = []
    const results: Record<string, any[]> = {}

    for (let i = 0; i < queries.length; i++) {
      const q = queries[i]
      const s = settled[i]

      if (s.status === 'rejected') {
        failures.push(`${q.key}: ${String(s.reason).slice(0, 100)}`)
        continue
      }

      if (s.value.error) {
        failures.push(`${q.key}: ${JSON.stringify(s.value.error).slice(0, 200)}`)
        continue
      }

      const data = s.value.data
      if (data && data.length > 0) {
        results[q.key] = data.map(q.map)
      }
    }

    if (failures.length > 0) {
      console.error(`[Search API] Query failures for "${rawQ}" → "${q}": ${failures.join(' | ')}`)
    }

    return NextResponse.json({ success: true, results, query: rawQ })
  } catch (err) {
    console.error('[Search API] Fatal error:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
