const API_BASE = 'https://socialposter.planifyx.com/api'
const ACCESS_TOKEN = '68471a588a44b'
const INSTANCE_ID = '609ACF283XXXX'

interface WhatsAppSendParams {
  number: string
  message: string
  type?: 'text' | 'media'
  media_url?: string
  filename?: string
}

export async function sendWhatsApp({ number, message, type = 'text', media_url, filename }: WhatsAppSendParams) {
  try {
    const params = new URLSearchParams({
      number: number.replace(/\D/g, ''),
      type,
      message,
      instance_id: INSTANCE_ID,
      access_token: ACCESS_TOKEN,
    })
    if (media_url) params.set('media_url', media_url)
    if (filename) params.set('filename', filename)

    const res = await fetch(`${API_BASE}/send?${params.toString()}`, { method: 'POST' })
    const data = await res.json()
    return { success: data?.status === 'success', data }
  } catch (error) {
    console.error('[WhatsApp] Error sending:', error)
    return { success: false, error }
  }
}

export async function checkWhatsAppPhone(phone: string) {
  try {
    const res = await fetch(
      `${API_BASE}/check_phone?access_token=${ACCESS_TOKEN}&phone=${phone.replace(/\D/g, '')}`
    )
    const data = await res.json()
    return { registered: data?.status === 'success', data }
  } catch (error) {
    console.error('[WhatsApp] Error checking phone:', error)
    return { registered: false, error }
  }
}

export async function notifyNewLead(leadName: string, leadEmail: string, leadPhone: string, asesorWhatsapp?: string) {
  if (!asesorWhatsapp) return
  const message = `🔔 *Nuevo Lead*\n\nNombre: ${leadName}\nEmail: ${leadEmail}\nTeléfono: ${leadPhone}\n\nRevisa el panel para más detalles.`
  return sendWhatsApp({ number: asesorWhatsapp, message })
}
