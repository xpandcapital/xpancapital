import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

function verifyWebhookSignature(body: string, headers: Headers, webhookId: string): boolean {
  const transmissionId = headers.get('paypal-transmission-id') || ''
  const transmissionTime = headers.get('paypal-transmission-time') || ''
  const transmissionSig = headers.get('paypal-transmission-sig') || ''
  const certUrl = headers.get('paypal-cert-url') || ''

  const expectedSig = `${transmissionId}|${transmissionTime}|${webhookId}|${crypto.createHash('sha256').update(body).digest('hex')}`

  try {
    const verified = crypto.createVerify('sha256WithRSAEncryption')
    verified.update(expectedSig)
    return verified.verify(certUrl, transmissionSig, 'base64')
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    let body: Record<string, unknown>
    try { body = JSON.parse(rawBody) } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const eventType = body.event_type as string
    console.log(`[PayPal Webhook] Event: ${eventType}`)

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = body.resource as Record<string, unknown> | undefined
      const purchaseUnits = resource?.supplementary_data?.related_ids as Record<string, unknown> | undefined
      const orderId = purchaseUnits?.order_id as string || resource?.custom_id as string

      if (orderId) {
        const supabase = createClient()
        const { data: orden } = await supabase
          .from('compras')
          .select('id, estado, metadata')
          .or(`transaction_id.eq.${orderId},id.eq.${orderId}`)
          .maybeSingle()

        if (orden && orden.estado !== 'completado') {
          await supabase
            .from('compras')
            .update({
              estado: 'completado',
              actualizado_en: new Date().toISOString(),
              metadata: {
                ...(orden.metadata as Record<string, unknown> || {}),
                paypal_webhook_received_at: new Date().toISOString(),
              },
            })
            .eq('id', orden.id)
          console.log(`[PayPal Webhook] Orden ${orden.id} COMPLETADA vía webhook`)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PayPal Webhook] Error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
