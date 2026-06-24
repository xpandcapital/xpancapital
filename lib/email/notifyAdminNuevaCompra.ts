import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'
import { createClient } from '@/lib/supabase/server'
import { sendTemplateEmail } from '@/lib/email/sendTemplateEmail'

interface NotifyAdminParams {
  compraId: string
  empresaId?: string
  compradorNombre: string
  compradorEmail: string
  compradorTelefono?: string
  productos: Array<{
    nombre: string
    precio_unitario?: number
    productType?: string
    imagen?: string
    cantidad?: number
  }>
  montoUSD: number
  metodoPago: string
  moneda?: string
  siteUrl?: string
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildFallbackHTML(
  adminName: string,
  compradorNombre: string,
  compradorEmail: string,
  compradorTelefono: string,
  productos: NotifyAdminParams['productos'],
  total: string,
  metodoPago: string,
  moneda: string,
  fechaCompra: string,
  comprobanteId: string,
  enlaceAprobar: string,
  enlaceRechazar: string,
): string {
  const productosHTML = productos
    .map(p => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #1f1f1f;font-size:14px;color:#e5e7eb;">
          ${escapeHtml(p.nombre)}
          ${p.cantidad && p.cantidad > 1 ? `<span style="color:#6b7280;font-size:12px;"> x${p.cantidad}</span>` : ''}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #1f1f1f;text-align:right;font-size:14px;color:#e5e7eb;">
          $${(p.precio_unitario || 0).toFixed(2)}
        </td>
      </tr>`)
    .join('')

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#050505;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#ffffff;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:#be0b24;padding:10px 20px;border-radius:10px;">
        <span style="font-size:18px;font-weight:900;letter-spacing:3px;text-transform:uppercase;">BLIS Corp</span>
      </div>
    </div>
    <div style="background:#1a0a0e;border:1px solid #be0b2433;border-radius:14px;padding:20px 24px;margin-bottom:24px;text-align:center;">
      <span style="font-size:28px;">&#x1F514;</span>
      <h1 style="font-size:20px;font-weight:900;text-transform:uppercase;letter-spacing:-1px;margin:8px 0 4px;color:#fff;">Nueva Compra Pendiente</h1>
      <p style="margin:0;color:#9ca3af;font-size:13px;">Requiere tu aprobaci&oacute;n para activarse</p>
    </div>
    <div style="background:#0a0a0a;border:1px solid #1f1f1f;border-radius:14px;padding:20px 24px;margin-bottom:16px;">
      <h3 style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#6b7280;margin:0 0 14px;">Datos del Comprador</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#6b7280;font-size:12px;width:80px;">Nombre</td><td style="padding:6px 0;color:#fff;font-size:13px;font-weight:600;">${escapeHtml(compradorNombre)}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:12px;">Email</td><td style="padding:6px 0;color:#fff;font-size:13px;">${escapeHtml(compradorEmail)}</td></tr>
        ${compradorTelefono ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:12px;">Tel&eacute;fono</td><td style="padding:6px 0;color:#fff;font-size:13px;">${escapeHtml(compradorTelefono)}</td></tr>` : ''}
      </table>
    </div>
    <div style="background:#0a0a0a;border:1px solid #1f1f1f;border-radius:14px;padding:20px 24px;margin-bottom:16px;">
      <h3 style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#6b7280;margin:0 0 14px;">Productos</h3>
      <table style="width:100%;border-collapse:collapse;">${productosHTML}</table>
    </div>
    <div style="background:#0a0a0a;border:1px solid #1f1f1f;border-radius:14px;padding:20px 24px;margin-bottom:28px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="color:#6b7280;font-size:13px;">Total</span>
        <span style="color:#fff;font-size:20px;font-weight:900;">$${total} <span style="font-size:11px;color:#6b7280;font-weight:400;">${moneda}</span></span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="color:#6b7280;font-size:13px;">M&eacute;todo</span>
        <span style="color:#fff;font-size:13px;font-weight:600;">${escapeHtml(metodoPago)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="color:#6b7280;font-size:13px;">Fecha</span>
        <span style="color:#fff;font-size:13px;">${escapeHtml(fechaCompra)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="color:#6b7280;font-size:13px;">Orden</span>
        <code style="color:#9ca3af;font-size:12px;background:#111;padding:2px 8px;border-radius:6px;">#${escapeHtml(comprobanteId)}</code>
      </div>
    </div>
    <div style="margin-bottom:32px;">
      <a href="${enlaceAprobar}" style="display:block;background:#16a34a;color:#fff;text-decoration:none;font-weight:900;font-size:14px;text-transform:uppercase;letter-spacing:2px;padding:16px 24px;border-radius:12px;text-align:center;margin-bottom:12px;">&#x2705; Aprobar Compra</a>
      <a href="${enlaceRechazar}" style="display:block;background:#dc2626;color:#fff;text-decoration:none;font-weight:900;font-size:14px;text-transform:uppercase;letter-spacing:2px;padding:16px 24px;border-radius:12px;text-align:center;">&#x274C; Rechazar Compra</a>
    </div>
    <p style="text-align:center;color:#4b5563;font-size:11px;line-height:1.6;">Este enlace expira en 7 d&iacute;as.<br>No compartas este correo. Solo usuarios autorizados pueden aprobar compras.</p>
  </div>
</body>
</html>`
}

async function sendFallbackEmail(
  supabase: ReturnType<typeof createClient>,
  empresaId: string,
  to: string,
  adminName: string,
  subject: string,
  html: string,
) {
  const { data: sender } = await supabase
    .from('email_senders')
    .select('*')
    .eq('empresa_id', empresaId)
    .eq('is_default', true)
    .maybeSingle()

  let host = ''
  let port = 465
  let user = ''
  let pass = ''
  let fromName = 'BLIS Corp'
  let fromEmail = ''

  if (sender?.provider === 'smtp' || !sender) {
    host = sender?.smtp_host || process.env.SMTP_HOST || ''
    port = parseInt(sender?.smtp_port || process.env.SMTP_PORT || '465')
    user = sender?.smtp_user || process.env.SMTP_USER || ''
    pass = sender?.smtp_pass || process.env.SMTP_PASS || ''
    if (sender?.from_name) fromName = sender.from_name
    if (sender?.from_email) fromEmail = sender.from_email
  }

  if (!host || !user || !pass) {
    console.error('[notifyAdminNuevaCompra] Fallback sin configuración SMTP disponible')
    return false
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail || user}>`,
    to,
    subject,
    html,
  })

  console.log(`[notifyAdminNuevaCompra] Email de respaldo enviado a ${to}`)
  return true
}

export async function notifyAdminNuevaCompra(params: NotifyAdminParams): Promise<void> {
  const supabase = createClient()
  const siteUrl = params.siteUrl || 'https://www.blis-corp.com'
  const empresaId = params.empresaId || DEFAULT_EMPRESA_ID

  try {
    // 1. Generar token criptográfico
    const token = crypto.randomBytes(32).toString('hex')
    const enlaceAprobar = `${siteUrl}/api/compras/aprobar/${token}`
    const enlaceRechazar = `${siteUrl}/api/compras/rechazar/${token}`

    // 2. Guardar token en BD
    const { error: tokenError } = await supabase
      .from('compra_approval_tokens')
      .insert({
        compra_id: params.compraId,
        token,
        accion: 'pendiente',
        expira_en: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })

    if (tokenError) {
      console.error('[notifyAdminNuevaCompra] Error guardando token:', tokenError)
      return
    }

    // 3. Buscar usuarios que deben recibir la notificación
    const { data: destinatarios, error: destError } = await supabase
      .from('profiles')
      .select('id, email, nombre')
      .eq('empresa_id', empresaId)
      .eq('recibir_notificaciones_compras', true)

    if (destError) {
      console.error('[notifyAdminNuevaCompra] Error buscando destinatarios:', destError)
      return
    }

    if (!destinatarios || destinatarios.length === 0) {
      console.log('[notifyAdminNuevaCompra] No hay destinatarios configurados para la empresa', empresaId)
      return
    }

    console.log(`[notifyAdminNuevaCompra] Enviando notificación a ${destinatarios.length} admin(s)`)

    // 4. Construir datos comunes
    const nombreParts = (params.compradorNombre || '').trim().split(/\s+/)
    const nombreComprador = nombreParts[0] || params.compradorEmail.split('@')[0]
    const apellidoComprador = nombreParts.slice(1).join(' ') || ''
    const totalLimpio = params.montoUSD.toFixed(2)
    const moneda = params.moneda || 'USD'
    const fechaCompra = new Date().toLocaleDateString('es-PE', { timeZone: 'America/Lima', day: 'numeric', month: 'long', year: 'numeric' })
    const comprobanteId = params.compraId.substring(0, 8)

    // Variables para la plantilla (sendTemplateEmail)
    const productosHTML = params.productos
      .map(p => `<li style="margin-bottom:6px;font-size:14px;color:#e5e7eb;">${p.nombre} — $${(p.precio_unitario || 0).toFixed(2)}</li>`)
      .join('')

    const emailVars: Record<string, string> = {
      nombre_comprador: nombreComprador,
      apellido_comprador: apellidoComprador,
      email_comprador: params.compradorEmail,
      total_compra: totalLimpio,
      metodo_pago_compra: params.metodoPago,
      moneda,
      fecha_compra: fechaCompra,
      comprobante_id: comprobanteId,
      enlace_aprobar_compra: enlaceAprobar,
      enlace_rechazar_compra: enlaceRechazar,
      productos: `<ul style="margin:0;padding:0;list-style:none;">${productosHTML}</ul>`,
      subtotal: totalLimpio,
      total: totalLimpio,
      whatsapp_soporte: '',
      descuento_monto: '',
      cupon: '',
    }

    // Variables de productos individuales (hasta 3)
    for (let i = 0; i < 3; i++) {
      const p = params.productos[i]
      if (p) {
        emailVars[`producto_${i + 1}_nombre`] = p.nombre || ''
        emailVars[`producto_${i + 1}_categoria`] = p.productType || ''
        emailVars[`producto_${i + 1}_precio`] = (p.precio_unitario || 0).toFixed(2)
        emailVars[`producto_${i + 1}_imagen`] = p.imagen || ''
      } else {
        emailVars[`producto_${i + 1}_nombre`] = ''
        emailVars[`producto_${i + 1}_categoria`] = ''
        emailVars[`producto_${i + 1}_precio`] = ''
        emailVars[`producto_${i + 1}_imagen`] = ''
      }
    }

    // Array de productos para inyección en bloques receipt
    const productsForReceipt = params.productos.map(p => ({
      nombre: p.nombre || 'Producto',
      precio: (p.precio_unitario || 0).toFixed(2),
      categoria: p.productType || '',
      cantidad: p.cantidad || 1,
      imagen: p.imagen || '',
    }))

    const fallbackHTML = buildFallbackHTML(
      '', nombreComprador, params.compradorEmail, params.compradorTelefono || '',
      params.productos, totalLimpio, params.metodoPago, moneda,
      fechaCompra, comprobanteId, enlaceAprobar, enlaceRechazar,
    )

    const subject = `Compra pendiente: ${nombreComprador} — ${moneda} ${totalLimpio}`

    // 5. Enviar email a cada destinatario (primero intenta plantilla, luego fallback)
    for (const dest of destinatarios) {
      if (!dest.email) continue

      const templateSent = await sendTemplateEmail({
        evento: 'admin_nueva_compra_revisar',
        empresa_id: empresaId,
        to: dest.email,
        subject,
        variables: {
          ...emailVars,
          nombre: dest.nombre || '',
        },
        products: productsForReceipt,
      }).catch(err => {
        console.error(`[notifyAdminNuevaCompra] Error en sendTemplateEmail para ${dest.email}:`, err)
        return false
      })

      if (!templateSent) {
        console.log(`[notifyAdminNuevaCompra] Plantilla falló para ${dest.email}, usando HTML de respaldo...`)
        await sendFallbackEmail(
          supabase, empresaId, dest.email, dest.nombre || '',
          subject, fallbackHTML,
        ).catch(err => {
          console.error(`[notifyAdminNuevaCompra] Error en fallback para ${dest.email}:`, err)
        })
      } else {
        console.log(`[notifyAdminNuevaCompra] Plantilla enviada a ${dest.email}`)
      }
    }

    console.log(`[notifyAdminNuevaCompra] Notificaciones completadas. Token: ${token.substring(0, 8)}...`)

  } catch (err) {
    console.error('[notifyAdminNuevaCompra] Error:', err)
  }
}
