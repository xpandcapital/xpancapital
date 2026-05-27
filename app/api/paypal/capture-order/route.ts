import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decryptApiKey } from '@/lib/api-crypto'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'
import { captureOrder } from '@/lib/paypal/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderID, ordenId } = body as { orderID: string; ordenId: string }

    if (!orderID || !ordenId) {
      return NextResponse.json({ success: false, error: 'Faltan orderID u ordenId' }, { status: 400 })
    }

    const supabase = createClient()

    const { data: keys } = await supabase
      .from('api_keys')
      .select('key_name, key_value')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .eq('is_global', true)
      .in('key_name', ['paypal_client_id', 'paypal_secret', 'paypal_client_id_prod', 'paypal_secret_prod', 'paypal_environment'])

    const keyMap: Record<string, string> = {}
    for (const row of keys || []) {
      keyMap[row.key_name] = row.key_name === 'paypal_environment' ? (row.key_value || 'sandbox') : decryptApiKey(row.key_value || '')
    }

    const isProduction = keyMap['paypal_environment'] === 'production'
    const clientId = isProduction ? keyMap['paypal_client_id_prod'] : keyMap['paypal_client_id']
    const secret = isProduction ? keyMap['paypal_secret_prod'] : keyMap['paypal_secret']

    if (!clientId || !secret) {
      return NextResponse.json({ success: false, error: 'PayPal no configurado' }, { status: 500 })
    }

    const result = await captureOrder(orderID, clientId, secret, isProduction)

    if (result.status !== 'COMPLETED') {
      return NextResponse.json({ success: false, error: `Pago no completado: ${result.status}` }, { status: 502 })
    }

    const capture = result.data?.purchase_units?.[0]?.payments?.captures?.[0]
    const txId = capture?.id || ''
    const amount = capture?.amount?.value || ''
    const payerEmail = result.data?.payer?.email_address || ''

    await supabase
      .from('compras')
      .update({
        estado: 'completado',
        transaction_id: orderID,
        actualizado_en: new Date().toISOString(),
        metadata: await supabase
          .from('compras')
          .select('metadata')
          .eq('id', ordenId)
          .maybeSingle()
          .then(({ data: o }) => ({
            ...(o?.metadata as Record<string, unknown> || {}),
            paypal_status: 'COMPLETED',
            paypal_transaction_id: txId,
            paypal_amount: amount,
            paypal_payer_email: payerEmail,
          })),
      })
      .eq('id', ordenId)

    console.log(`[PayPal] Orden ${ordenId} COMPLETADA — tx: ${txId}`)
    return NextResponse.json({ success: true, status: 'COMPLETED' })
  } catch (err) {
    console.error('[PayPal] Error en capture-order:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
