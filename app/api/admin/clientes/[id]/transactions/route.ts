import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase()
    const userId = params.id

    const { data, error } = await supabase
      .from('boveda_transacciones')
      .select('*')
      .eq('user_id', userId)
      .order('creado_en', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const transactions = (data || []).map(t => ({
      id: t.id,
      type: t.tipo,
      amount: t.monto,
      description: t.descripcion || '',
      balance: t.balance_despues,
      date: t.creado_en
    }))

    return NextResponse.json({ success: true, data: transactions })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
