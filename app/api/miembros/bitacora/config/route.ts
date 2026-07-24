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

    const { data, error } = await supabase
      .from('bitacora_config').select('*').eq('user_id', userId).maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data: data || { user_id: userId, saldo_inicial: 10000.00 } })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { user_id, saldo_inicial } = await request.json()
    if (!user_id || saldo_inicial === undefined) return NextResponse.json({ error: 'user_id y saldo_inicial requeridos' }, { status: 400 })

    const { data, error } = await supabase
      .from('bitacora_config')
      .upsert({ user_id, saldo_inicial, actualizado_en: new Date().toISOString() }, { onConflict: 'user_id' })
      .select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
