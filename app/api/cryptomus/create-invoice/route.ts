import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decryptApiKey } from '@/lib/api-crypto'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'
import { createInvoice, generateSign } from '@/lib/cryptomus/client'
import type { CryptomusPaymentMode } from '@/lib/cryptomus/types'

async function getCryptomusConfig(supabase: ReturnType<typeof createClient>) {
  const { data: keys } = await supabase
    .from('api_keys')
    .select('key_name, key_value')
    .eq('empresa_id', DEFAULT_EMPRESA_ID)
    .eq('is_global', true)
    .in('key_name', ['cryptomus_merchant_id', 'cryptomus_api_key'])

  const map: Record<string, string> = {}
  for (const row of keys || []) {
    map[row.key_name] = decryptApiKey(row.key_value || '')
  }

  const merchantId = map['cryptomus_merchant_id']
  const apiKey = map['cryptomus_api_key']

  if (!merchantId || !apiKey) {
    return null
  }

  return { merchantId, apiKey }
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
        precio_coins?: number
        curso_id?: string
        slug?: string
      }>
      mode: CryptomusPaymentMode
      monto_usd: number
      tiene_fisicos?: boolean
      direccion_envio?: unknown
    }

    if (!email || !productos?.length || !mode) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    if (!['card', 'crypto'].includes(mode)) {
      return NextResponse.json(
        { success: false, error: 'Modo de pago inválido' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const config = await getCryptomusConfig(supabase)

    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Cryptomus no está configurado. Agrega cryptomus_merchant_id y cryptomus_api_key en API Nube.' },
        { status: 500 }
      )
    }

    const finalEmpresaId = empresa_id || DEFAULT_EMPRESA_ID
    const total = monto_usd.toFixed(2)

    const primerProductoId = productos?.[0]?.producto_id || null

    const { data: orden, error: ordenError } = await supabase
      .from('compras')
      .insert({
        empresa_id: finalEmpresaId,
        user_id: user_id || null,
        producto_id: primerProductoId,
        metodo_pago: mode === 'card' ? 'cryptomus_card' : 'cryptomus_crypto',
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
          cryptomus_mode: mode,
        },
        creado_en: new Date().toISOString(),
      })
      .select()
      .single()

    if (ordenError || !orden) {
      console.error('[Cryptomus] Error creando orden:', ordenError)
      return NextResponse.json(
        { success: false, error: 'Error al crear la orden' },
        { status: 500 }
      )
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
        const { error: itemsError } = await supabase
          .from('compra_items')
          .insert(items)
        if (itemsError) {
          console.error('[Cryptomus] Error creando items:', itemsError)
        }
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin

    const invoiceParams = {
      amount: total,
      currency: mode === 'card' ? 'USD' : 'USDT',
      order_id: orden.id,
      to_currency: 'USDT',
      url_return: `${siteUrl}/tienda/checkout/status?order_id=${orden.id}`,
      url_success: `${siteUrl}/tienda/checkout/status?order_id=${orden.id}`,
      url_callback: `${siteUrl}/api/cryptomus/webhook`,
      lifetime: 7200,
    }

    if (mode === 'card') {
      console.log('[Cryptomus] Creando factura modo tarjeta (USD→USDT):', {
        amount: total,
        order_id: orden.id,
      })
    } else {
      console.log('[Cryptomus] Creando factura modo crypto (USDT):', {
        amount: total,
        order_id: orden.id,
      })
    }

    const invoiceResponse = await createInvoice(invoiceParams, config)

    if (invoiceResponse.state !== 0 || !invoiceResponse.result) {
      console.error(
        '[Cryptomus] Error creando factura:',
        invoiceResponse.message || invoiceResponse.errors
      )
      return NextResponse.json(
        {
          success: false,
          error: invoiceResponse.message || 'Error al crear la factura en Cryptomus',
          details: invoiceResponse.errors,
        },
        { status: 502 }
      )
    }

    await supabase
      .from('compras')
      .update({
        transaction_id: invoiceResponse.result.uuid,
        metadata: {
          ...orden.metadata,
          cryptomus_uuid: invoiceResponse.result.uuid,
          cryptomus_url: invoiceResponse.result.url,
        },
      })
      .eq('id', orden.id)

    return NextResponse.json({
      success: true,
      ordenId: orden.id,
      cryptomusUuid: invoiceResponse.result.uuid,
      paymentUrl: invoiceResponse.result.url,
      mode,
    })
  } catch (err) {
    console.error('[Cryptomus] Error en create-invoice:', err)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
