import { createClient } from '@supabase/supabase-js'
import { sendWhatsApp } from '@/lib/whatsapp'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://xpandcapital.org'

function getAdmin() { return createClient(supabaseUrl, supabaseServiceKey) }

interface NotifyOptions {
  userId?: string
  titulo: string
  mensaje: string
  link?: string
  canales?: ('inapp' | 'whatsapp' | 'email')[]
}

/**
 * Notifica a un usuario por los canales especificados.
 * Siempre crea notificación in-app. Opcionalmente envía WhatsApp.
 */
export async function notifyUser({ userId, titulo, mensaje, link, canales = ['inapp'] }: NotifyOptions) {
  if (!userId || canales.length === 0) return

  const supabase = getAdmin()
  const channels = new Set(canales)

  // 1. Siempre: notificación in-app
  if (channels.has('inapp')) {
    await supabase.from('notificaciones').insert({
      user_id: userId,
      tipo: 'sistema',
      titulo: titulo.trim(),
      mensaje: mensaje.trim(),
      link: link || null,
    }).select().maybeSingle()
  }

  // 2. WhatsApp si está habilitado
  if (channels.has('whatsapp')) {
    const { data: profile } = await supabase
      .from('profiles').select('whatsapp, telefono').eq('id', userId).maybeSingle()
    const phone = profile?.whatsapp || profile?.telefono
    if (phone) {
      const { cleanPhone, isValidPhone } = await import('@/lib/phone')
      const cleaned = cleanPhone(phone) || phone
      if (isValidPhone(cleaned)) {
        sendWhatsApp({ number: cleaned, message: `${titulo}\n\n${mensaje}${link ? `\n\n👉 ${appUrl}${link}` : ''}` }).catch(() => {})
      }
    }
  }
}

/**
 * Notifica a un asesor por WhatsApp cuando hay nuevo lead o cambio
 */
export async function notifyAsesor(asesorId: string, titulo: string, mensaje: string, link?: string) {
  const supabase = getAdmin()
  const { data: asesor } = await supabase
    .from('asesores').select('whatsapp, email').eq('id', asesorId).maybeSingle()
  if (!asesor?.whatsapp) return

  const full = `${titulo}\n\n${mensaje}${link ? `\n\n👉 ${appUrl}${link}` : ''}`
  sendWhatsApp({ number: asesor.whatsapp, message: full }).catch(() => {})
}

// ── Templates predefinidos ──

export const NTemplates = {
  nuevo_lead: (lead: { nombre: string; email?: string; telefono?: string; presupuesto?: string }) => ({
    titulo: '🔔 Nuevo Lead',
    mensaje: [
      `¡Tienes un nuevo lead! 👋`,
      `*${lead.nombre}*`,
      lead.email ? `📧 ${lead.email}` : '',
      lead.telefono ? `📱 ${lead.telefono}` : '',
      lead.presupuesto ? `💰 ${lead.presupuesto}` : '',
      `👉 Revisa el panel`,
    ].filter(Boolean).join('\n'),
    link: '/superadmin/leads',
  }),

  venta_confirmada: (data: { producto: string; monto: string; cliente: string }) => ({
    titulo: '✅ Venta Confirmada',
    mensaje: `¡Felicitaciones! 🎉\n\nSe confirmó una venta de *${data.producto}*\n💵 Monto: $${data.monto}\n👤 Cliente: ${data.cliente}`,
    link: '/superadmin/ventas',
  }),

  lead_cambio_estado: (lead: { nombre: string; estado: string; estadoAnterior: string }) => ({
    titulo: '📊 Lead Actualizado',
    mensaje: `*${lead.nombre}*\n${lead.estadoAnterior} → *${lead.estado}*`,
    link: '/superadmin/leads',
  }),

  recordatorio_cita: (data: { fecha: string; hora: string; ubicacion?: string; link_reunion?: string }) => ({
    titulo: '⏰ Recordatorio de Cita',
    mensaje: [
      `Tu cita es ${data.fecha} a las *${data.hora}*`,
      data.ubicacion ? `📍 ${data.ubicacion}` : '',
      data.link_reunion ? `🔗 ${data.link_reunion}` : 'Revisa tu email para más detalles',
    ].filter(Boolean).join('\n'),
  }),
}

