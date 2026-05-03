/**
 * Limpia respuestas de IA que pueden contener JSON con formato inconsistente.
 */
export function cleanJsonResponse(text: string): string {
  if (!text) return ''

  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()

  // Extraer solo el objeto JSON si hay texto alrededor
  const jsonMatch = cleaned.match(/\{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*}/s)
  if (jsonMatch && jsonMatch[0].length > cleaned.length * 0.5) {
    cleaned = jsonMatch[0]
  }

  // Remover BOM
  cleaned = cleaned.replace(/^\uFEFF/, '')

  // Fix: strings no terminados — cerrar el último string abierto
  // Buscar el último " que no tiene cierre
  if (cleaned.trimEnd().endsWith('"')) {
    // Parece correcto
  } else if ((cleaned.match(/"/g) || []).length % 2 !== 0) {
    // Hay un número impar de comillas — el último string no está cerrado
    // Agregar cierre antes de la última llave
    cleaned = cleaned.trimEnd()
    if (!cleaned.endsWith('"') && !cleaned.endsWith('\\"')) {
      cleaned = cleaned.substring(0, cleaned.lastIndexOf('}')) + '"}'
    }
  }

  return cleaned
}

/**
 * Intenta parsear JSON de una respuesta de IA con múltiples estrategias.
 */
export function safeJsonParse(text: string): any {
  if (!text) throw new Error('Empty text')

  // Strategy 1: Parse directo
  try { return JSON.parse(text) } catch {}

  // Strategy 2: Limpiar y parsear
  const cleaned = cleanJsonResponse(text)
  try { return JSON.parse(cleaned) } catch {}

  // Strategy 3: Intentar extraer con diferentes patrones de regex
  const patterns = [
    /\{[\s\S]*\}/,
    /\[[\s\S]*\]/,
  ]
  for (const pattern of patterns) {
    const match = cleaned.match(pattern)
    if (match) {
      try { return JSON.parse(match[0]) } catch {}
    }
  }

  throw new Error(`JSON inválido después de múltiples intentos. Respuesta: ${text.substring(0, 200)}...`)
}
