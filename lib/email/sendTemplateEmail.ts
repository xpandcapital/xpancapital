import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'
import { createClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'

// Import dinámico para evitar error en client components
let generateHTMLFn: any = null
async function getGenerateHTML() {
  if (!generateHTMLFn) {
    const mod = await import('../../app/superadmin/mails/lib/htmlGenerator.js')
    generateHTMLFn = mod.generateHTML
  }
  return generateHTMLFn
}

interface TemplateEmailParams {
  evento: string
  empresa_id?: string
  to: string
  subject?: string
  variables: Record<string, string>
}

export async function sendTemplateEmail(params: TemplateEmailParams): Promise<boolean> {
  const { evento, empresa_id = DEFAULT_EMPRESA_ID, to, subject, variables } = params

  try {
    const supabase = createClient()

    // 1. Buscar template por evento
    const { data: template } = await supabase
      .from('email_templates')
      .select('settings, blocks, nombre')
      .eq('empresa_id', empresa_id)
      .eq('evento', evento)
      .maybeSingle()

    let html = ''

    if (template?.settings && template?.blocks) {
      // 2. Generar HTML desde la plantilla
      try {
        const generateHTML = await getGenerateHTML()
        html = generateHTML(
          typeof template.blocks === 'string' ? JSON.parse(template.blocks) : template.blocks,
          typeof template.settings === 'string' ? JSON.parse(template.settings) : template.settings
        )

        // 3. Reemplazar variables {{nombre}}, {{productos}}, etc.
        for (const [key, value] of Object.entries(variables)) {
          html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
        }
        // Limpiar variables no reemplazadas
        html = html.replace(/\{\{[^}]+\}\}/g, '')
      } catch (e) {
        console.error('[sendTemplateEmail] Error generando HTML:', e)
        html = buildFallbackHTML(variables)
      }
    } else {
      console.log(`[sendTemplateEmail] No hay template para evento "${evento}", usando fallback`)
      html = buildFallbackHTML(variables)
    }

    // 4. Buscar sender configurado
    const { data: sender } = await supabase
      .from('email_senders')
      .select('*')
      .eq('empresa_id', empresa_id)
      .eq('is_default', true)
      .maybeSingle()

    let fromName = 'BLIS Corp'
    let fromEmail = process.env.SMTP_USER || ''

    // 5. Enviar
    if (sender?.provider === 'smtp' || !sender) {
      const port = parseInt(sender?.smtp_port || process.env.SMTP_PORT || '465')
      const transporter = nodemailer.createTransport({
        host: sender?.smtp_host || process.env.SMTP_HOST || '',
        port,
        secure: port === 465,
        auth: {
          user: sender?.smtp_user || process.env.SMTP_USER || '',
          pass: sender?.smtp_pass || process.env.SMTP_PASS || '',
        },
      })

      if (sender?.from_name) fromName = sender.from_name
      if (sender?.from_email) fromEmail = sender.from_email

      let finalSubject = subject || template?.settings?.subject || 'Confirmación de compra — BLIS Corp'
      for (const [key, value] of Object.entries(variables)) {
        finalSubject = finalSubject.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
      }
      finalSubject = finalSubject.replace(/\{\{[^}]+\}\}/g, '')

      try {
        await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to,
          subject: finalSubject,
          html,
        })
        console.log(`[sendTemplateEmail] Enviado a ${to} (evento: ${evento})`)
        return true
      } catch (mailErr: any) {
        console.error('[sendTemplateEmail] Error SMTP:', mailErr.message)
        return false
      }
    }

    // Resend o SendGrid — usar fetch
    if (sender?.provider === 'resend' && sender.api_key) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sender.api_key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to,
          subject: subject || 'Confirmación de compra — BLIS Corp',
          html,
        }),
      })
      return true
    }

    console.log('[sendTemplateEmail] No se pudo enviar - sin configuración de correo')
    return false
  } catch (e) {
    console.error('[sendTemplateEmail] Error:', e)
    return false
  }
}

function buildFallbackHTML(vars: Record<string, string>): string {
  const nombre = vars.nombre || 'Cliente'
  const productos = vars.productos || ''
  const total = vars.total || '0'
  const enlace = vars.enlace_acceso || '#'

  return `
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#050505;color:#fff;font-family:Arial,sans-serif;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="background:#be0b24;padding:12px 24px;border-radius:12px;font-size:20px;font-weight:900;letter-spacing:2px;">BLIS Corp</span>
    </div>
    <h1 style="font-size:24px;font-weight:900;text-transform:uppercase;text-align:center;">¡Pago Confirmado!</h1>
    <p style="text-align:center;color:#9ca3af;">Gracias <strong style="color:#fff">${nombre}</strong>, hemos recibido tu pago de <strong style="color:#4ade80">${total}</strong>.</p>
    <div style="background:#111;border:1px solid #222;border-radius:16px;padding:24px;margin:24px 0;">${productos}</div>
    <div style="text-align:center;">
      <a href="${enlace}" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;font-weight:900;font-size:14px;text-transform:uppercase;letter-spacing:2px;padding:16px 40px;border-radius:12px;">Acceder a Mis Productos →</a>
    </div>
    <p style="text-align:center;color:#4b5563;font-size:11px;margin-top:24px;">BLIS Corp · Gracias por tu compra</p>
  </div>`
}
