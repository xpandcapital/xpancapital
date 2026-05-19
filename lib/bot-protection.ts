/**
 * Bot Protection con Cloudflare Turnstile
 *
 * Turnstile es un CAPTCHA invisible, gratuito y cumple GDPR.
 * Requiere crear claves en: https://dash.cloudflare.com/?to=/:account/turnstile
 *
 * Flujo:
 * 1. Formulario del lado cliente incluye <div class="cf-turnstile" data-sitekey="...">
 * 2. Al enviar, se incluye el token de Turnstile en el body como "cf_turnstile_response"
 * 3. El API route llama a verifyTurnstileToken() antes de procesar
 * 4. Turnstile verifica el token contra el servidor de Cloudflare
 */

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export async function verifyTurnstileToken(
  token: string,
  secretKey: string
): Promise<{ success: boolean; error?: string }> {
  if (!token || !secretKey) {
    return { success: false, error: 'Token o clave secreta no configurados' }
  }

  try {
    const formData = new URLSearchParams()
    formData.append('secret', secretKey)
    formData.append('response', token)

    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    return {
      success: data.success === true,
      error: data.success ? undefined : data['error-codes']?.join(', ') || 'Verificación fallida'
    }
  } catch {
    return { success: false, error: 'Error de conexión con Turnstile' }
  }
}

/**
 * Verifica un token de Turnstile contra la config en BD.
 * Retorna { success: true } si la verificación pasa o si bot_protection está deshabilitado.
 */
export async function checkBotProtection(
  token: string | null,
  secretKey: string | null,
  habilitado: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!habilitado) return { success: true }
  if (!token) return { success: false, error: 'Token de verificación no proporcionado' }
  if (!secretKey) return { success: false, error: 'Clave secreta de Turnstile no configurada' }

  return verifyTurnstileToken(token, secretKey)
}
