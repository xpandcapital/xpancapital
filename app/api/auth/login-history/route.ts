import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthUser } from '@/lib/supabase/api-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         '127.0.0.1'
}

function getCountry(request: NextRequest): string {
  return request.headers.get('x-vercel-ip-country') || 'Desconocido'
}

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

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const ip = getClientIP(request)
    const pais = getCountry(request)

    await supabase.from('login_history').insert({
      user_id: auth.userId,
      email: auth.email || '',
      ip,
      pais,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
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

    // Invalidar sesiones del usuario via GoTrue Admin REST API
    const gotrueUrl = `${supabaseUrl}/auth/v1/admin/users/${auth.userId}/sessions`
    const response = await fetch(gotrueUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const body = await response.text()
      console.error('[login-history] Error invalidando sesiones:', response.status, body)
      return NextResponse.json({ error: 'No se pudieron cerrar las sesiones' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Sesiones cerradas en otros dispositivos' })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}
