import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { decryptApiKey } from '@/lib/api-crypto'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() { return createClient(supabaseUrl, supabaseServiceKey) }

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { productos, total_usd, email, nombre, apellido, pais, tiene_fisicos, direccion_envio, user_id, telefono } = body

    if (!productos?.length || !total_usd || !email) {
      return NextResponse.json({ error: 'productos, total_usd y email requeridos' }, { status: 400 })
    }

    // Obtener keys de Wompi
    const { data: keys } = await supabase
      .from('api_keys')
      .select('key_name, key_value')
      .in('key_name', ['wompi_public_key', 'wompi_private_key', 'wompi_integrity_key'])
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .or(`user_id.is.null,is_global.eq.true`)

    if (!keys || keys.length < 3) {
      return NextResponse.json({ error: 'Keys de Wompi no configuradas' }, { status: 400 })
    }

    const getKey = (name: string) => keys.find((k: any) => k.key_name === name)?.key_value || ''
    const publicKey = decryptApiKey(getKey('wompi_public_key'))
    const privateKey = decryptApiKey(getKey('wompi_private_key'))
    const integrityKey = decryptApiKey(getKey('wompi_integrity_key'))

    // Crear orden en Supabase
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
      .select('id')
      .single()

    if (compraError) {
      return NextResponse.json({ error: `Error creando orden: ${compraError.message}` }, { status: 500 })
    }

    // Crear items
    const items = productos.map((p: any) => ({
      compra_id: compra.id,
      producto_id: p.id,
      cantidad: p.cantidad || 1,
      precio_unitario: p.price,
      product_type: p.productType || 'digital',
    }))
    await supabase.from('compra_items').insert(items)

    const reference = compra.id.slice(0, 12)
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://xpancapital.vercel.app'}/tienda/checkout/status?wompi_success=1&order_id=${compra.id}&total=${total_usd}`

    // Wompi Colombia: convertir USD a COP
    const tasaCambio = parseFloat(process.env.WOMPI_USD_COP_RATE || '4000')
    const totalCop = Math.round(total_usd * tasaCambio)
    const totalCopCents = totalCop * 100

    // Generar firma de integridad
    const enc = new TextEncoder()
    const sigData = `${reference}${totalCopCents}COP${integrityKey}`
    const hash = await crypto.subtle.digest('SHA-256', enc.encode(sigData))
    const signature = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')

    // Crear link de pago en Wompi
    const baseUrl = process.env.WOMPI_ENV === 'production' ? 'https://production.wompi.co/v1' : 'https://sandbox.wompi.co/v1'

    const wompiRes = await fetch(`${baseUrl}/payment_links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${privateKey}` },
      body: JSON.stringify({
        name: productoPrincipal?.title || 'Compra en Xpand Capital',
        description: productos.map((p: any) => p.title).join(', '),
        single_use: true,
        amount_in_cents: totalCopCents,
        currency: 'COP',
        signature,
        reference,
        expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hora
        redirect_url: redirectUrl,
      }),
    })

    if (!wompiRes.ok) {
      const errText = await wompiRes.text()
      console.error('[create-payment-link]', errText)
      return NextResponse.json({ error: 'Error al crear link de pago en Wompi' }, { status: 500 })
    }

    const wompiData = await wompiRes.json()

    // Guardar link en metadata
    await supabase
      .from('compras')
      .update({ metadata: { ...(compra as any).metadata, wompi_link_id: wompiData.data?.id } } as any)
      .eq('id', compra.id)

    return NextResponse.json({
      success: true,
      payment_url: `https://checkout.wompi.co/l/${wompiData.data?.id}`,
      orden_id: compra.id,
    })
  } catch (error: any) {
    console.error('[get-wompi-token]', error?.message || error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
