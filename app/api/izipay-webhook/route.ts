import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decryptApiKey } from '@/lib/api-crypto'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'
import { verifyKRHash } from '@/lib/izipay/client'
import { sendTemplateEmail } from '@/lib/email/sendTemplateEmail'

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
    if (!isValid) {
      console.error('[Izipay Webhook] Firma HMAC inválida')
      return NextResponse.json({ error: 'Firma inválida' }, { status: 403 })
    }

    const orderId = answerData.orderId as string
    const orderStatus = answerData.orderStatus as string

    console.log(`[Izipay Webhook] orderId=${orderId} status=${orderStatus}`)

    if (!orderId) {
      console.error('[Izipay Webhook] No se pudo determinar orderId')
      return NextResponse.json({ error: 'Sin orderId' }, { status: 400 })
    }

    if (orderStatus === 'PAID') {
      const { data: ordenActual } = await supabase
        .from('compras')
        .select('id, metadata, user_id, empresa_id')
        .eq('id', orderId)
        .maybeSingle()

      if (!ordenActual) {
        console.error(`[Izipay Webhook] Orden ${orderId} no encontrada`)
        return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
      }

      const tx = (answerData.transactions as Array<Record<string, unknown>>)?.[0]
      const cardDetails = tx?.cardDetails as Record<string, unknown> | undefined

      await supabase
        .from('compras')
        .update({
          estado: 'completado',
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
      .eq('id', orderId)

      // Enviar email de confirmación
      const meta = (ordenActual.metadata as Record<string, unknown>) || {}
      const email = (meta.email_cliente as string) || ''
      const nombre = (meta.nombre_cliente as string) || 'Cliente'
      const productos = (meta.productos as Array<{ nombre: string }>) || []

      if (email && productos.length > 0) {
        const nombresList = productos
          .map((p: any) => `<li style="margin-bottom:6px;font-size:14px;color:#e5e7eb;">✅ ${p.nombre || 'Producto'}</li>`)
          .join('')
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blis-corp.com'
        await sendTemplateEmail({
          evento: ordenActual.user_id ? 'transaccion_compra_completada_logueado' : 'transaccion_compra_completada_invitado',
          to: email,
          variables: {
            nombre, email,
            productos: `<ul style="margin:0;padding:0;list-style:none;">${nombresList}</ul>`,
            total: `$${ordenActual.monto_usd?.toFixed(2) || '0'} USD`,
            metodo_pago: 'Izipay (Tarjeta)',
            fecha_compra: new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }),
            enlace_acceso: `<a href="${siteUrl}/miembros" target="_blank">Acceder a Mis Productos →</a>`,
          },
        })
      }

      console.log(`[Izipay Webhook] Orden ${orderId} COMPLETADA`)
    } else if (orderStatus === 'UNPAID' || orderStatus === 'CANCELLED') {
      await supabase
        .from('compras')
        .update({
          estado: 'cancelado',
          actualizado_en: new Date().toISOString(),
          metadata: {
            ...((answerData as Record<string, unknown>).metadata as Record<string, unknown> || {}),
            izipay_status: orderStatus,
            izipay_webhook_received_at: new Date().toISOString(),
          },
        })
        .eq('id', orderId)

      console.log(`[Izipay Webhook] Orden ${orderId} CANCELADA (${orderStatus})`)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Izipay Webhook] Error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
