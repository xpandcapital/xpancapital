import { NextRequest, NextResponse } from 'next/server'
import { supabase as sharedSupabase } from '@/lib/supabase/server'

function getSupabase() {
  return sharedSupabase
}

export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const params = await paramsPromise
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
