import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { email, password } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email es requerido' }, { status: 400 })
    }

    const newPassword = password || Math.random().toString(36).slice(-10) + 'Aa1!'

    const { data, error } = await supabase.auth.admin.updateUserById(
      email,
      { password: newPassword }
    )

    // Try by email first - need to find the user ID
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const user = existingUsers?.users?.find(u => u.email === email.toLowerCase().trim())

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) {
      return NextResponse.json({ error: `Error cambiando contraseña: ${updateError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      generatedPassword: password ? undefined : newPassword,
    })
  } catch (error) {
    console.error('[API Error] /api/admin/equipo/reset-password:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}