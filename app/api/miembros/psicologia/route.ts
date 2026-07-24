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
    const fecha = searchParams.get('fecha')
    const periodo = searchParams.get('periodo')
    const id = searchParams.get('id')

    if (id) {
      const { data, error } = await supabase
        .from('evaluacion_psicologica')
        .select('*')
        .eq('id', id)
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, data })
    }

    if (!userId) {
      return NextResponse.json({ error: 'user_id es requerido' }, { status: 400 })
    }

    // Evaluación de un día específico
    if (fecha) {
      const { data, error } = await supabase
        .from('evaluacion_psicologica')
        .select('*')
        .eq('user_id', userId)
        .eq('fecha', fecha)
        .maybeSingle()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, data: data || null })
    }

    // Historial para gráfica según periodo
    let daysBack = 30
    if (periodo === '7d') daysBack = 7
    else if (periodo === '90d') daysBack = 90
    else if (periodo === 'quarterly') daysBack = 90

    const since = new Date()
    since.setDate(since.getDate() - daysBack)

    const { data, error } = await supabase
      .from('evaluacion_psicologica')
      .select('*')
      .eq('user_id', userId)
      .gte('fecha', since.toISOString().split('T')[0])
      .order('fecha', { ascending: true })
      .limit(366)

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
    const { user_id, fecha, estado_emocional, presiones_externas, eventos_manana, puntaje_flujo } = body

    if (!user_id || !fecha) {
      return NextResponse.json({ error: 'user_id y fecha son requeridos' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('evaluacion_psicologica')
      .upsert({
        user_id,
        fecha,
        estado_emocional: estado_emocional || null,
        presiones_externas: presiones_externas || null,
        eventos_manana: eventos_manana || null,
        puntaje_flujo: puntaje_flujo || null,
      }, { onConflict: 'user_id,fecha' })
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

    if (!id) return NextResponse.json({ error: 'id es requerido' }, { status: 400 })

    const updateData: Record<string, unknown> = {}
    const cols = [
      'estado_emocional', 'presiones_externas', 'eventos_manana', 'puntaje_flujo',
      'perspectiva_diario', 'perspectiva_4h', 'perspectiva_15m',
      'resultado_diario', 'resultado_4h', 'resultado_15m',
      'perspectiva_correcta', 'operaciones_registradas', 'errores_cometidos',
      'es_falencia', 'rendimiento_general',
    ]
    for (const col of cols) {
      if (col in fields) updateData[col] = fields[col]
    }
    updateData.actualizado_en = new Date().toISOString()

    const { data, error } = await supabase
      .from('evaluacion_psicologica')
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
