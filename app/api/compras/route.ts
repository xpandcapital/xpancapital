import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    const {
      user_id,
      empresa_id = DEFAULT_EMPRESA_ID,
      productos,
      metodo_pago,
      monto_coins = 0,
      monto_usd = 0,
      direccion_envio
    } = body

    if (!user_id || !productos || productos.length === 0) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    // Create the order
    const { data: compra, error: compraError } = await supabase
      .from('compras')
      .insert({
        empresa_id,
        user_id,
        metodo_pago,
        monto_coins,
        monto_usd,
        moneda: 'USD',
        estado: metodo_pago === 'coins' ? 'completado' : 'pendiente',
        direccion_envio
      })
      .select()
      .single()

    if (compraError) {
      return NextResponse.json({ error: compraError.message }, { status: 500 })
    }

    // Create order items
    const items = productos.map((p: { producto_id: string; cantidad: number; precio_unitario: number }) => ({
      compra_id: compra.id,
      producto_id: p.producto_id,
      cantidad: p.cantidad,
      precio_unitario: p.precio_unitario
    }))

    const { error: itemsError } = await supabase
      .from('compra_items')
      .insert(items)

    if (itemsError) {
      // Rollback the order
      await supabase.from('compras').delete().eq('id', compra.id)
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    // Create transaction record
    await supabase
      .from('boveda_transacciones')
      .insert({
        empresa_id,
        user_id,
        tipo: metodo_pago === 'coins' ? 'canje' : 'compra',
        monto: metodo_pago === 'coins' ? -monto_coins : 0,
        descripcion: `Compra #${compra.id}`,
        referencia_id: compra.id,
        referencia_tipo: 'compra'
      })

    // Check if user was referred and grant commission to referrer
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('referido_por')
      .eq('id', user_id)
      .single()

    if (userProfile?.referido_por) {
      // Get company config for referral commission percentage
      const { data: config } = await supabase
        .from('empresa_config')
        .select('comision_referidor_pct')
        .eq('empresa_id', empresa_id)
        .single()

      const commissionPercentage = config?.comision_referidor_pct || 5 // Default 5%
      
      // Calculate commission based on purchase amount
      const commissionBase = metodo_pago === 'coins' ? monto_coins : monto_usd
      const commissionAmount = Math.round(commissionBase * (commissionPercentage / 100))

      if (commissionAmount > 0) {
        // Get referrer's current coins
        const { data: referrerProfile } = await supabase
          .from('profiles')
          .select('xpand_coins')
          .eq('id', userProfile.referido_por)
          .single()

        // Grant commission to referrer
        await supabase
          .from('profiles')
          .update({ 
            xpand_coins: (referrerProfile?.xpand_coins || 0) + commissionAmount
          })
          .eq('id', userProfile.referido_por)

        // Create commission record
        await supabase
          .from('referidos_comisiones')
          .insert({
            empresa_id,
            referidor_id: userProfile.referido_por,
            referido_id: user_id,
            monto: commissionAmount,
            tipo: 'compra',
            descripcion: `Comisión por compra de referido`,
            pagado: true
          })

        // Create transaction for referrer
        await supabase
          .from('boveda_transacciones')
          .insert({
            empresa_id,
            user_id: userProfile.referido_por,
            tipo: 'comision_recibida',
            monto: commissionAmount,
            descripcion: `Comisión por compra de referido`,
            referencia_id: compra.id,
            referencia_tipo: 'compra'
          })
      }
    }

    return NextResponse.json({ success: true, data: compra })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json({ error: 'user_id es requerido' }, { status: 400 })
    }

    // Buscar compras por user_id directo
    const { data: comprasPorUserId, error: err1 } = await supabase
      .from('compras')
      .select(`
        *,
        items:compra_items(
          cantidad,
          precio_unitario,
          product_type,
          producto:productos(id, nombre, imagen_principal, tipo, archivo_url, slug, curso_id, categoria:producto_categorias(nombre))
        )
      `)
      .eq('user_id', user_id)
      .order('creado_en', { ascending: false })

    if (err1) {
      return NextResponse.json({ error: err1.message }, { status: 500 })
    }

    // También buscar compras huérfanas (user_id NULL) cuyo metadata.email_cliente coincida
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user_id)
      .single()

    let comprasPorEmail: any[] = []
    if (userProfile?.email) {
      const { data: orphanCompras, error: err2 } = await supabase
        .from('compras')
        .select(`
          *,
          items:compra_items(
            cantidad,
            precio_unitario,
            product_type,
            producto:productos(id, nombre, imagen_principal, tipo, archivo_url, slug, curso_id, categoria:producto_categorias(nombre))
          )
        `)
        .is('user_id', null)
        .eq('metadata->>email_cliente', userProfile.email.toLowerCase())
        .eq('estado', 'completado')
        .order('creado_en', { ascending: false })

      if (!err2 && orphanCompras) {
        comprasPorEmail = orphanCompras
        // Reparar: asignar user_id a estas compras huérfanas
        for (const compra of comprasPorEmail) {
          await supabase
            .from('compras')
            .update({ user_id })
            .eq('id', compra.id)
        }
      }
    }

    // Combinar sin duplicados (priorizando las que ya tenían user_id)
    const existingIds = new Set(comprasPorUserId?.map(c => c.id) || [])
    const allCompras = [
      ...(comprasPorUserId || []),
      ...comprasPorEmail.filter(c => !existingIds.has(c.id))
    ]

    return NextResponse.json({ success: true, data: allCompras })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}