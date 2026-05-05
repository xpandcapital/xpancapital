import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decryptApiKey } from '@/lib/api-crypto'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'
import { verifyWebhookSign } from '@/lib/helio/client'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-signature')

    if (!signature) {
      console.error('[Helio Webhook] Falta firma X-Signature')
      return NextResponse.json({ error: 'Falta firma' }, { status: 400 })
    }

    let body: Record<string, unknown>
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const supabase = createClient()

    const { data: keys } = await supabase
      .from('api_keys')
      .select('key_name, key_value')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .eq('is_global', true)
      .in('key_name', ['helio_secret_key'])

    const keyMap: Record<string, string> = {}
    for (const row of keys || []) {
      keyMap[row.key_name] = decryptApiKey(row.key_value || '')
    }

    const secretKey = keyMap['helio_secret_key']
    if (!secretKey) {
      console.error('[Helio Webhook] Secret key no configurada')
      return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 })
    }

    const isValid = verifyWebhookSign(rawBody, signature, secretKey)
    if (!isValid) {
      console.error('[Helio Webhook] Firma inválida')
      return NextResponse.json({ error: 'Firma inválida' }, { status: 403 })
    }

    const event = body.event as string
    const transaction = body.transaction as string
    let transactionObj: Record<string, unknown> = {}

    try {
      if (typeof transaction === 'string') {
        transactionObj = JSON.parse(transaction)
      }
    } catch {
      // noop
    }

    const meta = body.transactionObject?.meta as Record<string, unknown> | undefined
    const additionalJson = meta?.customerDetails?.additionalJSON as string | undefined
    let orderId = ''

    if (additionalJson) {
      try {
        const parsed = JSON.parse(additionalJson)
        orderId = parsed.orderId || ''
      } catch { /* noop */ }
    }

    // Fallback: extract orderId from charge ID
    if (!orderId) {
      const chargeId = body.transactionObject?.id as string
      if (chargeId) {
        const { data: orden } = await supabase
          .from('compras')
          .select('id')
          .eq('transaction_id', chargeId)
          .maybeSingle()
        if (orden) orderId = orden.id
      }
    }

    if (!orderId) {
      console.error('[Helio Webhook] No se pudo determinar orderId')
      return NextResponse.json({ error: 'Sin orderId' }, { status: 400 })
    }

    const status = meta?.transactionStatus as string || 'PENDING'
    console.log(`[Helio Webhook] order_id=${orderId} status=${status} event=${event}`)

    if (status === 'SUCCESS') {
      await supabase
        .from('compras')
        .update({
          estado: 'completado',
          transaction_id: body.transactionObject?.id as string || '',
          metadata: supabase.rpc ? undefined : undefined,
          actualizado_en: new Date().toISOString(),
        })
        .eq('id', orderId)

      // Update metadata separately for JSONB merge
      const { data: ordenActual } = await supabase
        .from('compras')
        .select('metadata')
        .eq('id', orderId)
        .maybeSingle()

      if (ordenActual) {
        await supabase
          .from('compras')
          .update({
            metadata: {
              ...(ordenActual.metadata as Record<string, unknown> || {}),
              helio_status: 'SUCCESS',
              helio_webhook_received_at: new Date().toISOString(),
            },
          })
          .eq('id', orderId)
      }

      console.log(`[Helio Webhook] Orden ${orderId} COMPLETADA`)
    } else if (status === 'FAILED') {
      await supabase
        .from('compras')
        .update({
          estado: 'cancelado',
          actualizado_en: new Date().toISOString(),
        })
        .eq('id', orderId)

      console.log(`[Helio Webhook] Orden ${orderId} CANCELADA`)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Helio Webhook] Error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
