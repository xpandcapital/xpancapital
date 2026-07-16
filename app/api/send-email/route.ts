import { supabase } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const EMPRESA_ID = DEFAULT_EMPRESA_ID

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      senderId, 
      to, 
      subject, 
      html, 
      preview, 
      attachments 
    } = body

    if (!senderId || !to || !subject || !html) {
      return NextResponse.json({ 
        error: 'Faltan campos requeridos: senderId, to, subject, html' 
      }, { status: 400 })
    }

    // Obtener configuración del remitente
    const { data: sender, error: senderError } = await supabase
      .from('email_senders')
      .select('*')
      .eq('id', senderId)
      .eq('empresa_id', EMPRESA_ID)
      .single()

    if (senderError || !sender) {
      return NextResponse.json({ 
        error: 'Remitente no encontrado' 
      }, { status: 404 })
    }

    // Parsear destinatarios
    const recipients = Array.isArray(to) ? to : to.split(',').map((e: string) => e.trim()).filter(Boolean)
    
    if (recipients.length === 0) {
      return NextResponse.json({ 
        error: 'No hay destinatarios válidos' 
      }, { status: 400 })
    }

    let result

    if (sender.provider === 'smtp') {
      // Enviar via SMTP
      const transporter = nodemailer.createTransport({
        host: sender.smtp_host,
        port: sender.smtp_port || 465,
        secure: sender.smtp_port === 465,
        auth: {
          user: sender.smtp_user,
          pass: sender.smtp_pass
        }
      })

      // Preparar adjuntos
      const mailAttachments = attachments?.map((att: { filename: string; content: string; contentType: string }) => ({
        filename: att.filename,
        content: Buffer.from(att.content, 'base64'),
        contentType: att.contentType
      })) || []

      const mailOptions = {
        from: `"${sender.from_name}" <${sender.from_email}>`,
        to: recipients.join(','),
        subject: subject,
        html: html,
        text: preview || subject,
        attachments: mailAttachments
      }

      result = await transporter.sendMail(mailOptions)

    } else if (sender.provider === 'resend') {
      // Enviar via Resend API
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sender.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${sender.from_name} <${sender.from_email}>`,
          to: recipients,
          subject: subject,
          html: html,
          text: preview || subject
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error con Resend API')
      }

      result = await response.json()

    } else if (sender.provider === 'sendgrid') {
      // Enviar via SendGrid API
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sender.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: recipients.map((email: string) => ({ email })),
            subject: subject
          }],
          from: {
            email: sender.from_email,
            name: sender.from_name
          },
          content: [{
            type: 'text/html',
            value: html
          }],
          ...(preview && {
            custom_args: {
              preview_text: preview
            }
          })
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.errors?.[0]?.message || 'Error con SendGrid API')
      }

      result = { success: true }

    } else {
      return NextResponse.json({ 
        error: 'Proveedor no soportado' 
      }, { status: 400 })
    }

    // Guardar campaña en la base de datos
    await supabase
      .from('email_campaigns')
      .insert([{
        empresa_id: EMPRESA_ID,
        sender_id: senderId,
        subject: subject,
        preview_text: preview,
        status: 'sent',
        recipients: recipients,
        enviado_en: new Date().toISOString()
      }])

    return NextResponse.json({ 
      success: true, 
      message: `Correo enviado a ${recipients.length} destinatario(s)`,
      recipients: recipients.length,
      result 
    })

  } catch (error: unknown) {
    console.error('Error sending email:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    return NextResponse.json({ 
      error: errorMessage 
    }, { status: 500 })
  }
}
