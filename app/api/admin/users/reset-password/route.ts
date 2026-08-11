import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { sendTemplateEmail } from '@/lib/email/sendTemplateEmail'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    const { userId, password, sendEmail } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 })
    }

    if (sendEmail) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, nombre')
        .eq('id', userId)
        .single()

      if (!profile?.email) {
        return NextResponse.json({ error: 'No se encontró el email del usuario' }, { status: 404 })
      }

      // Generar link de recuperación de Supabase (el usuario elegirá su contraseña)
      const siteUrl = (() => {
        const env = process.env.NEXT_PUBLIC_SITE_URL
        if (env && !env.includes('localhost') && !env.includes('127.0.0.1')) return env
        if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        return 'https://xpandcapital.org'
      })()
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: profile.email,
        options: { redirectTo: `${siteUrl}/reset-password` },
      })

      const resetLink = linkData?.properties?.action_link || `${siteUrl}/reset-password`
      if (linkError) {
        console.error('[reset-password] Error generando link:', linkError.message)
        return NextResponse.json({ error: `Error al generar enlace: ${linkError.message}` }, { status: 500 })
      }

      await sendTemplateEmail({
        evento: 'cuenta_restablecer_password',
        to: profile.email,
        variables: {
          nombre: profile.nombre || 'Cliente',
          email: profile.email,
          enlace_restablecer: resetLink,
        },
      })

      return NextResponse.json({ success: true, message: 'Email de restablecimiento enviado.' })
    }

    if (!password) {
      return NextResponse.json({ error: 'password es requerido cuando no se envía email' }, { status: 400 })
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password,
    })

    if (updateError) {
      const { data: allUsers } = await supabase.auth.admin.listUsers()
      const user = allUsers?.users?.find(u => u.id === userId)
      if (!user) {
        return NextResponse.json({ error: 'Usuario no encontrado en auth' }, { status: 404 })
      }
      return NextResponse.json({ error: `Error al cambiar contraseña: ${updateError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API Error] /api/admin/users/reset-password:', error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}
