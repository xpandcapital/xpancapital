import { NextRequest, NextResponse } from 'next/server'
import { sendTemplateEmail } from '@/lib/email/sendTemplateEmail'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = body.email || 'test@xpandcapital.org'
    const passwordTemporal = body.password || 'TESTPASS123'
    const imagen = body.imagen || 'https://www.xpandcapital.org/images/placeholder-product.jpg'

    console.log('[test-email] Iniciando prueba para:', email)

    const result = await sendTemplateEmail({
      evento: 'transaccion_compra_completada_invitado',
      to: email,
      subject: 'Prueba - Compra Exitosa',
      variables: {
        nombre: 'Juan',
        apellido: 'Perez',
        email,
        password_temporal: passwordTemporal,
        enlace_crear_cuenta: 'https://www.xpandcapital.org/login',
        productos: '<ul><li>Producto de prueba</li></ul>',
        total: '100.00',
        subtotal: '100.00',
        metodo_pago: 'transfer',
        fecha_compra: '22 de junio de 2026',
        enlace_acceso: 'https://www.xpandcapital.org/miembros',
        descuento_monto: '0.00',
        cupon: '',
      },
      products: [
        {
          nombre: 'Producto de Prueba',
          precio: '100.00',
          cantidad: 1,
          categoria: 'Cursos',
          imagen,
        },
      ],
    })

    console.log('[test-email] Resultado:', result)

    return NextResponse.json({ success: result, message: 'Email de prueba enviado' })
  } catch (error) {
    console.error('[test-email] Error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

