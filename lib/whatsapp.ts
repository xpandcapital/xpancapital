import { createClient } from '@/lib/supabase/server'
import { getApiKeys } from '@/lib/api-keys'

const API_BASE = 'https://socialposter.planifyx.com/api'

interface WhatsAppCredentials {
  accessToken: string
  instanceId: string
}

async function getCredentials(userId?: string, empresaId?: string): Promise<WhatsAppCredentials> {
  // 1. Leer de api_keys (personal → global)
  if (userId && empresaId) {
    try {
      const supabase = createClient()
      const keys = await getApiKeys(
        supabase,
        ['planifyx_access_token', 'planifyx_instance_id'],
        userId,
        empresaId
      )
      if (keys.planifyx_access_token) {
        return {
          accessToken: keys.planifyx_access_token,
          instanceId: keys.planifyx_instance_id || '',
        }
      }
    } catch {
      // Fall through to next fallback
    }
  }

  // 2. Fallback: localStorage (client-side cache)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('planifyx_access_token')
    const instance = localStorage.getItem('planifyx_instance_id')
    if (token) return { accessToken: token, instanceId: instance || '' }
  }

  // 3. Fallback: variables de entorno (.env.local)
  return {
    accessToken: process.env.PLANIFYX_ACCESS_TOKEN || '',
    instanceId: process.env.PLANIFYX_INSTANCE_ID || '',
  }
}

interface WhatsAppSendParams {
  number: string
  message: string
  type?: 'text' | 'media'
  media_url?: string
  filename?: string
  userId?: string
  empresaId?: string
}

export async function sendWhatsApp({
  number, message, type = 'text', media_url, filename,
  userId, empresaId,
}: WhatsAppSendParams) {
  const { accessToken, instanceId } = await getCredentials(userId, empresaId)
  if (!accessToken || !instanceId) {
    console.error('[WhatsApp] Credenciales no configuradas')
    return { success: false, error: 'Credenciales no configuradas' }
  }

  try {
    const params = new URLSearchParams({
      number: number.replace(/\D/g, ''),
      type,
      message,
      instance_id: instanceId,
      access_token: accessToken,
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

export async function checkWhatsAppPhone(phone: string, userId?: string, empresaId?: string) {
  const { accessToken } = await getCredentials(userId, empresaId)
  if (!accessToken) return { registered: false, error: 'Credenciales no configuradas' }

  try {
    const res = await fetch(
      `${API_BASE}/check_phone?access_token=${accessToken}&phone=${phone.replace(/\D/g, '')}`
    )
    const data = await res.json()
    return { registered: data?.status === 'success', data }
  } catch (error) {
    console.error('[WhatsApp] Error checking phone:', error)
    return { registered: false, error }
  }
}

export async function notifyNewLead(
  leadName: string, leadEmail: string, leadPhone: string,
  asesorWhatsapp?: string, userId?: string, empresaId?: string
) {
  if (!asesorWhatsapp) return
  const message = `🔔 *Nuevo Lead*\n\nNombre: ${leadName}\nEmail: ${leadEmail}\nTeléfono: ${leadPhone}\n\nRevisa el panel para más detalles.`
  return sendWhatsApp({ number: asesorWhatsapp, message, userId, empresaId })
}

/**
 * Valida que tanto el access_token como el instance_id sean correctos.
 * Llama al endpoint de instancia de Planifyx que requiere AMBOS.
 */
export async function testWhatsAppConnection(userId?: string, empresaId?: string) {
  const { accessToken, instanceId } = await getCredentials(userId, empresaId)
  if (!accessToken) return { success: false, error: 'Access Token no configurado. Configúralo en Api-Nube → Comunicaciones → Planifyx.' }
  if (!instanceId) return { success: false, error: 'Instance ID no configurado. Configúralo en Api-Nube → Comunicaciones → Planifyx.' }

  try {
    // Este endpoint requiere ambos: token + instance_id
    const res = await fetch(
      `${API_BASE}/get_qrcode?instance_id=${instanceId}&access_token=${accessToken}`,
      { method: 'POST' }
    )
    const data = await res.json()

    if (data?.status === 'success') {
      return {
        success: true,
        message: 'Conexión exitosa. Escanea el QR en WhatsApp para vincular.',
        qr: data?.qrcode || data?.qr || null,
      }
    }

    return {
      success: false,
      error: data?.message || data?.error || 'Error al conectar con la instancia. Verifica que el Instance ID sea correcto.',
    }
  } catch (error) {
    return { success: false, error: 'Error de conexión con Planifyx' }
  }
}
