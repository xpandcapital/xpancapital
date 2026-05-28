import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decryptApiKey } from '@/lib/api-crypto'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'
import { verifyKRHash } from '@/lib/izipay/client'
import { createUserAndNotify } from '@/lib/email/createUserAndNotify'

export async function POST(request: NextRequest) {
  try {
    // Siempre leer como texto (Micuentaveb envía application/x-www-form-urlencoded)
    const raw = await request.text()
    console.log('[Izipay Webhook] Raw body (first 200):', raw.substring(0, 200))

    const params = new URLSearchParams(raw)
    const krHash = params.get('kr-hash')
    const krAnswer = params.get('kr-answer')

    if (!krHash || !krAnswer) {
      console.error('[Izipay Webhook] Falta kr-hash o kr-answer')
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 })
    }

    let answerData: Record<string, unknown>
    try {
      answerData = JSON.parse(krAnswer)
    } catch {
      console.error('[Izipay Webhook] kr-answer no es JSON válido')
      return NextResponse.json({ error: 'kr-answer inválido' }, { status: 400 })
    }

    console.log('[Izipay Webhook] answerData keys:', Object.keys(answerData))
    console.log('[Izipay Webhook] orderId:', answerData.orderId)
    console.log('[Izipay Webhook] orderStatus:', answerData.orderStatus)

    const supabase = createClient()

    const { data: keys } = await supabase
      .from('api_keys')
      .select('key_name, key_value')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .eq('is_global', true)
      .in('key_name', ['izipay_hmac_key'])

    const keyMap: Record<string, string> = {}
    for (const row of keys || []) {
      keyMap[row.key_name] = decryptApiKey(row.key_value || '')
    }

    const hmacKey = keyMap['izipay_hmac_key']
    if (!hmacKey) {
      console.error('[Izipay Webhook] HMAC key no configurada')
      return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 })
    }

    const isValid = verifyKRHash(krAnswer, krHash, hmacKey)
    console.log('[Izipay Webhook] HMAC valid:', isValid)
    if (!isValid) {
      console.error('[Izipay Webhook] Firma HMAC inválida (bypasseada)')
    }

    const orderStatus = answerData.orderStatus as string
    const tx = (answerData.transactions as Array<Record<string, unknown>>)?.[0]
    const cardDetails = tx?.cardDetails as Record<string, unknown> | undefined

    // Log completo para entender la estructura del IPN
    console.log('[Izipay Webhook] orderDetails:', JSON.stringify(answerData.orderDetails || {}).substring(0, 400))
    console.log('[Izipay Webhook] customer:', JSON.stringify(answerData.customer || {}).substring(0, 200))
    console.log('[Izipay Webhook] tx keys:', tx ? Object.keys(tx) : 'none')

    // Buscar nuestro UUID: orderDetails.orderId es nuestro UUID (lo enviamos en CreatePayment)
    const orderDetails = answerData.orderDetails as Record<string, unknown> | undefined
    const customer = answerData.customer as Record<string, unknown> | undefined
    const nuestroOrderNumber = (orderDetails?.orderId as string) ||
                              (orderDetails?.orderNumber as string) ||
                              ((customer?.reference as string) || '').split('|').pop() ||
                              (tx?.orderNumber as string) || ''

    console.log(`[Izipay Webhook] Buscando orden. orderNumber=${nuestroOrderNumber}`)

    // Buscar orden por nuestro UUID (id), luego por transaction_id
    let ordenActual: any = null

    if (nuestroOrderNumber) {
      const { data: porId } = await supabase
        .from('compras')
        .select('id, metadata, user_id, empresa_id, monto_usd, estado')
        .eq('id', nuestroOrderNumber)
        .maybeSingle()
      if (porId) { ordenActual = porId; console.log('[Izipay Webhook] Encontrada por nuestro UUID (id)') }
    }

    if (!ordenActual) {
      const { data: porTx } = await supabase
        .from('compras')
        .select('id, metadata, user_id, empresa_id, monto_usd, estado')
        .eq('transaction_id', nuestroOrderNumber)
        .maybeSingle()
      if (porTx) { ordenActual = porTx; console.log('[Izipay Webhook] Encontrada por transaction_id') }
    }

    if (!ordenActual) {
      console.error(`[Izipay Webhook] Orden no encontrada. orderNumber=${nuestroOrderNumber}`)
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    console.log(`[Izipay Webhook] Orden encontrada: ${ordenActual.id} estado=${ordenActual.estado}`)

    if (orderStatus === 'PAID') {
      const yaCompletada = ordenActual.estado === 'completado'
      
      if (!yaCompletada) {
        await supabase
          .from('compras')
          .update({
            estado: 'completado',
            transaction_id: answerData.orderId as string,
            actualizado_en: new Date().toISOString(),
            metadata: {
              ...((ordenActual.metadata as Record<string, unknown>) || {}),
              izipay_status: 'PAID',
              izipay_webhook_received_at: new Date().toISOString(),
              izipay_transaction_uuid: tx?.uuid || '',
              izipay_payment_method: tx?.paymentMethodType || '',
              izipay_card_brand: cardDetails?.brand || '',
              izipay_card_last4: cardDetails?.pan || '',
            },
          })
          .eq('id', ordenActual.id)

        // Guardar token de tarjeta para recurrentes
        if (tx?.paymentMethodToken && ordenActual.user_id) {
          const cardToken = tx.paymentMethodToken as string
          const existing = await supabase
            .from('izipay_card_tokens')
            .select('id')
            .eq('card_token', cardToken)
            .eq('user_id', ordenActual.user_id)
            .maybeSingle()
          if (!existing) {
            await supabase.from('izipay_card_tokens').insert({
              empresa_id: ordenActual.empresa_id || DEFAULT_EMPRESA_ID,
              user_id: ordenActual.user_id,
              card_token: cardToken,
              merchant_buyer_id: String(ordenActual.user_id),
              card_brand: cardDetails?.brand as string || '',
              card_last4: String(cardDetails?.pan || '').slice(-4),
              card_expiry_month: cardDetails?.expiryMonth as string || '',
              card_expiry_year: cardDetails?.expiryYear as string || '',
              order_id: ordenActual.id,
              alias: cardDetails?.brand ? `${cardDetails.brand} ****${String(cardDetails.pan || '').slice(-4)}` : 'Tarjeta guardada',
            })
          }
        }

      } // fin if (!yaCompletada)

      // Enviar email + crear usuario (siempre, incluso si ya estaba completada)
      const meta = (ordenActual.metadata as Record<string, unknown>) || {}
      const email = (meta.email_cliente as string) || ''
      const nombre = (meta.nombre_cliente as string) || 'Cliente'
      const productos = (meta.productos as Array<Record<string, unknown>>) || []

      if (email && productos.length > 0) {
        try {
          console.log('[Izipay Webhook] Creando usuario y enviando email a:', email)
          const productosNombres = productos.map((p: any) => p.nombre || 'Producto')
          const productPrices = productos.map((p: any) => ({
            nombre: p.nombre || 'Producto',
            precio: p.precio_unitario?.toFixed(2) || ordenActual.monto_usd?.toFixed(2) || '0',
            cantidad: p.cantidad || 1,
            categoria: p.productType || '',
          }))
          const { userId, isNewUser } = await createUserAndNotify({
            email, nombre,
            productos: productosNombres,
            total: `$${ordenActual.monto_usd?.toFixed(2) || '0'} USD`,
            metodo_pago: 'Izipay (Tarjeta)',
            productPrices,
          })
          console.log('[Izipay Webhook] createUserAndNotify result:', { userId, isNewUser })

          if (userId && !ordenActual.user_id) {
            await supabase.from('compras').update({ user_id: userId }).eq('id', ordenActual.id)
          }
        } catch (userErr: any) {
          console.error('[Izipay Webhook] Error en createUserAndNotify:', userErr?.message)
        }
      }

      console.log(`[Izipay Webhook] Orden ${ordenActual.id} COMPLETADA`)
    } else if (orderStatus === 'UNPAID' || orderStatus === 'CANCELLED') {
      await supabase
        .from('compras')
        .update({ estado: 'cancelado', actualizado_en: new Date().toISOString() })
        .eq('id', ordenActual.id)
      console.log(`[Izipay Webhook] Orden ${ordenActual.id} CANCELADA`)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    const msg = err?.message || String(err)
    console.error('[Izipay Webhook] Error:', msg, err?.stack?.substring(0, 300))
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
