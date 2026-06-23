import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthUser } from '@/lib/supabase/api-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('login_history')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, sessions: data || [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Obtener el email del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', auth.userId)
      .single()

    if (!profile?.email) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Invalidar todas las sesiones excepto la actual (sign out from all devices)
    const { error } = await supabase.auth.admin.signOut(auth.userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}
