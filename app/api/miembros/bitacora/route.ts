export const dynamic = 'force-dynamic'

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
    const userId = searchParams.get('user_id')
    const id = searchParams.get('id')

    if (id) {
      const { data, error } = await supabase
        .from('bitacora_trading')
        .select('*')
        .eq('id', id)
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, data })
    }

    if (!userId) {
      return NextResponse.json({ error: 'user_id es requerido' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('bitacora_trading')
      .select('*')
      .eq('user_id', userId)
      .order('creado_en', { ascending: false })
      .limit(200)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { user_id, ...fields } = body

    if (!user_id || !fields.fecha_inicio || !fields.accion) {
      return NextResponse.json({ error: 'user_id, fecha_inicio y accion son requeridos' }, { status: 400 })
    }

    const insertData: Record<string, any> = {
      user_id,
      fecha_inicio: fields.fecha_inicio,
      accion: fields.accion,
      fecha_fin: fields.fecha_fin || null,
      hora: fields.hora || null,
      divisa_1: fields.divisa_1 || null,
      divisa_2: fields.divisa_2 || null,
      riesgo_beneficio: fields.riesgo_beneficio || null,
      lotaje: fields.lotaje || null,
      perdidas_pips: fields.perdidas_pips || null,
      ganancias_pips: fields.ganancias_pips || null,
      tipo_cierre: fields.tipo_cierre || null,
      resultado_usd: fields.resultado_usd ?? null,
      emociones: fields.emociones || null,
      plan_trading: fields.plan_trading ?? null,
      observacion: fields.observacion || null,
    }

    const { data, error } = await supabase
      .from('bitacora_trading')
      .insert(insertData)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { id, ...fields } = body

    if (!id) {
      return NextResponse.json({ error: 'id es requerido' }, { status: 400 })
    }

    const updateData: Record<string, any> = {}
    const cols = ['fecha_inicio', 'fecha_fin', 'hora', 'accion', 'divisa_1', 'divisa_2',
      'riesgo_beneficio', 'lotaje', 'perdidas_pips', 'ganancias_pips', 'tipo_cierre',
      'resultado_usd', 'emociones', 'plan_trading', 'observacion']
    for (const col of cols) {
      if (col in fields) updateData[col] = fields[col]
    }

    const { data, error } = await supabase
      .from('bitacora_trading')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    const { error } = await supabase.from('bitacora_trading').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

