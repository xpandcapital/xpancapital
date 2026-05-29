import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createUserAndNotify } from '@/lib/email/createUserAndNotify'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ordenId } = body as { ordenId: string }

    if (!ordenId) {
      return NextResponse.json({ success: false, error: 'Falta ordenId' }, { status: 400 })
    }

    const supabase = createClient()

    const { data: orden, error: selectError } = await supabase
      .from('compras')
      .select('id, estado, metadata, user_id, monto_usd, metodo_pago, creado_en')
      .eq('id', ordenId)
      .maybeSingle()

    if (selectError || !orden) {
      return NextResponse.json({ success: false, error: 'Orden no encontrada' }, { status: 404 })
    }

    if (orden.estado === 'completado') {
      return NextResponse.json({ success: true, msg: 'Ya estaba completada' })
    }

    const { error } = await supabase
      .from('compras')
      .update({ estado: 'completado', actualizado_en: new Date().toISOString() })
      .eq('id', ordenId)

    if (error) {
      console.error('[Izipay Confirm] Error:', error)
      return NextResponse.json({ success: false, error: 'Error al actualizar' }, { status: 500 })
    }

    console.log('[Izipay Confirm] Recibido para ordenId:', ordenId, 'email:', email)

    // Crear usuario (si es invitado) + enviar email
    const meta = (orden.metadata || {}) as Record<string, unknown>
    const email = (meta.email_cliente as string) || ''
    const nombre = (meta.nombre_cliente as string) || 'Cliente'
    const productos = (meta.productos as Array<{ nombre: string }>) || []

    if (email && productos.length > 0) {
      console.log('[Izipay Confirm] Llamando createUserAndNotify...')
      const prodNames = productos.map((p: any) => p.nombre || 'Producto')
      const prodPrices = productos.map((p: any) => ({
        nombre: p.nombre || 'Producto',
        precio: p.precio_unitario?.toFixed(2) || orden.monto_usd?.toFixed(2) || '0',
        cantidad: p.cantidad || 1,
        categoria: p.productType || '',
        imagen: p.imagen || '',
      }))
      const { userId, isNewUser } = await createUserAndNotify({
        email, nombre,
        isGuest: !orden.user_id,
        productos: prodNames,
        total: `$${orden.monto_usd?.toFixed(2) || '0'} USD`,
        metodo_pago: orden.metodo_pago === 'izipay' ? 'Izipay (Tarjeta)' : (orden.metodo_pago || ''),
        productPrices: prodPrices,
      })
      console.log('[Izipay Confirm] createUserAndNotify result:', { userId, isNewUser })

      // Vincular usuario a la orden si se creó
      if (userId && !orden.user_id) {
        await supabase.from('compras').update({ user_id: userId }).eq('id', ordenId)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Izipay Confirm] Error:', err)
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
