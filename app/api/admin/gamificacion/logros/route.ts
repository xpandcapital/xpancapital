import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get('empresa_id')
    const id = searchParams.get('id')

    if (!empresaId) {
      return NextResponse.json({ success: false, error: 'empresa_id requerido' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (id) {
      const { data, error } = await supabase
        .from('gamificacion_logros')
        .select('*')
        .eq('id', id)
        .single()

      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
      return NextResponse.json({ success: true, data })
    }

    const { data, error } = await supabase
      .from('gamificacion_logros')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('creado_en', { ascending: true })

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { empresa_id, nombre, descripcion, icono_svg, imagen_url, tipo, condicion, puntos_bonus } = body

    if (!empresa_id || !nombre || !tipo || !condicion) {
      return NextResponse.json({ success: false, error: 'empresa_id, nombre, tipo y condicion requeridos' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('gamificacion_logros')
      .insert({
        empresa_id,
        nombre,
        descripcion,
        icono_svg,
        imagen_url,
        tipo,
        condicion,
        puntos_bonus: puntos_bonus || 0,
      })
      .select('*')
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'id requerido' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('gamificacion_logros')
      .update({ ...updates, actualizado_en: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'id requerido' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error } = await supabase
      .from('gamificacion_logros')
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, data: { eliminado: true } })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
