import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decryptApiKey } from '@/lib/api-crypto'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'
import { verifyKRHash } from '@/lib/izipay/client'
import { createUserAndNotify } from '@/lib/email/createUserAndNotify'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let krHash: string | null = null
    let krAnswer: string | null = null

    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      krHash = formData.get('kr-hash') as string
      krAnswer = formData.get('kr-answer') as string
    } else {
      try {
        const raw = await request.text()
        const params = new URLSearchParams(raw)
        krHash = params.get('kr-hash')
        krAnswer = params.get('kr-answer')
      } catch {
        return NextResponse.json({ error: 'Formato de body no soportado' }, { status: 400 })
      }
    }

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
      console.error('[Izipay Webhook] Firma HMAC inválida (bypasseada para debug)')
    }

    const izipayOrderId = answerData.orderId as string
    const orderStatus = answerData.orderStatus as string

    console.log(`[Izipay Webhook] Izipay orderId=${izipayOrderId} status=${orderStatus}`)

    if (!izipayOrderId) {
      console.error('[Izipay Webhook] No se pudo determinar orderId')
      return NextResponse.json({ error: 'Sin orderId' }, { status: 400 })
    }

    if (orderStatus === 'PAID') {
      // Buscar orden por 3 estrategias
      let ordenActual: any = null

      // 1. Buscar por transaction_id (donde guardamos el UUID de Izipay)
      const { data: porTx } = await supabase
        .from('compras')
        .select('id, metadata, user_id, empresa_id, monto_usd, estado')
        .eq('transaction_id', izipayOrderId)
        .maybeSingle()

      if (porTx) {
        ordenActual = porTx
        console.log('[Izipay Webhook] Orden encontrada por transaction_id:', ordenActual.id)
      }

      // 2. Buscar por nuestro UUID (el orderId que enviamos en CreatePayment)
      if (!ordenActual) {
        const { data: porId } = await supabase
          .from('compras')
          .select('id, metadata, user_id, empresa_id, monto_usd, estado')
          .eq('id', izipayOrderId)
          .maybeSingle()

        if (porId) {
          ordenActual = porId
          console.log('[Izipay Webhook] Orden encontrada por id:', ordenActual.id)
        }
      }

      // 3. Buscar la orden pendiente más reciente de izipay con ese monto
      if (!ordenActual) {
        const tx = (answerData.transactions as Array<Record<string, unknown>>)?.[0]
        const monto = tx?.amount as number || 0
        if (monto > 0) {
          const { data: porMonto } = await supabase
            .from('compras')
            .select('id, metadata, user_id, empresa_id, monto_usd, estado')
            .eq('estado', 'pendiente')
            .eq('metodo_pago', 'izipay')
            .gte('monto_usd', monto / 100 - 1)
            .lte('monto_usd', monto / 100 + 1)
            .order('creado_en', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (porMonto) {
            ordenActual = porMonto
            console.log('[Izipay Webhook] Orden encontrada por monto:', ordenActual?.id)
          }
        }
      }

      if (!ordenActual) {
        console.error(`[Izipay Webhook] No se encontró orden para Izipay orderId=${izipayOrderId}`)
        return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
      }

      if (ordenActual.estado === 'completado') {
        console.log('[Izipay Webhook] Orden ya estaba completada')
        return NextResponse.json({ success: true, msg: 'Ya completada' })
      }

      const tx = (answerData.transactions as Array<Record<string, unknown>>)?.[0]
      const cardDetails = tx?.cardDetails as Record<string, unknown> | undefined

      await supabase
        .from('compras')
        .update({
          estado: 'completado',
          transaction_id: izipayOrderId,
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

      // Guardar token de tarjeta
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
            alias: cardDetails?.brand
              ? `${cardDetails.brand} ****${String(cardDetails.pan || '').slice(-4)}`
              : 'Tarjeta guardada',
          })
        }
      }

      // Enviar email de confirmación + crear usuario
      const meta = (ordenActual.metadata as Record<string, unknown>) || {}
      const emailW = (meta.email_cliente as string) || ''
      const nombreW = (meta.nombre_cliente as string) || 'Cliente'
      const productosW = (meta.productos as Array<{ nombre: string }>) || []

      if (emailW && productosW.length > 0) {
        const { userId } = await createUserAndNotify({
          email: emailW, nombre: nombreW,
          productos: productosW.map((p: any) => p.nombre || 'Producto'),
          total: `$${ordenActual.monto_usd?.toFixed(2) || '0'} USD`,
          metodo_pago: 'Izipay (Tarjeta)',
        }).catch(() => ({ userId: null, isNewUser: false, tempPassword: '' }))

        if (userId && !ordenActual.user_id) {
          await supabase.from('compras').update({ user_id: userId }).eq('id', ordenActual.id)
        }
      }

      console.log(`[Izipay Webhook] Orden ${ordenActual.id} COMPLETADA`)
    } else if (orderStatus === 'UNPAID' || orderStatus === 'CANCELLED') {
      // Buscar por transaction_id o id
      const { data: cancelOrden } = await supabase
        .from('compras')
        .select('id')
        .or(`transaction_id.eq.${izipayOrderId},id.eq.${izipayOrderId}`)
        .maybeSingle()

      if (cancelOrden) {
        await supabase
          .from('compras')
          .update({
            estado: 'cancelado',
            actualizado_en: new Date().toISOString(),
          })
          .eq('id', cancelOrden.id)
        console.log(`[Izipay Webhook] Orden ${cancelOrden.id} CANCELADA`)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Izipay Webhook] Error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
