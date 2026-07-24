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

    const { data: keys } = await supabase
      .from('api_keys').select('key_name, key_value')
      .in('key_name', ['wompi_public_key', 'wompi_integrity_key'])
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .or(`user_id.is.null,is_global.eq.true`)

    const getKey = (name: string) => keys?.find((k: any) => k.key_name === name)?.key_value || ''
    const publicKey = decryptApiKey(getKey('wompi_public_key'))
    const integrityKey = decryptApiKey(getKey('wompi_integrity_key'))

    if (!publicKey) {
      return NextResponse.json({ error: 'Wompi Public Key no configurada' }, { status: 400 })
    }
    const tasaCambio = parseFloat(process.env.WOMPI_USD_COP_RATE || '4000')
    const totalCopCents = Math.round(total_usd * tasaCambio) * 100

    const productoPrincipal = productos[0]

    const { data: compra, error: compraError } = await supabase
      .from('compras').insert({
        empresa_id: DEFAULT_EMPRESA_ID,
        user_id: user_id || null,
        producto_id: productoPrincipal?.id || null,
        metodo_pago: 'wompi', monto_usd: total_usd, moneda: 'USD', estado: 'pendiente',
        metadata: { productos, email_cliente: email, nombre_cliente: [nombre, apellido].filter(Boolean).join(' '), tiene_fisicos: !!tiene_fisicos, direccion_envio: direccion_envio || null },
      }).select('id').single()

    if (compraError) {
      return NextResponse.json({ error: `Error creando orden: ${compraError.message}` }, { status: 500 })
    }

    const items = productos.map((p: any) => ({ compra_id: compra.id, producto_id: p.id, cantidad: p.cantidad || 1, precio_unitario: p.price, product_type: p.productType || 'digital' }))
    await supabase.from('compra_items').insert(items)

    const reference = compra.id.slice(0, 12)
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://xpancapital.vercel.app'}/tienda/checkout/status?wompi_success=1&order_id=${compra.id}&total=${total_usd}`

    // Generar firma de integridad Wompi
    let signature = ''
    if (integrityKey) {
      const enc = new TextEncoder()
      const sigData = `${reference}${totalCopCents}COP${integrityKey}`
      const hash = await crypto.subtle.digest('SHA-256', enc.encode(sigData))
      signature = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
    }

    return NextResponse.json({
      success: true,
      public_key: publicKey,
      reference,
      amount_in_cents: totalCopCents,
      currency: 'COP',
      orden_id: compra.id,
      redirect_url: redirectUrl,
      signature,
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
