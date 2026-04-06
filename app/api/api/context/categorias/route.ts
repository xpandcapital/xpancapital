import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all')

    console.log('📊 Fetching categories for empresa:', DEFAULT_EMPRESA_ID)

    let query = supabase
      .from('producto_categorias')
      .select('*')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .order('orden', { ascending: true })

    if (all !== 'true') {
      query = query.eq('activo', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Error fetching categories:', error)
      return NextResponse.json({ success: false, error: error.message, details: error }, { status: 500 })
    }

    console.log('✅ Categories fetched:', data?.length || 0)
    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('❌ Unexpected error:', err)
    return NextResponse.json({ success: false, error: 'Error del servidor', details: String(err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    const { nombre, slug, descripcion, icono, color, sku_prefix, orden } = body

    if (!nombre) {
      return NextResponse.json({ success: false, error: 'El nombre es requerido' }, { status: 400 })
    }

    const generatedSlug = slug || nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const { data, error } = await supabase
      .from('producto_categorias')
      .insert({
        empresa_id: DEFAULT_EMPRESA_ID,
        nombre,
        slug: generatedSlug,
        descripcion,
        icono,
        color: color || '#71717a',
        sku_prefix: sku_prefix || generatedSlug.substring(0, 3).toUpperCase(),
        orden: orden || 0,
        activo: true
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID es requerido' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('producto_categorias')
      .update(updates)
      .eq('id', id)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID es requerido' }, { status: 400 })
    }

    const { error } = await supabase
      .from('producto_categorias')
      .delete()
      .eq('id', id)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}