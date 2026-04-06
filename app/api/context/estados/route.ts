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

    let query = supabase
      .from('producto_estados')
      .select('*')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .order('orden', { ascending: true })

    if (all !== 'true') {
      query = query.eq('activo', true)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    const { nombre, slug, color, icono, descripcion, orden, es_default } = body

    if (!nombre) {
      return NextResponse.json({ success: false, error: 'El nombre es requerido' }, { status: 400 })
    }

    const generatedSlug = slug || nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    // Si es_default es true, quitar default de los demás
    if (es_default) {
      await supabase
        .from('producto_estados')
        .update({ es_default: false })
        .eq('empresa_id', DEFAULT_EMPRESA_ID)
        .eq('es_default', true)
    }

    const { data, error } = await supabase
      .from('producto_estados')
      .insert({
        empresa_id: DEFAULT_EMPRESA_ID,
        nombre,
        slug: generatedSlug,
        color: color || '#71717a',
        icono,
        descripcion,
        orden: orden || 0,
        es_default: es_default || false,
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

    // Si es_default es true, quitar default de los demás
    if (updates.es_default) {
      await supabase
        .from('producto_estados')
        .update({ es_default: false })
        .eq('empresa_id', DEFAULT_EMPRESA_ID)
        .eq('es_default', true)
        .neq('id', id)
    }

    const { data, error } = await supabase
      .from('producto_estados')
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
      .from('producto_estados')
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