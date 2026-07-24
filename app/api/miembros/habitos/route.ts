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
    const fecha = searchParams.get('fecha')

    if (!userId) return NextResponse.json({ error: 'user_id requerido' }, { status: 400 })

    if (fecha) {
      const { data, error } = await supabase
        .from('habitos_diarios').select('*').eq('user_id', userId).eq('fecha', fecha).maybeSingle()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, data: data || null })
    }

    const { data, error } = await supabase
      .from('habitos_diarios').select('*').eq('user_id', userId).order('fecha', { ascending: false }).limit(90)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { user_id, fecha, habitos } = await request.json()
    if (!user_id || !fecha) return NextResponse.json({ error: 'user_id y fecha requeridos' }, { status: 400 })

    const { data, error } = await supabase
      .from('habitos_diarios')
      .upsert({ user_id, fecha, habitos: habitos || [] }, { onConflict: 'user_id,fecha' })
      .select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
