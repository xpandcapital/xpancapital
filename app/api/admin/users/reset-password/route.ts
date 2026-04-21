import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

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
        .select('email')
        .eq('id', userId)
        .single()

      if (!profile?.email) {
        return NextResponse.json({ error: 'No se encontró el email del usuario' }, { status: 404 })
      }

      const { error: resetError } = await supabase.auth.admin.updateUserById(userId, {
        password: password || undefined,
      })

      if (resetError) {
        return NextResponse.json({ error: `Error al resetear contraseña: ${resetError.message}` }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Contraseña actualizada. Se debería enviar un email al usuario.' })
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