import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decryptApiKey } from '@/lib/api-crypto'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

function verifySign(
  body: Record<string, unknown>,
  receivedSign: string,
  apiKey: string
): boolean {
  const dataForSign = JSON.parse(
    JSON.stringify(body).replace(/\//g, '\\/')
  )
  const hash = require('crypto')
    .createHash('md5')
    .update(Buffer.from(JSON.stringify(dataForSign)).toString('base64') + apiKey)
    .digest('hex')
  return require('crypto').timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(receivedSign)
  )
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    let body: Record<string, unknown>

    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const receivedSign = body.sign as string | undefined
    if (!receivedSign) {
      return NextResponse.json({ error: 'Falta firma' }, { status: 400 })
    }

    const supabase = createClient()

    const { data: keys } = await supabase
      .from('api_keys')
      .select('key_name, key_value')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .eq('is_global', true)
      .in('key_name', ['cryptomus_merchant_id', 'cryptomus_api_key'])

    const keyMap: Record<string, string> = {}
    for (const row of keys || []) {
      keyMap[row.key_name] = decryptApiKey(row.key_value || '')
    }

    const apiKey = keyMap['cryptomus_api_key']
    if (!apiKey) {
      console.error('[Cryptomus Webhook] API key no configurada')
      return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 })
    }

    const { sign, ...dataWithoutSign } = body
    const isValid = verifySign(dataWithoutSign, receivedSign, apiKey)

    if (!isValid) {
      console.error('[Cryptomus Webhook] Firma inválida')
      return NextResponse.json({ error: 'Firma inválida' }, { status: 403 })
    }

    const paymentStatus = body.status as string
    const orderId = body.order_id as string
    const paymentAmount = body.payment_amount as string
    const cryptomusUuid = body.uuid as string

    console.log(
      `[Cryptomus Webhook] order_id=${orderId} status=${paymentStatus} amount=${paymentAmount}`
    )

    const successStatuses = ['paid', 'paid_over']
    const failureStatuses = ['fail', 'cancel', 'system_fail']

    if (!orderId) {
      console.error('[Cryptomus Webhook] Sin order_id')
      return NextResponse.json({ error: 'Sin order_id' }, { status: 400 })
    }

    const { data: orden, error: ordenLookupError } = await supabase
      .from('compras')
      .select('*')
      .eq('id', orderId)
      .maybeSingle()

    if (ordenLookupError || !orden) {
      console.error('[Cryptomus Webhook] Orden no encontrada:', orderId)
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    if (successStatuses.includes(paymentStatus)) {
      const { error: updateError } = await supabase
        .from('compras')
        .update({
          estado: 'completado',
          transaction_id: cryptomusUuid,
          metadata: {
            ...(orden.metadata as Record<string, unknown> || {}),
            cryptomus_uuid: cryptomusUuid,
            cryptomus_status: paymentStatus,
            payment_amount: paymentAmount,
            webhook_received_at: new Date().toISOString(),
          },
          actualizado_en: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (updateError) {
        console.error('[Cryptomus Webhook] Error actualizando orden:', updateError)
        return NextResponse.json({ error: 'Error al actualizar orden' }, { status: 500 })
      }

      console.log(`[Cryptomus Webhook] Orden ${orderId} marcada como COMPLETADA`)

      // TODO: Enviar email de confirmación si el usuario existe
    } else if (failureStatuses.includes(paymentStatus)) {
      await supabase
        .from('compras')
        .update({
          estado: 'cancelado',
          metadata: {
            ...(orden.metadata as Record<string, unknown> || {}),
            cryptomus_uuid: cryptomusUuid,
            cryptomus_status: paymentStatus,
            webhook_received_at: new Date().toISOString(),
          },
          actualizado_en: new Date().toISOString(),
        })
        .eq('id', orderId)

      console.log(`[Cryptomus Webhook] Orden ${orderId} marcada como CANCELADA`)
    } else {
      // Estados intermedios: check, confirm_check, process
      await supabase
        .from('compras')
        .update({
          metadata: {
            ...(orden.metadata as Record<string, unknown> || {}),
            cryptomus_uuid: cryptomusUuid,
            cryptomus_status: paymentStatus,
            last_webhook_at: new Date().toISOString(),
          },
          actualizado_en: new Date().toISOString(),
        })
        .eq('id', orderId)

      console.log(`[Cryptomus Webhook] Orden ${orderId} estado intermedio: ${paymentStatus}`)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Cryptomus Webhook] Error:', err)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
