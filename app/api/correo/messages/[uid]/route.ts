export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/api-auth'
import { decrypt } from '@/app/superadmin/correo/_lib/crypto'
import { connectImap, fetchFullMessage } from '@/app/superadmin/correo/_lib/imapClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ uid: string }> }
) {
  const auth = await getAuthUser(request)
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const cuentaId = searchParams.get('cuenta_id')
  const folder = searchParams.get('folder') || 'INBOX'
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

    const parsed = await fetchFullMessage(client, folder, uid, true)
    await client.logout()

    if (!parsed) {
      return NextResponse.json({ error: 'Mensaje no encontrado' }, { status: 404 })
    }

    return NextResponse.json(parsed)
  } catch (error: any) {
    console.error('[messages/uid] Error:', error)
    return NextResponse.json({ error: error.message || 'Error al cargar mensaje' }, { status: 500 })
  }
}

