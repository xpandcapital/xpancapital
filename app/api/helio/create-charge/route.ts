import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decryptApiKey } from '@/lib/api-crypto'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'
import { createCharge } from '@/lib/helio/client'
import type { HelioPaymentMode } from '@/lib/helio/types'

async function getHelioConfig(supabase: ReturnType<typeof createClient>) {
  const { data: keys } = await supabase
    .from('api_keys')
    .select('key_name, key_value')
    .eq('empresa_id', DEFAULT_EMPRESA_ID)
    .eq('is_global', true)
    .in('key_name', ['helio_public_key', 'helio_secret_key', 'helio_paylink_id'])

  const map: Record<string, string> = {}
  for (const row of keys || []) {
    map[row.key_name] = decryptApiKey(row.key_value || '')
  }

  const publicKey = map['helio_public_key']
  const secretKey = map['helio_secret_key']
  const paylinkId = map['helio_paylink_id']

  if (!publicKey || !secretKey || !paylinkId) return null

  return { publicKey, secretKey, paylinkId, webhookSecret: secretKey }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      empresa_id,
      user_id,
      nombre,
      email,
      telefono,
      productos,
      mode,
      monto_usd,
      tiene_fisicos,
      direccion_envio,
    } = body as {
      empresa_id?: string
      user_id?: string
      nombre: string
      email: string
      telefono?: string
      productos: Array<{
        producto_id: string
        cantidad: number
        precio_unitario: number
        nombre: string
        productType: string
      }>
      mode: HelioPaymentMode
      monto_usd: number
      tiene_fisicos?: boolean
      direccion_envio?: unknown
    }

    if (!email || !productos?.length || !mode) {
      return NextResponse.json({ success: false, error: 'Faltan datos requeridos' }, { status: 400 })
    }

    if (!['card', 'crypto'].includes(mode)) {
      return NextResponse.json({ success: false, error: 'Modo de pago inválido' }, { status: 400 })
    }

    const supabase = createClient()
    const config = await getHelioConfig(supabase)

    if (!config) {
      return NextResponse.json({
        success: false,
        error: 'Hel.io no está configurado. Agrega helio_public_key, helio_secret_key y helio_paylink_id en API Nube.',
      }, { status: 500 })
    }

    const finalEmpresaId = empresa_id || DEFAULT_EMPRESA_ID
    const totalStr = monto_usd.toFixed(2)

    const { data: orden, error: ordenError } = await supabase
      .from('compras')
      .insert({
        empresa_id: finalEmpresaId,
        user_id: user_id || null,
        producto_id: productos?.[0]?.producto_id || null,
        metodo_pago: mode === 'card' ? 'helio_card' : 'helio_crypto',
        monto_coins: 0,
        monto_usd: monto_usd,
        estado: 'pendiente',
        metadata: {
          productos,
          email_cliente: email.toLowerCase(),
          nombre_cliente: nombre,
          telefono_cliente: telefono,
          tiene_fisicos: tiene_fisicos || false,
          direccion_envio: direccion_envio || null,
          helio_mode: mode,
        },
        creado_en: new Date().toISOString(),
      })
      .select()
      .single()

    if (ordenError || !orden) {
      console.error('[Helio] Error creando orden:', ordenError)
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
        const { error: itemsError } = await supabase.from('compra_items').insert(items)
        if (itemsError) console.error('[Helio] Error creando items:', itemsError)
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin

    const chargeResponse = await createCharge(
      {
        paylinkId: config.paylinkId,
        price: totalStr,
        successRedirectUrl: `${siteUrl}/tienda/checkout/status?order_id=${orden.id}`,
        additionalJson: {
          orderId: orden.id,
          mode,
          email: email.toLowerCase(),
        },
        customerDetails: {
          email: email.toLowerCase(),
          fullName: nombre,
          deliveryAddress: tiene_fisicos ? (direccion_envio as string) : undefined,
        },
      },
      config
    )

    if (!chargeResponse.url) {
      console.error('[Helio] Error creando charge:', chargeResponse)
      return NextResponse.json({
        success: false,
        error: chargeResponse.status === 'timeout'
          ? 'El servicio de pago no responde. Intenta de nuevo.'
          : 'Error al crear la sesión de pago en Hel.io',
      }, { status: 502 })
    }

    await supabase
      .from('compras')
      .update({
        transaction_id: chargeResponse.id,
        metadata: {
          ...orden.metadata,
          helio_charge_id: chargeResponse.id,
          helio_charge_token: chargeResponse.chargeToken,
          helio_url: chargeResponse.url,
        },
      })
      .eq('id', orden.id)

    return NextResponse.json({
      success: true,
      ordenId: orden.id,
      chargeId: chargeResponse.id,
      paymentUrl: chargeResponse.url,
      mode,
    })
  } catch (err) {
    console.error('[Helio] Error en create-charge:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
