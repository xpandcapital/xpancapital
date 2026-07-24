import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { decryptApiKey } from '@/lib/api-crypto'
import { getMerchant, createTransaction, generateSignature } from '@/lib/wompi/client'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() { return createClient(supabaseUrl, supabaseServiceKey) }

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { productos, total_usd, email, nombre, apellido, pais, tiene_fisicos, direccion_envio, user_id } = await request.json()

    if (!productos?.length || !total_usd || !email) {
      return NextResponse.json({ error: 'productos, total_usd y email requeridos' }, { status: 400 })
    }

    // Obtener keys de Wompi desde api_keys
    const { data: keys } = await supabase
      .from('api_keys')
      .select('key_name, key_value')
      .in('key_name', ['wompi_public_key', 'wompi_private_key', 'wompi_integrity_key'])
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .or(`user_id.is.null,is_global.eq.true`)

    if (!keys || keys.length < 3) {
      return NextResponse.json({ error: 'Wompi API keys no configuradas en API Nube' }, { status: 400 })
    }

    const getKey = (name: string) => keys.find((k: any) => k.key_name === name)?.key_value || ''
    const publicKey = decryptApiKey(getKey('wompi_public_key'))
    const privateKey = decryptApiKey(getKey('wompi_private_key'))
    const integrityKey = decryptApiKey(getKey('wompi_integrity_key'))

    const environment = process.env.WOMPI_ENV || 'sandbox'

    // Crear orden en compras
    const totalCents = Math.round(total_usd * 100)
    const productoPrincipal = productos[0]

    const { data: compra, error: compraError } = await supabase
      .from('compras')
      .insert({
        empresa_id: DEFAULT_EMPRESA_ID,
        user_id: user_id || null,
        producto_id: productoPrincipal?.id || null,
        metodo_pago: 'wompi',
        monto_usd: total_usd,
        moneda: 'USD',
        estado: 'pendiente',
        metadata: {
          productos,
          email_cliente: email,
          nombre_cliente: [nombre, apellido].filter(Boolean).join(' '),
          tiene_fisicos: !!tiene_fisicos,
          direccion_envio: direccion_envio || null,
        },
      })
      .select()
      .single()

    if (compraError) {
      return NextResponse.json({ error: `Error creando orden: ${compraError.message}` }, { status: 500 })
    }

    // Crear items de compra
    const items = productos.map((p: any) => ({
      compra_id: compra.id,
      producto_id: p.id,
      cantidad: p.cantidad || 1,
      precio_unitario: p.price,
      product_type: p.productType || 'digital',
    }))

    await supabase.from('compra_items').insert(items)

    // Obtener acceptance_token del merchant
    const merchant = await getMerchant(publicKey, environment)
    const acceptanceToken = merchant.data.presigned_acceptance?.acceptance_token || ''

    // Generar referencia única
    const reference = compra.id.slice(0, 12)

    // Generar firma
    const signature = await generateSignature(reference, totalCents, 'USD', integrityKey)

    // Crear transacción en Wompi
    const wompiRes = await createTransaction({
      acceptance_token: acceptanceToken,
      amount_in_cents: totalCents,
      currency: 'USD',
      signature,
      customer_email: email,
      reference,
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://xpancapital.vercel.app'}/tienda/checkout/status?wompi_success=1&order_id=${compra.id}&total=${total_usd}`,
      customer_data: {
        full_name: [nombre, apellido].filter(Boolean).join(' ') || email,
        phone_number: '',
      },
    }, privateKey, environment)

    // Guardar transaction_id en metadata
    await supabase
      .from('compras')
      .update({ metadata: { ...compra.metadata, wompi_transaction_id: wompiRes.data.id } })
      .eq('id', compra.id)

    return NextResponse.json({
      success: true,
      wompi_transaction_id: wompiRes.data.id,
      public_key: publicKey,
      reference,
      amount_in_cents: totalCents,
      currency: 'USD',
      orden_id: compra.id,
      environment,
    })
  } catch (error: any) {
    console.error('[get-wompi-token]', error)
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 })
  }
}
