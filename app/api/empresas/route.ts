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
// GET - Obtener empresa por slug o ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const id = searchParams.get('id')

    let query = supabase
      .from('empresas')
      .select('*, config:empresa_config(*)')

    if (id) {
      query = query.eq('id', id)
    } else if (slug) {
      query = query.eq('slug', slug)
    } else {
      // Default: obtener la primera empresa activa
      query = query.eq('activo', true).limit(1)
    }

    const { data, error } = await query.single()

    if (error) {
      // Si no hay empresas, retornar datos por defecto
      if (error.code === 'PGRST116') {
        return NextResponse.json({ 
          success: true, 
          data: {
            id: 'default',
            slug: 'blis-corp',
            nombre: 'BLIS Corp',
            color_primario: '#B10D24',
            color_secundario: '#000000',
            color_acento: '#10B981',
            config: {
              blog_activo: true,
              tienda_activa: true,
              academia_activa: false,
              referidos_activo: true,
              bliscoins_activo: true,
              coins_por_lectura: 5,
              segundos_lectura: 60,
              coins_registro: 100,
              coins_referido: 50
            }
          }
        })
      }
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
