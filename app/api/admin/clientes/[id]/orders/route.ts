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
        created_at,
        items:compra_items(
          cantidad,
          precio_unitario,
          producto:productos(
            id,
            nombre,
            imagen_principal,
            tipo
          )
        )
      `)
      .eq('user_id', userId)
      .order('creado_en', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const orders = (compras || []).map(c => ({
      id: c.id,
      date: c.creado_en,
      items: (c.items || []).map((i: any) => ({
        id: i.producto?.id,
        name: i.producto?.nombre,
        image: i.producto?.imagen_principal,
        quantity: i.cantidad,
        price: i.precio_unitario
      })),
      total: c.monto_usd || c.monto_coins,
      status: c.estado,
      type: c.metodo_pago === 'coins' ? 'Canje' : 'Venta'
    }))

    return NextResponse.json({ success: true, data: orders })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
