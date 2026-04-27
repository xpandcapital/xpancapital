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

    const { data: compras, error } = await supabase
      .from('compras')
      .select(`
        id,
        estado,
        monto_usd,
        monto_coins,
        metodo_pago,
        creado_en
      `)
      .eq('user_id', userId)
      .order('creado_en', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ success: true, data: [], error: error.message })
    }

    const orders = (compras || []).map(c => ({
      id: c.id,
      date: c.creado_en,
      items: 1,
      total: c.monto_usd || c.monto_coins || 0,
      status: c.estado === 'completado' ? 'Pagado' : c.estado,
      type: 'Venta' as const
    }))

    return NextResponse.json({ success: true, data: orders })
  } catch (err: any) {
    return NextResponse.json({ success: true, data: [], error: err.message }, { status: 500 })
  }
}
