import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendTemplateEmail } from '@/lib/email/sendTemplateEmail'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

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

    // Enviar email con plantilla
    const meta = (orden.metadata || {}) as Record<string, unknown>
    const email = (meta.email_cliente as string) || ''
    const nombre = (meta.nombre_cliente as string) || 'Cliente'
    const productos = (meta.productos as Array<{ nombre: string }>) || []

    if (email && productos.length > 0) {
      const nombresList = productos
        .map((p: any) => `<li style="margin-bottom:6px;font-size:14px;color:#e5e7eb;">✅ ${p.nombre || 'Producto'}</li>`)
        .join('')

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blis-corp.com'
      const fecha = orden.creado_en
        ? new Date(orden.creado_en).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
        : ''

      await sendTemplateEmail({
        evento: orden.user_id ? 'transaccion_compra_completada_logueado' : 'transaccion_compra_completada_invitado',
        empresa_id: DEFAULT_EMPRESA_ID,
        to: email,
        variables: {
          nombre,
          email,
          productos: `<ul style="margin:0;padding:0;list-style:none;">${nombresList}</ul>`,
          total: `$${orden.monto_usd?.toFixed(2) || '0'} USD`,
          metodo_pago: orden.metodo_pago === 'izipay' ? 'Izipay (Tarjeta de débito/crédito)' : (orden.metodo_pago || ''),
          fecha_compra: fecha,
          enlace_acceso: `<a href="${siteUrl}/miembros" target="_blank">Acceder a Mis Productos →</a>`,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Izipay Confirm] Error:', err)
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
