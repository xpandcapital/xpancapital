import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTemplateEmail } from '@/lib/email/sendTemplateEmail'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

export const dynamic = 'force-dynamic'

let _supabase: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (_supabase) return _supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  _supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
  return _supabase
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email requerido' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Buscar usuario en auth
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) {
      console.error('[forgot-password] Error listando usuarios:', listError.message)
      return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
    }

    const user = usersData?.users?.find(u => u.email?.toLowerCase() === normalizedEmail)

    if (!user) {
      return NextResponse.json({ success: true })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blis-corp.com'

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: normalizedEmail,
      options: { redirectTo: `${siteUrl}/reset-password` },
    })

    if (linkError || !linkData?.properties?.action_link) {
      console.error('[forgot-password] Error generando link:', linkError?.message)
      return NextResponse.json({ success: false, error: 'No se pudo generar el enlace' }, { status: 500 })
    }

    const resetLink = linkData.properties.action_link

    const { data: templateRow } = await supabase
      .from('email_templates')
      .select('evento, nombre')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .or('evento.ilike.%restablecer%,nombre.ilike.%restablecer%')
      .maybeSingle()

    const evento = templateRow?.evento || 'cuenta_restablecer_password'

    await sendTemplateEmail({
      evento,
      subject: 'Restablecer contraseña — BLIS Corp',
      to: normalizedEmail,
      variables: {
        nombre: user.user_metadata?.nombre || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        enlace_restablecer: resetLink,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[forgot-password] Error:', error)
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}
