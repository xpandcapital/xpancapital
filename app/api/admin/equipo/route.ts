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
      nombre,
      email,
      phone,
      phone_code,
      document_id,
      password,
      commission_type,
      commission_value,
      commission_trigger_percent,
      notes,
      postulante_id,
    } = body

    if (!nombre || !email) {
      return NextResponse.json({ error: 'Nombre y email son requeridos' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // 1. Check if user already exists in auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === normalizedEmail)

    let userId: string | null = null
    let generatedPassword = password || generatePassword()
    let isNewUser = false

    if (existingUser) {
      userId = existingUser.id
    } else {
      // 2. Create Supabase Auth user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password: generatedPassword,
        email_confirm: true,
        user_metadata: {
          nombre,
          empresa_id: EMPRESA_ID,
        },
      })

      if (createError) {
        return NextResponse.json({ error: `Error creando usuario de autenticación: ${createError.message}` }, { status: 500 })
      }

      userId = newUser.user?.id || null
      isNewUser = true

      if (userId) {
        // 3. Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email: normalizedEmail,
            nombre,
            empresa_id: EMPRESA_ID,
            rol: 'editor',
            creado_en: new Date().toISOString(),
          }, { onConflict: 'id' })

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }
      }
    }

    // 4. Check if advisor already exists
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

    // 5. Create advisor record
    const { data: advisor, error: advisorError } = await supabase
      .from('advisors')
      .insert({
        name: nombre,
        email: normalizedEmail,
        phone: phone || '',
        phone_code: phone_code || '+593',
        document_id: document_id || '',
        commission_type: commission_type || 'percentage',
        commission_value: commission_value || 0,
        commission_trigger_percent: commission_trigger_percent || 30,
        is_active: true,
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
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('advisors')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
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