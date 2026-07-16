import { supabase } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/api-auth'
import { decrypt } from '@/app/superadmin/correo/_lib/crypto'
import {
  connectImap,
  markAsRead,
  markAsUnread,
  toggleFlagged,
  moveMessage,
  deleteMessage,
} from '@/app/superadmin/correo/_lib/imapClient'

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  try {
    const body = await request.json()
    const { cuenta_id, folder, action, uids } = body

    if (!cuenta_id || !action || !uids || !Array.isArray(uids) || uids.length === 0) {
      return NextResponse.json({ error: 'cuenta_id, action y uids (array) requeridos' }, { status: 400 })
    }

    const { data: cuenta } = await supabase
      .from('email_cuentas')
      .select('*, servidor:email_servidores(*)')
      .eq('id', cuenta_id)
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

    const sourceFolder = folder || 'INBOX'

    for (const uid of uids) {
      switch (action) {
        case 'markRead':
          await markAsRead(client, sourceFolder, uid)
          break
        case 'markUnread':
          await markAsUnread(client, sourceFolder, uid)
          break
        case 'flag':
          await toggleFlagged(client, sourceFolder, uid, true)
          break
        case 'unflag':
          await toggleFlagged(client, sourceFolder, uid, false)
          break
        case 'moveToSpam': {
          let spamFolder = 'INBOX.Spam'
          const spamList = await client.list()
          for (const f of spamList) {
            if (f.name.toUpperCase() === 'SPAM' || f.name.toUpperCase() === 'JUNK') {
              spamFolder = f.path
              break
            }
          }
          await moveMessage(client, sourceFolder, uid, spamFolder)
          break
        }
        case 'moveToTrash': {
          let trashFolder = 'INBOX.Trash'
          const trashList = await client.list()
          for (const f of trashList) {
            if (f.name.toUpperCase() === 'TRASH' || f.name.toUpperCase() === 'PAPELERA') {
              trashFolder = f.path
              break
            }
          }
          await moveMessage(client, sourceFolder, uid, trashFolder)
          break
        }
        case 'moveToArchive': {
          let archiveFolder = 'INBOX.Archive'
          const archList = await client.list()
          for (const f of archList) {
            if (f.name.toUpperCase() === 'ARCHIVE' || f.name.toUpperCase() === 'ARCHIVO') {
              archiveFolder = f.path
              break
            }
          }
          await moveMessage(client, sourceFolder, uid, archiveFolder)
          break
        }
        case 'delete':
          await deleteMessage(client, sourceFolder, uid)
          break
        default:
          await client.logout()
          return NextResponse.json({ error: `Acción no soportada: ${action}` }, { status: 400 })
      }
    }

    await client.logout()

    return NextResponse.json({
      success: true,
      action,
      count: uids.length,
    })
  } catch (error: any) {
    console.error('[actions] Error:', error)
    return NextResponse.json({ error: error.message || 'Error al ejecutar acciones' }, { status: 500 })
  }
}

