import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() { return createClient(supabaseUrl, supabaseServiceKey) }

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    if (!userId) return NextResponse.json({ error: 'user_id requerido' }, { status: 400 })

    // Auto-crear hábitos fijos si no existen
    const FIJOS = [
      { id: 'player_time', label: 'Player Time', icon: '▶️' },
      { id: 'meditation', label: 'Meditation', icon: '🧘' },
      { id: 'journal', label: 'Journal', icon: '📝' },
      { id: 'eod_markup', label: 'EOD Markup', icon: '📊' },
      { id: 'podcast', label: 'Podcast', icon: '🎧' },
      { id: 'read', label: 'Read', icon: '📖' },
      { id: 'read_bible', label: 'Read The Bible', icon: '📜' },
      { id: 'workout', label: 'Workout', icon: '🏋️' },
    ]

    const { data: existing } = await supabase.from('habitos_personalizados').select('label').eq('user_id', userId).eq('es_personalizado', false)
    if (!existing || existing.length === 0) {
      const inserts = FIJOS.map(h => ({ user_id: userId, label: h.label, icon: h.icon, activo: true, es_personalizado: false }))
      await supabase.from('habitos_personalizados').insert(inserts)
    }

    const { data, error } = await supabase.from('habitos_personalizados').select('*').eq('user_id', userId).order('creado_en', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data: data || [] })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { user_id, label, icon, activo } = await request.json()
    if (!user_id || !label) return NextResponse.json({ error: 'user_id y label requeridos' }, { status: 400 })
    const { data, error } = await supabase.from('habitos_personalizados').insert({ user_id, label, icon: icon || '✅', activo: activo !== false, es_personalizado: true }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { id, activo, label, icon } = await request.json()
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
    const update: Record<string, any> = {}
    if (activo !== undefined) update.activo = activo
    if (label !== undefined) update.label = label
    if (icon !== undefined) update.icon = icon
    const { data, error } = await supabase.from('habitos_personalizados').update(update).eq('id', id).select().single()
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
    const { error } = await supabase.from('habitos_personalizados').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}
