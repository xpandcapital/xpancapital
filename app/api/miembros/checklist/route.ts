import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() { return createClient(supabaseUrl, supabaseServiceKey) }

const TOTAL_ITEMS = 17

function calcScore(items: Record<string, boolean>): number {
  const completados = Object.values(items).filter(v => v === true).length
  return Math.round((completados / TOTAL_ITEMS) * 100)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const fecha = searchParams.get('fecha')
    const periodo = searchParams.get('periodo')

    if (!userId) return NextResponse.json({ error: 'user_id requerido' }, { status: 400 })

    if (fecha) {
      const { data, error } = await supabase
        .from('checklist_operativo').select('*').eq('user_id', userId).eq('fecha', fecha).maybeSingle()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, data: data || null })
    }

    let daysBack = 30
    if (periodo === '7d') daysBack = 7
    else if (periodo === '90d') daysBack = 90

    const since = new Date()
    since.setDate(since.getDate() - daysBack)

    const { data, error } = await supabase
      .from('checklist_operativo').select('*').eq('user_id', userId)
      .gte('fecha', since.toISOString().split('T')[0])
      .order('fecha', { ascending: true }).limit(366)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { user_id, fecha, items } = await request.json()
    if (!user_id || !fecha || !items) return NextResponse.json({ error: 'user_id, fecha e items requeridos' }, { status: 400 })

    const score = calcScore(items)

    const { data, error } = await supabase
      .from('checklist_operativo')
      .upsert({ user_id, fecha, items, score_cumplimiento: score }, { onConflict: 'user_id,fecha' })
      .select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
