import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

let _cachedSupabase: ReturnType<typeof createClient> | null = null
function getSupabase() {
  if (_cachedSupabase) return _cachedSupabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  _cachedSupabase = createClient(supabaseUrl, supabaseServiceKey)
  return _cachedSupabase
}

const supabase = new Proxy({} as any, {
  get(_: any, prop: string) {
    return getSupabase()[prop]
  }
})
// GET - Listar categorías
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get('empresa_id')

    if (!empresaId) {
      // Retornar categorías por defecto si no hay empresa_id
      return NextResponse.json({ 
        success: true, 
        data: [
          { id: '1', nombre: 'General', slug: 'general', icono: 'FileText', color: '#10B981' },
          { id: '2', nombre: 'Tutoriales', slug: 'tutoriales', icono: 'BookOpen', color: '#3B82F6' },
          { id: '3', nombre: 'Noticias', slug: 'noticias', icono: 'Newspaper', color: '#F59E0B' },
          { id: '4', nombre: 'Inversiones', slug: 'inversiones', icono: 'TrendingUp', color: '#8B5CF6' },
          { id: '5', nombre: 'PropTech', slug: 'proptech', icono: 'Building', color: '#EC4899' },
        ]
      })
    }

    const { data, error } = await supabase
      .from('blog_categorias')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('orden', { ascending: true })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// POST - Crear categoría
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { empresa_id, nombre, descripcion, icono, color } = body

    const slug = nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const { data, error } = await supabase
      .from('blog_categorias')
      .insert({
        empresa_id,
        nombre,
        slug,
        descripcion,
        icono: icono || 'FileText',
        color: color || '#10B981'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
