import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get('empresa_id') || DEFAULT_EMPRESA_ID

    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, email, nombre, apellido, rol, avatar_url, creado_en')
      .eq('empresa_id', empresaId)
      .order('nombre')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, users: users || [] })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { email, nombre, apellido, rol, empresa_id, password } = body

    if (!email || !nombre || !empresa_id) {
      return NextResponse.json({ error: 'Email, nombre y empresa_id son requeridos' }, { status: 400 })
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: password || Math.random().toString(36).slice(-12) + '!Aa1',
      email_confirm: true,
      user_metadata: { nombre, empresa_id },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    if (authData.user) {
      await supabase.from('profiles').upsert({
        id: authData.user.id,
        email: email.toLowerCase().trim(),
        nombre,
        apellido: apellido || '',
        rol: rol || 'editor',
        empresa_id,
      }, { onConflict: 'id' })
    }

    return NextResponse.json({ success: true, user: authData.user })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { userId, empresa_id, rol } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}
    if (empresa_id) updates.empresa_id = empresa_id
    if (rol) updates.rol = rol
    updates.actualizado_en = new Date().toISOString()

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (rol && data) {
      await supabase.auth.admin.updateUserById(userId, {
        app_metadata: { rol, empresa_id: data.empresa_id }
      })
    }

    return NextResponse.json({ success: true, user: data })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 })
    }

    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}