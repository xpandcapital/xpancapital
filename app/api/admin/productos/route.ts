import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    const categoriaId = searchParams.get('categoria_id')

    let query = supabase
      .from('productos')
      .select(`
        id,
        nombre,
        imagen_principal,
        tipo,
        categoria:producto_categorias(id, nombre)
      `)
      .eq('activo', true)

    if (tipo) {
      query = query.eq('tipo', tipo)
    }

    if (categoriaId) {
      query = query.eq('categoria_id', categoriaId)
    }

    const { data, error } = await query.order('nombre', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
