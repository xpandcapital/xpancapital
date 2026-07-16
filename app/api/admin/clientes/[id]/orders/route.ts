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

    const { data: compras, error } = await supabase
      .from('compras')
      .select(`
        id,
        estado,
        monto_usd,
        monto_coins,
        metodo_pago,
        creado_en,
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
      .limit(50)

    if (error) {
      return NextResponse.json({ success: true, data: [], error: error.message })
    }

    const orders = (compras || []).map(c => {
      const itemsList = c.items || [];
      const totalItems = itemsList.length || 1;
      const products = itemsList.map((i: any) => ({
        name: i.producto?.nombre || 'Producto',
        quantity: i.cantidad,
        price: i.precio_unitario
      }));

      return {
        id: c.id,
        date: c.creado_en,
        items: totalItems,
        total: c.monto_usd || c.monto_coins || 0,
        status: c.estado === 'completado' ? 'Pagado' : c.estado,
        type: 'Venta' as const,
        products
      };
    })

    return NextResponse.json({ success: true, data: orders })
  } catch (err: any) {
    return NextResponse.json({ success: true, data: [], error: err.message }, { status: 500 })
  }
}
