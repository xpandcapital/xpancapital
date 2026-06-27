import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getApiKeys } from '@/lib/api-keys'
import { decryptApiKey } from '@/lib/api-crypto'

const API_BASE = 'https://socialposter.planifyx.com/api'

interface WhatsAppCredentials {
  accessToken: string
  instanceId: string
}

async function getCredentials(userId?: string, empresaId?: string): Promise<WhatsAppCredentials> {
  const supabase = createClient()

  // 1. Leer de api_keys (personal → global)
  if (userId && empresaId) {
    try {
      const keys = await getApiKeys(supabase, ['planifyx_access_token', 'planifyx_instance_id'], userId, empresaId)
      if (keys.planifyx_access_token) {
        return { accessToken: keys.planifyx_access_token.trim(), instanceId: (keys.planifyx_instance_id || '').trim() }
      }
    } catch { /* fall through */ }
  }

  // 1b. Solo empresaId (sin userId) — usar service key para leer keys
  if (!userId && empresaId) {
    try {
      const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      console.log('[WhatsApp] Buscando credenciales en api_keys para empresa:', empresaId, 'svcKey presente:', !!svcKey)
      const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        svcKey
      )
      const { data, error } = await supabaseAdmin
        .from('api_keys')
        .select('key_name, key_value')
        .eq('empresa_id', empresaId)
        .in('key_name', ['planifyx_access_token', 'planifyx_instance_id'])

      console.log('[WhatsApp] api_keys resultado:', data?.length || 0, 'rows, error:', error?.message || 'none')

      if (data) {
        const token = data.find((r: any) => r.key_name === 'planifyx_access_token')
        const instance = data.find((r: any) => r.key_name === 'planifyx_instance_id')
        if (token?.key_value) {
          const decToken = decryptApiKey(token.key_value)?.trim() || ''
          const decInstance = decryptApiKey(instance?.key_value)?.trim() || ''
          console.log('[WhatsApp] Credenciales leídas:', { tokenOK: !!decToken, instanceValue: decInstance || 'VACÍO' })
          return { accessToken: decToken || '', instanceId: decInstance }
        }
      }
    } catch (e) {
      console.error('[WhatsApp] Error leyendo api_keys:', e)
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
  const creds = await getCredentials(userId, empresaId)
  if (!creds.accessToken || !creds.instanceId) {
    console.error('[WhatsApp] Credenciales no configuradas. Verifica api_keys: planifyx_access_token y planifyx_instance_id')
    return { success: false, error: 'Credenciales no configuradas en Api-Nube → Comunicaciones → Planifyx' }
  }

  try {
    const numberClean = number.replace(/\D/g, '')
    console.log('[WhatsApp] sendWhatsApp llamando con:', { number: numberClean, instanceId: creds.instanceId, tokenPrefix: creds.accessToken?.substring(0, 8) })

    // Planifyx requiere POST con query params en la URL (NO JSON body)
    const params = new URLSearchParams({
      number: numberClean,
      type,
      message,
      instance_id: creds.instanceId,
      access_token: creds.accessToken,
    })
    if (media_url) params.set('media_url', media_url)
    if (filename) params.set('filename', filename)

    const res = await fetch(`${API_BASE}/send?${params.toString()}`, { method: 'POST' })
    const text = await res.text()
    console.log('[WhatsApp] Enviado:', numberClean, text.substring(0, 100))

    let data: any = {}
    try { data = JSON.parse(text) } catch {}
    const success = data?.status === 'success' || data?.message === 'success' || text.includes('success')
    return { success, data: data || text }
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

export async function testWhatsAppConnection(userId?: string, empresaId?: string) {
  const creds = await getCredentials(userId, empresaId)
  if (!creds.accessToken) return { success: false, error: 'Access Token no configurado.' }
  if (!creds.instanceId) return { success: false, error: 'Instance ID no configurado.' }

  try {
    // Primero probar get_qrcode (valida que el token+instancia sean válidos)
    const qrRes = await fetch(
      `${API_BASE}/get_qrcode?instance_id=${creds.instanceId}&access_token=${creds.accessToken}`,
      { method: 'POST' }
    )
    const qrText = await qrRes.text()
    console.log('[WhatsApp] get_qrcode test:', qrRes.status, qrText.substring(0, 300))

    // Probar send con query params exactamente como en la documentación
    const sendRes = await fetch(
      `${API_BASE}/send?number=51934111007&type=text&message=test_servidor&instance_id=${creds.instanceId}&access_token=${creds.accessToken}`,
      { method: 'POST' }
    )
    const sendText = await sendRes.text()
    console.log('[WhatsApp] send direct test:', sendRes.status, sendText.substring(0, 300))

    return {
      success: true,
      qrcode: qrText,
      sendResult: sendText,
    }
  } catch (error) {
    return { success: false, error: 'Error de conexión con Planifyx' }
  }
}
