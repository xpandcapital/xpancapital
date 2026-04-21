import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { postulante_id, correo_corporativo, contrasena_asignada } = body

    if (!postulante_id) {
      return NextResponse.json({ error: 'ID del postulante es requerido' }, { status: 400 })
    }

    const { data: postulante, error: postulanteError } = await supabase
      .from('postulantes')
      .select('*')
      .eq('id', postulante_id)
      .single()

    if (postulanteError || !postulante) {
      return NextResponse.json({ error: 'Postulante no encontrado' }, { status: 404 })
    }

    if (postulante.usuario_creado) {
      return NextResponse.json({ error: 'El usuario ya fue creado anteriormente' }, { status: 400 })
    }

    const email = (correo_corporativo || postulante.correo_contacto || '').toLowerCase().trim()
    const password = contrasena_asignada || Math.random().toString(36).slice(-10) + 'Aa1!'

    if (!email) {
      return NextResponse.json({ error: 'Se requiere un correo corporativo o de contacto' }, { status: 400 })
    }

    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === email)

    if (existingUser) {
      return NextResponse.json({ error: `Ya existe un usuario con el correo ${email}` }, { status: 409 })
    }

    const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nombre: postulante.nombre_completo || 'Sin nombre',
        empresa_id: EMPRESA_ID,
      },
    })

    if (authError) {
      return NextResponse.json({ error: `Error creando usuario: ${authError.message}` }, { status: 500 })
    }

    if (!newUser.user?.id) {
      return NextResponse.json({ error: 'Error: usuario creado sin ID' }, { status: 500 })
    }

    await supabase.from('profiles').upsert({
      id: newUser.user.id,
      email,
      nombre: postulante.nombre_completo || 'Sin nombre',
      empresa_id: EMPRESA_ID,
      rol: 'empleado',
      telefono: postulante.celular_contacto || null,
      creado_en: new Date().toISOString(),
    }, { onConflict: 'id' })

    await supabase
      .from('postulantes')
      .update({
        correo_corporativo: email,
        contrasena_asignada: password,
        usuario_creado: true,
      })
      .eq('id', postulante_id)

    return NextResponse.json({
      success: true,
      data: {
        user_id: newUser.user.id,
        email,
        password,
      },
    })
  } catch (error: any) {
    console.error('[API Error] /api/postulantes/create-user:', error)
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}