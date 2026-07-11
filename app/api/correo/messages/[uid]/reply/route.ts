export const dynamic = 'force-dynamic'

// @ts-nocheck
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getAuthUser } from '@/lib/supabase/api-auth'
import { decrypt } from '@/app/superadmin/correo/_lib/crypto'
import { connectImap, appendToSent } from '@/app/superadmin/correo/_lib/imapClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateMessageId(from: string): string {
  const domain = from.split('@')[1] || 'blis-corp.com'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 11)
  return `<${timestamp}.${random}@${domain}>`
}

function buildRawEmail(from: string, to: string, subject: string, html: string, inReplyTo: string, references: string, messageId: string): string {
  const date = new Date().toUTCString()
  let raw = ''
  raw += `From: ${from}\r\n`
  raw += `To: ${to}\r\n`
  raw += `Subject: ${subject}\r\n`
  raw += `Date: ${date}\r\n`
  raw += `Message-ID: ${messageId}\r\n`
  if (inReplyTo) raw += `In-Reply-To: ${inReplyTo}\r\n`
  if (references) raw += `References: ${references}\r\n`
  raw += `MIME-Version: 1.0\r\n`
  raw += `Content-Type: text/html; charset=UTF-8\r\n`
  raw += `Content-Transfer-Encoding: 8bit\r\n`
  raw += `\r\n`
  raw += html
  return raw
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ uid: string }> }
) {
  const auth = await getAuthUser(request)
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const params = await context.params

  try {
    const body = await request.json()
    const {
      cuenta_id,
      folder,
      template_id,
      respuesta_texto,
      to_email,
      to_name,
      subject,
      reply_all,
      attachments = [],
    } = body

    if (!cuenta_id) return NextResponse.json({ error: 'cuenta_id requerido' }, { status: 400 })

    const { data: cuenta } = await supabase
      .from('email_cuentas')
      .select('*, servidor:email_servidores(*)')
      .eq('id', cuenta_id)
      .eq('user_id', auth.userId)
      .single()

    if (!cuenta) return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })

    const servidor = (cuenta as any).servidor
    if (!servidor) return NextResponse.json({ error: 'Servidor no configurado' }, { status: 404 })

    const fromAddress = cuenta.email
    const fromName = cuenta.nombre_mostrado || fromAddress.split('@')[0]

    let htmlBody = respuesta_texto || ''
    let plainText = ''

    if (template_id && template_id !== 'none') {
      const { data: template } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', template_id)
        .eq('empresa_id', auth.empresaId)
        .single()

      if (template) {
        const { generateHTML } = await import('@/app/superadmin/mails/lib/htmlGenerator')
        let blocks = template.blocks
        if (typeof blocks === 'string') blocks = JSON.parse(blocks)

        const settings = typeof template.settings === 'string'
          ? JSON.parse(template.settings)
          : template.settings || {}

        htmlBody = generateHTML(blocks, settings)
        htmlBody = htmlBody.replace(/\{\{respuesta-de-correo\}\}/g, respuesta_texto || '')
        plainText = template.settings?.subject || ''
      }
    }

    const transporter = nodemailer.createTransport({
      host: servidor.smtp_host,
      port: servidor.smtp_port,
      secure: servidor.smtp_port === 465 || servidor.smtp_secure,
      auth: {
        user: fromAddress,
        pass: decrypt(cuenta.password_enc),
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    const messageId = generateMessageId(fromAddress)

    let inReplyTo = ''
    let references = ''

    if (folder && params.uid) {
      try {
        const client = await connectImap({
          host: servidor.imap_host,
          port: servidor.imap_port,
          secure: servidor.imap_secure,
          user: cuenta.email,
          pass: decrypt(cuenta.password_enc),
        })

        const msg = await client.fetchOne(`${params.uid}`, { envelope: true }, { uid: true })
        if (msg?.envelope?.messageId) {
          inReplyTo = msg.envelope.messageId
          references = msg.envelope.messageId
          if (msg.envelope.inReplyTo) {
            references = msg.envelope.inReplyTo + ' ' + msg.envelope.messageId
          }
        }
        await client.logout()
      } catch {
        // Si no se puede obtener el mensaje original, continuar sin threading
      }
    }

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${fromName}" <${fromAddress}>`,
      to: to_email || '',
      subject: subject || '(Sin asunto)',
      html: htmlBody,
      attachments: (attachments || []).map((a: any) => ({
        filename: a.filename,
        content: Buffer.from(a.content || '', 'base64'),
        contentType: a.contentType || 'application/octet-stream',
      })),
      headers: {
        'Message-ID': messageId,
        ...(inReplyTo && { 'In-Reply-To': inReplyTo }),
        ...(references && { 'References': references }),
      },
    }

    await transporter.sendMail(mailOptions)

    try {
      const rawMail = buildRawEmail(
        `"${fromName}" <${fromAddress}>`,
        to_email || '',
        subject || '(Sin asunto)',
        htmlBody,
        inReplyTo,
        references,
        messageId
      )

      const clientAppend = await connectImap({
        host: servidor.imap_host,
        port: servidor.imap_port,
        secure: servidor.imap_secure,
        user: cuenta.email,
        pass: decrypt(cuenta.password_enc),
      })

      let sentFolder = 'INBOX.Sent'
      const sentList = await clientAppend.list()
      for (const f of sentList) {
        const name = f.name.toUpperCase()
        if (name === 'SENT' || name === 'ENVIADOS' || name === 'INBOX.SENT') {
          sentFolder = f.path
          break
        }
      }

      await appendToSent(clientAppend, sentFolder, rawMail)
      await clientAppend.logout()
    } catch {
      // Fallback silencioso si no se puede guardar en Sent
    }

    return NextResponse.json({ success: true, messageId })
  } catch (error: any) {
    console.error('[reply] Error:', error)
    return NextResponse.json({ error: error.message || 'Error al enviar respuesta' }, { status: 500 })
  }
}

