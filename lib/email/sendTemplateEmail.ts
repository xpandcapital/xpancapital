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
  products?: Array<{ nombre: string; precio: string; imagen?: string; categoria?: string; cantidad?: number }>
}

export async function sendTemplateEmail(params: TemplateEmailParams): Promise<boolean> {
  const { evento, empresa_id = DEFAULT_EMPRESA_ID, to, subject, variables, products } = params

  // Fallback entre variantes invitado/logueado si una no existe
  function getFallbackEvent(originalEvent: string): string | null {
    const map: Record<string, string> = {
      'transaccion_compra_completada_invitado': 'transaccion_compra_completada_logueado',
      'transaccion_compra_completada_logueado': 'transaccion_compra_completada_invitado',
      'transaccion_compra_pendiente_invitado': 'transaccion_compra_pendiente_logueado',
      'transaccion_compra_pendiente_logueado': 'transaccion_compra_pendiente_invitado',
    }
    return map[originalEvent] || null
  }

  try {
    const supabase = createClient()

    // 1. Buscar template por evento
    let { data: template } = await supabase
      .from('email_templates')
      .select('settings, blocks, nombre')
      .eq('empresa_id', empresa_id)
      .eq('evento', evento)
      .maybeSingle()

    // 1b. Fallback a variante alternativa si no existe la específica
    if (!template?.settings || !template?.blocks) {
      const fallbackEvent = getFallbackEvent(evento)
      if (fallbackEvent) {
        console.log(`[sendTemplateEmail] Plantilla "${evento}" no encontrada, intentando fallback: "${fallbackEvent}"`)
        const { data: fallbackTemplate } = await supabase
          .from('email_templates')
          .select('settings, blocks, nombre')
          .eq('empresa_id', empresa_id)
          .eq('evento', fallbackEvent)
          .maybeSingle()
        if (fallbackTemplate?.settings && fallbackTemplate?.blocks) {
          template = fallbackTemplate
        }
      }
    }

    let html = ''

    if (template?.settings && template?.blocks) {
      // 2. Generar HTML desde la plantilla
      try {
        let blocks = typeof template.blocks === 'string' ? JSON.parse(template.blocks) : template.blocks
        const settings = typeof template.settings === 'string' ? JSON.parse(template.settings) : template.settings

        console.log('[sendTemplateEmail] Plantilla encontrada:', template.nombre, '| blocks length:', blocks?.length, '| settings keys:', Object.keys(settings || {}))

        // Inyectar productos en bloques receipt
        if (products && products.length > 0) {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xpandcapital.org'
          const placeholderImage = `https://placehold.co/100x100/181818/ffffff?text=Producto`
          const normalizeImage = (url?: string) => {
            if (!url) return placeholderImage
            if (url.startsWith('http')) return url
            if (url.startsWith('//')) return `https:${url}`
            return `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`
          }

          console.log('[sendTemplateEmail] Inyectando productos:', products.map(p => ({ nombre: p.nombre, precio: p.precio, imagen: p.imagen?.substring(0, 60) })))
          blocks = blocks.map((block: any) => {
            if (block.type === 'receipt' && block.content) {
              return {
                ...block,
                content: {
                  ...block.content,
                  items: products.map(p => ({
                    nombre: p.nombre || 'Producto',
                    precio: (p.precio || '0').toString().replace(/^\$/, '').trim(),
                    imagen: normalizeImage(p.imagen),
                    categoria: p.categoria || '',
                  })),
                },
              }
            }
            return block
          })
        }

        const generateHTML = await getGenerateHTML()
        html = generateHTML(blocks,
          typeof template.settings === 'string' ? JSON.parse(template.settings) : template.settings
        )

        // 3. Reemplazar variables {{nombre}}, {{ productos }}, etc. (con o sin espacios)
        console.log('[sendTemplateEmail] Variables disponibles:', Object.keys(variables), '| password_temporal presente:', !!variables.password_temporal, '| valor length:', variables.password_temporal?.length || 0)
        for (const [key, value] of Object.entries(variables)) {
          html = html.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), value)
        }
        // Limpiar variables no reemplazadas
        html = html.replace(/\{\{[^}]+\}\}/g, '')
        console.log('[sendTemplateEmail] HTML contiene password_temporal placeholder:', html.includes('password_temporal'))
      } catch (e) {
        console.error('[sendTemplateEmail] Error generando HTML:', e)
        html = buildFallbackHTML(variables)
      }
    } else {
      console.log(`[sendTemplateEmail] No hay template para evento "${evento}". template:`, !!template, 'settings:', !!template?.settings, 'blocks:', !!template?.blocks, 'empresa:', empresa_id)
      html = buildFallbackHTML(variables)
    }

    // 4. Buscar sender configurado
    const { data: sender } = await supabase
      .from('email_senders')
      .select('*')
      .eq('empresa_id', empresa_id)
      .eq('is_default', true)
      .maybeSingle()

    let fromName = 'Xpand Capital'
    let fromEmail = process.env.SMTP_USER || ''

    // 5. Enviar
    if (sender?.provider === 'smtp' || !sender) {
      const port = parseInt(sender?.smtp_port || process.env.SMTP_PORT || '465')
      const transporter = nodemailer.createTransport({
        host: sender?.smtp_host || process.env.SMTP_HOST || '',
        port,
        secure: port === 465,
        connectionTimeout: 5000,
        socketTimeout: 5000,
        auth: {
          user: sender?.smtp_user || process.env.SMTP_USER || '',
          pass: sender?.smtp_pass || process.env.SMTP_PASS || '',
        },
      })

      if (sender?.from_name) fromName = sender.from_name
      if (sender?.from_email) fromEmail = sender.from_email

      let finalSubject = subject || template?.settings?.subject || 'Confirmación de compra — Xpand Capital'
      for (const [key, value] of Object.entries(variables)) {
        finalSubject = finalSubject.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), value)
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
          subject: subject || 'Confirmación de compra — Xpand Capital',
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
      <span style="background:#c9b500;padding:12px 24px;border-radius:12px;font-size:20px;font-weight:900;letter-spacing:2px;">Xpand Capital</span>
    </div>
    <h1 style="font-size:24px;font-weight:900;text-transform:uppercase;text-align:center;">¡Pago Confirmado!</h1>
    <p style="text-align:center;color:#9ca3af;">Gracias <strong style="color:#fff">${nombre}</strong>, hemos recibido tu pago de <strong style="color:#4ade80">${total}</strong>.</p>
    <div style="background:#111;border:1px solid #222;border-radius:16px;padding:24px;margin:24px 0;">${productos}</div>
    <div style="text-align:center;">
      <a href="${enlace}" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;font-weight:900;font-size:14px;text-transform:uppercase;letter-spacing:2px;padding:16px 40px;border-radius:12px;">Acceder a Mis Productos →</a>
    </div>
    <p style="text-align:center;color:#4b5563;font-size:11px;margin-top:24px;">Xpand Capital · Gracias por tu compra</p>
  </div>`
}


