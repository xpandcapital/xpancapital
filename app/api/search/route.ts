import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'


const TABLES = [
  { table: 'productos',   key: 'productos' },
  { table: 'blog_posts',  key: 'blog' },
  { table: 'projects',    key: 'proyectos' },
  { table: 'profiles',    key: 'clientes' },
  { table: 'leads',       key: 'leads' },
  { table: 'cursos',      key: 'cursos' },
  { table: 'templates',   key: 'templates' },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  const empresaId = searchParams.get('empresa_id') || DEFAULT_EMPRESA_ID

  if (!q || q.length < 2) {
    return NextResponse.json({ success: true, results: {}, query: q || '' })
  }

  try {
    const results: Record<string, any[]> = {}

    const rpcs = await Promise.allSettled(
      TABLES.map(({ table }) =>
        supabase.rpc('search_table', {
          p_table: table,
          p_query: q.toLowerCase(),
          p_empresa_id: empresaId,
        })
      )
    )

    for (let i = 0; i < TABLES.length; i++) {
      const { key } = TABLES[i]
      const r = rpcs[i]

      if (r.status === 'rejected') {
        console.error(`[Search API] ${key} rechazado:`, String(r.reason).slice(0, 150))
        continue
      }

      if (r.value.error) {
        console.error(`[Search API] ${key} error:`, r.value.error.message)
        continue
      }

      const data = r.value.data
      if (data && Array.isArray(data) && data.length > 0) {
        results[key] = data
      }
    }

    return NextResponse.json({ success: true, results, query: q })
  } catch (err) {
    console.error('[Search API] Fatal:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
