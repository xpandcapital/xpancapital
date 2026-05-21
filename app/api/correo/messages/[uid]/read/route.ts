import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/api-auth'
import { decrypt } from '@/app/superadmin/correo/_lib/crypto'
import { connectImap, markAsRead } from '@/app/superadmin/correo/_lib/imapClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ uid: string }> }
) {
  const auth = await getAuthUser(request)
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const cuentaId = body.cuenta_id
  const folder = body.folder || 'INBOX'
  const params = await context.params
  const uid = parseInt(params.uid)

  if (!cuentaId) return NextResponse.json({ error: 'cuenta_id requerido' }, { status: 400 })
  if (isNaN(uid)) return NextResponse.json({ error: 'UID inválido' }, { status: 400 })

  try {
    const { data: cuenta } = await supabase
      .from('email_cuentas')
      .select('*, servidor:email_servidores(*)')
      .eq('id', cuentaId)
      .eq('user_id', auth.userId)
      .single()

    if (!cuenta) return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })

    const servidor = (cuenta as any).servidor
    if (!servidor) return NextResponse.json({ error: 'Servidor no configurado' }, { status: 404 })

    const client = await connectImap({
      host: servidor.imap_host,
      port: servidor.imap_port,
      secure: servidor.imap_secure,
      user: cuenta.email,
      pass: decrypt(cuenta.password_enc),
    })

    await markAsRead(client, folder, uid)
    await client.logout()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[read] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
