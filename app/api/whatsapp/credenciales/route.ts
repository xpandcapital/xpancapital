import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/api-auth'
import { sendWhatsApp } from '@/lib/whatsapp'

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { phone, password, email, nombre } = await request.json()
    if (!phone || !password) {
      return NextResponse.json({ error: 'phone y password requeridos' }, { status: 400 })
    }

    const mensaje = `*Xpand Capital* - Tus credenciales de acceso:\n\n📧 Email: ${email || '—'}\n🔑 Contraseña: ${password}\n🌐 Accede en: https://xpancapital.vercel.app/login\n\nGuarda esta contraseña en un lugar seguro.`

    const result = await sendWhatsApp({ number: phone, message: mensaje })

    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al enviar WhatsApp' }, { status: 500 })
  }
}
