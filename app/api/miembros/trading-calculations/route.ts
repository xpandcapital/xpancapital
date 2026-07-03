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

    if (!userId) {
      return NextResponse.json({ error: 'user_id es requerido' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('trading_calculations')
      .select('*')
      .eq('user_id', userId)
      .order('creado_en', { ascending: false })
      .limit(50)

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
    const {
      user_id, capital, account_currency, currency_pair,
      risk_ratio, stop_loss_pips, riesgo_pct, riesgo_usd, lotes, nota
    } = body

    if (!user_id || !capital) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const insertData: Record<string, any> = {
      user_id,
      capital,
      account_currency: account_currency || 'USD',
      currency_pair: currency_pair || null,
      riesgo_pct: riesgo_pct || risk_ratio || 0,
      riesgo_usd: riesgo_usd || 0,
      lotes: lotes || 0,
      stop_loss_pips: stop_loss_pips || null,
      nota: nota || null,
    }

    const { data, error } = await supabase
      .from('trading_calculations')
      .insert(insertData)
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

    const { error } = await supabase.from('trading_calculations').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
