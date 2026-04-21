import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae'

function generatePassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const {
      nombre, email, phone, phone_code, document_id,
      password, commission_type, commission_value, commission_trigger_percent,
      notes, postulante_id, puesto, rol, lugar_residencia, estado_civil,
      nivel_estudios, aspiracion_salarial, disponibilidad_inmediata,
      disponibilidad_viaje, acceso_tecnologia, herramientas,
    } = body

    if (!nombre || !email) {
      return NextResponse.json({ error: 'Nombre y email son requeridos' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === normalizedEmail)

    let userId: string | null = null
    let generatedPassword = password || generatePassword()
    let isNewUser = false

    if (existingUser) {
      userId = existingUser.id
    } else {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password: generatedPassword,
        email_confirm: true,
        user_metadata: { nombre, empresa_id: EMPRESA_ID },
      })

      if (createError) {
        return NextResponse.json({ error: `Error creando usuario de autenticación: ${createError.message}` }, { status: 500 })
      }

      userId = newUser.user?.id || null
      isNewUser = true

      if (userId) {
        await supabase.from('profiles').upsert({
          id: userId,
          email: normalizedEmail,
          nombre,
          empresa_id: EMPRESA_ID,
rol: rol || 'empleado',
          telefono: phone || null,
          creado_en: new Date().toISOString(),
        }, { onConflict: 'id' })
      }
    }

    const { data: existingAdvisor } = await supabase
      .from('advisors')
      .select('id')
      .eq('email', normalizedEmail)
      .single()

    if (existingAdvisor) {
      return NextResponse.json({
        success: true,
        data: existingAdvisor,
        message: 'Ya existe un asesor con este email',
        isNewUser,
      })
    }

    const { data: advisor, error: advisorError } = await supabase
      .from('advisors')
      .insert({
        name: nombre,
        email: normalizedEmail,
        phone: phone || '',
        phone_code: phone_code || '+593',
        document_id: document_id || '',
        puesto: puesto || null,
        rol: rol || 'empleado',
        lugar_residencia: lugar_residencia || null,
        estado_civil: estado_civil || null,
        nivel_estudios: nivel_estudios || null,
        aspiracion_salarial: aspiracion_salarial || null,
        disponibilidad_inmediata: disponibilidad_inmediata !== undefined ? disponibilidad_inmediata : true,
        disponibilidad_viaje: disponibilidad_viaje || null,
        acceso_tecnologia: acceso_tecnologia || null,
        herramientas: herramientas || null,
        commission_type: commission_type || 'percentage',
        commission_value: commission_value || 0,
        commission_trigger_percent: commission_trigger_percent || 30,
        is_active: true,
        auth_user_id: userId,
        notes: notes || '',
        postulante_id: postulante_id || null,
        aceptado_en: postulante_id ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (advisorError) {
      return NextResponse.json({ error: `Error creando asesor: ${advisorError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: advisor,
      isNewUser,
      generatedPassword: isNewUser ? generatedPassword : undefined,
    })
  } catch (error) {
    console.error('[API Error] /api/admin/equipo:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { id, rol, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    // Update advisor record
    const advisorUpdates = { ...updates }
    if (rol) advisorUpdates.rol = rol

    const { data: advisor, error } = await supabase
      .from('advisors')
      .update(advisorUpdates)
      .eq('id', id)
      .select('*, auth_user_id, email')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Sync role to profile if the advisor has an auth user
    if (rol && advisor?.auth_user_id) {
      await supabase
        .from('profiles')
        .update({ rol, nombre: advisor.name, actualizado_en: new Date().toISOString() })
        .eq('id', advisor.auth_user_id)
    }

    // Sync permisos_adicionales if provided
    if (body.permisos_adicionales !== undefined && advisor?.auth_user_id) {
      await supabase
        .from('profiles')
        .update({ permisos_adicionales: body.permisos_adicionales })
        .eq('id', advisor.auth_user_id)
    }

    return NextResponse.json({ success: true, data: advisor })
  } catch (error) {
    console.error('[API Error] /api/admin/equipo PUT:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    const { error } = await supabase
      .from('advisors')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Error] /api/admin/equipo DELETE:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}