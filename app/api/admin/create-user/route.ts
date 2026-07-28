import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generateSecurePassword } from '@/lib/crypto'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const EMPRESA_ID = DEFAULT_EMPRESA_ID

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const { nombre, apellido, email, password, rol } = body

    if (!nombre || !email) {
      return NextResponse.json({ error: 'Nombre y email son requeridos' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const generatedPassword = password || generateSecurePassword()

    // 1. Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === normalizedEmail)

    if (existingUser) {
      return NextResponse.json({ error: 'Ya existe un usuario con este email' }, { status: 409 })
    }

    // 2. Create Supabase Auth user con app_metadata para el rol
    const userRol = rol || 'usuario'
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password: generatedPassword,
      email_confirm: true,
      user_metadata: {
        nombre,
        empresa_id: EMPRESA_ID,
      },
      app_metadata: {
        rol: userRol,
        empresa_id: EMPRESA_ID,
      },
    })

    if (createError) {
      return NextResponse.json({ error: `Error creando usuario: ${createError.message}` }, { status: 500 })
    }

    const userId = newUser.user?.id

    if (userId) {
      // 3. Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: normalizedEmail,
          nombre,
          apellido: apellido || null,
          empresa_id: EMPRESA_ID,
          rol: rol || 'usuario',
          creado_en: new Date().toISOString(),
        }, { onConflict: 'id' })

      if (profileError) {
        console.error('Error creating profile:', profileError)
      }
    }

    return NextResponse.json({
      success: true,
      userId,
      generatedPassword: password ? undefined : generatedPassword,
    })
  } catch (error) {
    console.error('[API Error] /api/admin/create-user:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}