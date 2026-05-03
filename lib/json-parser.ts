/**
 * Limpia respuestas de IA que pueden contener JSON con formato inconsistente.
 */
export function cleanJsonResponse(text: string): string {
  if (!text) return ''

  // 1. Remover markdown code blocks
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()

  // 2. Extraer solo el objeto JSON si hay texto alrededor
  const jsonMatch = cleaned.match(/\{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*\}/s)
  if (jsonMatch && jsonMatch[0].length > cleaned.length * 0.5) {
    cleaned = jsonMatch[0]
  }

  // 3. Remover BOM y caracteres de control excepto \n \r \t
  cleaned = cleaned.replace(/^\uFEFF/, '')
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')

  // 4. Fix common issues: unescaped newlines inside strings
  // Reemplazar saltos de línea literales dentro de strings JSON
  cleaned = cleaned.replace(/(?<=:\s*")(.*?)(?=")/gs, (match: string) => {
    return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
  })

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
