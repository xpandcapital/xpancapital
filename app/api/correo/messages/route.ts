import { supabase } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/api-auth'
import { decrypt } from '@/app/superadmin/correo/_lib/crypto'
import { connectImap, fetchMessageHeaders } from '@/app/superadmin/correo/_lib/imapClient'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const cuentaId = searchParams.get('cuenta_id')
  const folder = searchParams.get('folder') || 'INBOX'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const searchQuery = searchParams.get('search') || ''

  if (!cuentaId) return NextResponse.json({ error: 'cuenta_id requerido' }, { status: 400 })

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

    const { messages, total } = await fetchMessageHeaders(client, folder, {
      page,
      limit,
      searchQuery,
    })

    await client.logout()

    const mappedMessages = messages.map(msg => ({
      uid: msg.uid,
      subject: msg.envelope?.subject || '(Sin asunto)',
      from: msg.envelope?.from?.[0]?.address || '',
      fromName: msg.envelope?.from?.[0]?.name || msg.envelope?.from?.[0]?.address || '',
      to: (msg.envelope?.to || []).map((t: any) => t.address).join(', '),
      date: msg.envelope?.date?.toISOString() || '',
      flags: Array.from(msg.flags || []),
      hasAttachments: msg.hasAttachments,
      size: msg.size,
      isRead: (msg.flags || new Set()).has('\\Seen'),
      isFlagged: (msg.flags || new Set()).has('\\Flagged'),
      isAnswered: (msg.flags || new Set()).has('\\Answered'),
    }))

    return NextResponse.json({
      messages: mappedMessages,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    })
  } catch (error: any) {
    console.error('[messages] Error:', error)
    return NextResponse.json({ error: error.message || 'Error al cargar mensajes' }, { status: 500 })
  }
}

