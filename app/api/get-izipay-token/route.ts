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
    .in('key_name', [
      'izipay_shop_id',
      'izipay_secret_key',
      'izipay_public_key',
      'izipay_hmac_key',
      'izipay_environment',
    ])

  const map: Record<string, string> = {}
  for (const row of keys || []) {
    if (row.key_name === 'izipay_environment') {
      const raw = (row.key_value || 'sandbox').toLowerCase()
      map[row.key_name] = raw.includes('prod') ? 'production' : 'sandbox'
    } else {
      const decrypted = decryptApiKey(row.key_value || '')
      if (decrypted && decrypted.startsWith('enc:')) {
        console.error(`[Izipay] No se pudo desencriptar ${row.key_name}: API_ENCRYPTION_KEY no configurada`)
        console.error('[Izipay] Ejecuta: DELETE FROM api_keys WHERE key_name LIKE \'%izipay%\' y vuelve a ingresar las claves')
      }
      map[row.key_name] = decrypted
    }
  }

  const shopId = map['izipay_shop_id']
  const secretKey = map['izipay_secret_key']
  const publicKey = map['izipay_public_key']
  const hmacKey = map['izipay_hmac_key']

  if (!shopId || !secretKey || !publicKey || !hmacKey) return null

  return {
    shopId,
    secretKey,
    publicKey,
    hmacKey,
    environment: (map['izipay_environment'] || 'sandbox') as IzipayEnvironment,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      empresa_id,
      user_id,
      nombre,
      apellido,
      email,
      pais,
      productos,
      total_usd,
      tiene_fisicos,
      direccion_envio,
    } = body as {
      empresa_id?: string
      user_id?: string
      nombre: string
      apellido?: string
      email: string
      pais?: string
      productos: Array<{
        producto_id: string
        cantidad: number
        precio_unitario: number
        nombre: string
        productType: string
      }>
      total_usd: number
      tiene_fisicos?: boolean
      direccion_envio?: unknown
    }

    if (!email || !productos?.length || !total_usd) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos (email, productos, total)' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const config = await getIzipayConfig(supabase)

    if (!config) {
      return NextResponse.json({
        success: false,
        error: 'Izipay no está configurado. Agrega izipay_shop_id, izipay_secret_key, izipay_public_key, izipay_hmac_key en API Nube.',
      }, { status: 500 })
    }

    const finalEmpresaId = empresa_id || DEFAULT_EMPRESA_ID
    const amountInCents = Math.round(total_usd * 100)

    const insertData = {
      empresa_id: finalEmpresaId,
      user_id: user_id || null,
      producto_id: productos?.[0]?.producto_id || null,
      metodo_pago: 'izipay',
      monto_coins: 0,
      monto_usd: total_usd,
      moneda: 'USD',
      comision_generada: 0,
      comision_estado: 'pendiente',
      estado: 'pendiente',
      metadata: {
        productos,
        email_cliente: email.toLowerCase(),
        nombre_cliente: `${nombre} ${apellido || ''}`.trim(),
        pais_cliente: pais || 'PE',
        tiene_fisicos: tiene_fisicos || false,
        direccion_envio: direccion_envio || null,
        izipay_environment: config.environment,
      },
      creado_en: new Date().toISOString(),
    }

    console.log('[Izipay] Insertando orden:', JSON.stringify(insertData, null, 2))

    const { data: orden, error: ordenError } = await supabase
      .from('compras')
      .insert(insertData)
      .select()
      .single()

    if (ordenError || !orden) {
      console.error('[Izipay] Error creando orden:', ordenError)
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
        const { error: itemsError } = await supabase.from('compra_items').insert(items)
        if (itemsError) console.error('[Izipay] Error creando items:', itemsError)
      }
    }

    console.log('[Izipay] Config encontrada. Enviando createPayment...')
    console.log('[Izipay] Config:', { shopId: config.shopId, env: config.environment, hasSecret: !!config.secretKey, hasPublic: !!config.publicKey, hasHMAC: !!config.hmacKey })

    const paymentResponse = await createPayment(
      {
        amount: amountInCents,
        currency: 'USD',
        orderId: orden.id,
        customer: {
          email: email.toLowerCase(),
          reference: user_id || undefined,
        },
      },
      config
    )

    if (paymentResponse.status !== 'SUCCESS' || !paymentResponse.answer.formToken) {
      console.error('[Izipay] Error generando formToken:', paymentResponse)
      return NextResponse.json({
        success: false,
        error: 'Error al conectar con la pasarela de pago. Intenta de nuevo.',
      }, { status: 502 })
    }

    await supabase
      .from('compras')
      .update({
        metadata: {
          ...(orden.metadata as Record<string, unknown> || {}),
          izipay_form_token: paymentResponse.answer.formToken,
          izipay_ticket: paymentResponse.ticket || '',
        },
      })
      .eq('id', orden.id)

    return NextResponse.json({
      success: true,
      ordenId: orden.id,
      formToken: paymentResponse.answer.formToken,
      publicKey: config.publicKey,
      environment: config.environment,
    })
  } catch (err) {
    console.error('[Izipay] Error en get-izipay-token:', err)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
