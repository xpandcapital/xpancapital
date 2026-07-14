import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decryptApiKey } from '@/lib/api-crypto'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'
import { createPayment } from '@/lib/izipay/client'
import type { IzipayEnvironment } from '@/lib/izipay/types'

async function getIzipayConfig(supabase: ReturnType<typeof createClient>) {
  const { data: keys } = await supabase
    .from('api_keys')
    .select('key_name, key_value')
    .eq('empresa_id', DEFAULT_EMPRESA_ID)
    .eq('is_global', true)
    .in('key_name', ['izipay_shop_id', 'izipay_secret_key', 'izipay_public_key', 'izipay_hmac_key', 'izipay_environment', 'izipay_display_mode'])

  const map: Record<string, string> = {}
  for (const row of keys || []) {
    if (row.key_name === 'izipay_environment') {
      map[row.key_name] = (row.key_value || 'sandbox').toLowerCase().includes('prod') ? 'production' : 'sandbox'
    } else if (row.key_name === 'izipay_display_mode') {
      map[row.key_name] = row.key_value || 'popup'
    } else {
      const decrypted = decryptApiKey(row.key_value || '')
      if (!decrypted || decrypted.startsWith('enc:')) continue
      map[row.key_name] = decrypted
    }
  }

  const shopId = map['izipay_shop_id']; const secretKey = map['izipay_secret_key']
  const publicKey = map['izipay_public_key']; const hmacKey = map['izipay_hmac_key']
  if (!shopId || !secretKey || !publicKey || !hmacKey) return null

  return { shopId, secretKey, publicKey, hmacKey, displayMode: map['izipay_display_mode'] || 'popup', environment: (map['izipay_environment'] || 'sandbox') as IzipayEnvironment }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plan, nombre, email, telefono } = body as { plan: string; nombre: string; email: string; telefono?: string }

    if (!plan || !nombre || !email) {
      return NextResponse.json({ success: false, error: 'Plan, nombre y email son requeridos' }, { status: 400 })
    }

    const plans: Record<string, { name: string; total_usd: number }> = {
      trimestral: { name: 'Plan Trimestral', total_usd: 115 },
      anual: { name: 'Plan Anual', total_usd: 300 },
    }

    const planData = plans[plan]
    if (!planData) return NextResponse.json({ success: false, error: 'Plan no válido' }, { status: 400 })

    const supabase = createClient()
    const config = await getIzipayConfig(supabase)
    if (!config) return NextResponse.json({ success: false, error: 'Pasarela de pago no configurada' }, { status: 500 })

    const amountInCents = Math.round(planData.total_usd * 100)

    const insertData = {
      empresa_id: DEFAULT_EMPRESA_ID,
      metodo_pago: 'izipay',
      monto_coins: 0,
      monto_usd: planData.total_usd,
      moneda: 'USD',
      comision_generada: 0,
      comision_estado: 'pendiente',
      estado: 'pendiente',
      metadata: {
        plan,
        plan_nombre: planData.name,
        email_cliente: email.toLowerCase(),
        nombre_cliente: nombre.trim(),
        telefono: telefono || null,
        izipay_environment: config.environment,
      },
      creado_en: new Date().toISOString(),
    }

    const { data: orden, error: ordenError } = await supabase.from('compras').insert(insertData).select().single()
    if (ordenError || !orden) {
      return NextResponse.json({ success: false, error: 'Error al crear la orden' }, { status: 500 })
    }

    const paymentResponse = await createPayment(
      { amount: amountInCents, currency: 'USD', orderId: orden.id, customer: { email: email.toLowerCase() } },
      config
    )

    if (paymentResponse.status !== 'SUCCESS' || !paymentResponse.answer?.formToken) {
      return NextResponse.json({ success: false, error: 'Error al conectar con la pasarela de pago' }, { status: 502 })
    }

    await supabase.from('compras').update({
      transaction_id: orden.id,
      metadata: { ...(orden.metadata as Record<string, unknown> || {}), izipay_form_token: paymentResponse.answer.formToken, izipay_ticket: paymentResponse.ticket || '' }
    }).eq('id', orden.id)

    return NextResponse.json({ success: true, ordenId: orden.id, formToken: paymentResponse.answer.formToken, publicKey: config.publicKey, displayMode: config.displayMode, total: planData.total_usd })
  } catch (err) {
    console.error('[Planes Izipay] Error:', err)
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
