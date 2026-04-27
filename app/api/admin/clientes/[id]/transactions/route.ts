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
      return NextResponse.json({ success: true, data: [], error: error.message })
    }

    const transactions = (data || []).map((t: any) => ({
      id: t.id,
      type: t.tipo || t.type || 'Unknown',
      amount: t.monto || t.amount || 0,
      description: t.descripcion || t.description || '',
      balance: t.balance_despues || t.balance_after || 0,
      date: t.creado_en || t.created_at
    }))

    return NextResponse.json({ success: true, data: transactions })
  } catch (err: any) {
    return NextResponse.json({ success: true, data: [], error: err.message }, { status: 500 })
  }
}
