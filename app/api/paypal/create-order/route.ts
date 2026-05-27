import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decryptApiKey } from '@/lib/api-crypto'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'
import { createOrder } from '@/lib/paypal/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      empresa_id,
      user_id,
      nombre,
      email,
      productos,
      total_usd,
      tiene_fisicos,
      direccion_envio,
    } = body as {
      empresa_id?: string
      user_id?: string
      nombre: string
      email: string
      productos: Array<{
        producto_id: string; cantidad: number; precio_unitario: number; nombre: string; productType: string
      }>
      total_usd: number
      tiene_fisicos?: boolean
      direccion_envio?: unknown
    }

    if (!email || !productos?.length || !total_usd) {
      return NextResponse.json({ success: false, error: 'Faltan datos requeridos' }, { status: 400 })
    }

    const supabase = createClient()

    const { data: keys } = await supabase
      .from('api_keys')
      .select('key_name, key_value')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .eq('is_global', true)
      .in('key_name', ['paypal_client_id', 'paypal_secret'])

    const keyMap: Record<string, string> = {}
    for (const row of keys || []) {
      keyMap[row.key_name] = decryptApiKey(row.key_value || '')
    }

    const clientId = keyMap['paypal_client_id']
    const secret = keyMap['paypal_secret']

    if (!clientId || !secret) {
      return NextResponse.json({
        success: false,
        error: 'PayPal no está configurado. Agrega paypal_client_id y paypal_secret en API Nube.',
      }, { status: 500 })
    }

    const finalEmpresaId = empresa_id || DEFAULT_EMPRESA_ID

    const { data: orden, error: ordenError } = await supabase
      .from('compras')
      .insert({
        empresa_id: finalEmpresaId,
        user_id: user_id || null,
        producto_id: productos?.[0]?.producto_id || null,
        metodo_pago: 'paypal',
        monto_coins: 0,
        monto_usd: total_usd,
        moneda: 'USD',
        comision_generada: 0,
        comision_estado: 'pendiente',
        estado: 'pendiente',
        metadata: {
          productos,
          email_cliente: email.toLowerCase(),
          nombre_cliente: nombre,
          tiene_fisicos: tiene_fisicos || false,
          direccion_envio: direccion_envio || null,
        },
        creado_en: new Date().toISOString(),
      })
      .select()
      .single()

    if (ordenError || !orden) {
      console.error('[PayPal] Error creando orden:', ordenError)
      return NextResponse.json({ success: false, error: 'Error al crear la orden' }, { status: 500 })
    }

    if (productos?.length > 0) {
      const items = productos
        .map((p) => ({
          compra_id: orden.id,
          producto_id: p.producto_id,
          cantidad: p.cantidad || 1,
          precio_unitario: p.precio_unitario || 0,
          product_type: p.productType || 'digital',
        }))
        .filter((item) => item.producto_id)

      if (items.length > 0) {
        await supabase.from('compra_items').insert(items)
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
    const paypalItems = productos.map((p) => ({
      name: p.nombre || 'Producto',
      quantity: String(p.cantidad || 1),
      unit_amount: { currency_code: 'USD', value: (p.precio_unitario || 0).toFixed(2) },
    }))

    const ppOrder = await createOrder(
      {
        totalUSD: total_usd,
        currency: 'USD',
        orderId: orden.id,
        items: paypalItems.slice(0, 10),
        returnUrl: `${siteUrl}/tienda/checkout`,
        cancelUrl: `${siteUrl}/tienda/checkout`,
      },
      clientId,
      secret
    )

    if (!ppOrder.id) {
      return NextResponse.json({ success: false, error: 'Error al crear la orden en PayPal' }, { status: 502 })
    }

    await supabase
      .from('compras')
      .update({ transaction_id: ppOrder.id, metadata: { ...(orden.metadata as Record<string, unknown>), paypal_order_id: ppOrder.id } })
      .eq('id', orden.id)

    return NextResponse.json({ success: true, orderID: ppOrder.id, ordenId: orden.id, clientId })
  } catch (err) {
    console.error('[PayPal] Error en create-order:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
