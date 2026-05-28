import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'

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
      .select('id, estado, metadata, user_id, monto_usd')
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

    // Enviar email de confirmación
    const meta = (orden.metadata || {}) as Record<string, unknown>
    const email = (meta.email_cliente as string) || ''
    const nombre = (meta.nombre_cliente as string) || 'Cliente'
    const productos = (meta.productos as Array<{ nombre: string }>) || []
    const nombres = productos.map((p: any) => p.nombre || 'Producto').filter(Boolean)

    if (email && nombres.length > 0) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        })

        const list = nombres.map(p => `<li style="margin-bottom:6px;">✅ ${p}</li>`).join('')

        await transporter.sendMail({
          from: `"BLIS Corp" <${process.env.SMTP_USER}>`,
          to: email,
          subject: '✅ Pago confirmado — BLIS Corp',
          html: `
            <div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#050505;color:#fff;font-family:Arial,sans-serif;">
              <div style="text-align:center;margin-bottom:24px;">
                <span style="background:#be0b24;padding:12px 24px;border-radius:12px;font-size:20px;font-weight:900;letter-spacing:2px;">BLIS Corp</span>
              </div>
              <h1 style="font-size:24px;font-weight:900;text-transform:uppercase;text-align:center;">¡Pago Confirmado!</h1>
              <p style="text-align:center;color:#9ca3af;">Gracias <strong style="color:#fff">${nombre}</strong>, hemos recibido tu pago de <strong style="color:#4ade80">$${orden.monto_usd?.toFixed(2) || '0'}</strong>.</p>
              <div style="background:#111;border:1px solid #222;border-radius:16px;padding:24px;margin:24px 0;">
                <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#6b7280;margin:0 0 16px;">Productos Adquiridos</h3>
                <ul style="margin:0;padding:0;list-style:none;font-size:14px;color:#e5e7eb;">${list}</ul>
              </div>
              <div style="text-align:center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://blis-corp.com'}/miembros" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;font-weight:900;font-size:14px;text-transform:uppercase;letter-spacing:2px;padding:16px 40px;border-radius:12px;">Acceder a Mis Productos →</a>
              </div>
              <p style="text-align:center;color:#4b5563;font-size:11px;margin-top:24px;">BLIS Corp · Gracias por tu compra</p>
            </div>
          `,
        })
        console.log(`[Izipay Confirm] Email enviado a ${email}`)
      } catch (e) {
        console.error('[Izipay Confirm] Error enviando email:', e)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Izipay Confirm] Error:', err)
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
