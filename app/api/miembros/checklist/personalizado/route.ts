import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() { return createClient(supabaseUrl, supabaseServiceKey) }

const FIJOS = [
  { id: 'despierta_4am', label: 'Despierta a las 4:00 AM Constantemente', seccion: 'Pre-Session (Antes)', icon: '🌅' },
  { id: 'ducha_fria', label: 'Tomar una Ducha Fría', seccion: 'Pre-Session (Antes)', icon: '🚿' },
  { id: 'batido_verde', label: 'Batido Verde + Café + Suplementos', seccion: 'Pre-Session (Antes)', icon: '🥤' },
  { id: 'orar_30min', label: 'Orar por 30 Minutos', seccion: 'Pre-Session (Antes)', icon: '🙏' },
  { id: 'revisar_eod', label: 'Revisar análisis EOD del día anterior...', seccion: 'Pre-Session (Antes)', icon: '📋' },
  { id: 'lucha_huida', label: 'Comprobación de lucha o huida', seccion: 'Pre-Session (Antes)', icon: '⚔️' },
  { id: 'noticias_impacto', label: 'Consulta de Noticias de Alto Impacto', seccion: 'In-Session (En Sesión)', icon: '📰' },
  { id: 'eliminar_distracciones', label: 'Elimine y Minimice las Distracciones', seccion: 'In-Session (En Sesión)', icon: '🚫' },
  { id: 'marcas_graficos', label: 'Marcas de Gráficos Frescas Cada Mañana', seccion: 'In-Session (En Sesión)', icon: '📈' },
  { id: 'alertas_sesion', label: 'Establezca Alertas + Sesión Comercial', seccion: 'In-Session (En Sesión)', icon: '🔔' },
  { id: 'journal_trades', label: 'Journal Trades in Notion + Diario en Papel', seccion: 'In-Session (En Sesión)', icon: '📝' },
  { id: 'informe_diario', label: 'Informe Diario + Entrada de Diario en Papel', seccion: 'Post-Session (Después)', icon: '📊' },
  { id: 'estudio_contenido', label: 'Estudio (Contenido de Video / Estudios de Casos...)', seccion: 'Post-Session (Después)', icon: '📚' },
  { id: 'gym_estiramientos', label: 'Gym / Estiramientos + Batido de Proteínas', seccion: 'Post-Session (Después)', icon: '🏋️' },
  { id: 'leer_30_60min', label: 'Leer durante 30-60 minutos', seccion: 'Post-Session (Después)', icon: '📖' },
  { id: 'relax_1_2horas', label: 'Asigne 1-2 horas para Relajarse', seccion: 'End of Day (Fuera Del Trading)', icon: '🧘' },
  { id: 'cama_9pm', label: 'En la Cama a las 9:00 p.m. en Punto', seccion: 'End of Day (Fuera Del Trading)', icon: '😴' },
]

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    if (!userId) return NextResponse.json({ error: 'user_id requerido' }, { status: 400 })

    const { data: existing } = await supabase.from('checklist_personalizado').select('label').eq('user_id', userId).eq('es_personalizado', false)
    if (!existing || existing.length === 0) {
      const inserts = FIJOS.map(h => ({ user_id: userId, label: h.label, seccion: h.seccion, icon: h.icon, activo: true, es_personalizado: false }))
      await supabase.from('checklist_personalizado').insert(inserts)
    }

    const { data, error } = await supabase.from('checklist_personalizado').select('*').eq('user_id', userId).order('creado_en', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data: data || [] })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { user_id, label, seccion, icon, activo } = await request.json()
    if (!user_id || !label || !seccion) return NextResponse.json({ error: 'user_id, label y seccion requeridos' }, { status: 400 })
    const { data, error } = await supabase.from('checklist_personalizado').insert({ user_id, label, seccion, icon: icon || '✅', activo: activo !== false, es_personalizado: true }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { id, activo, label, seccion, icon } = await request.json()
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
    const update: Record<string, any> = {}
    if (activo !== undefined) update.activo = activo
    if (label !== undefined) update.label = label
    if (seccion !== undefined) update.seccion = seccion
    if (icon !== undefined) update.icon = icon
    const { data, error } = await supabase.from('checklist_personalizado').update(update).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
    const { error } = await supabase.from('checklist_personalizado').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}
