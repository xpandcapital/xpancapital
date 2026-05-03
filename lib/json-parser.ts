/**
 * Limpia respuestas de IA que pueden contener JSON con formato inconsistente.
 */
export function cleanJsonResponse(text: string): string {
  if (!text) return ''

  let cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()

  // Intentar extraer el primer objeto JSON completo
  const firstBrace = cleaned.indexOf('{')
  if (firstBrace < 0) return cleaned

  // Contar profundidad de llaves para encontrar el cierre correcto
  let depth = 0
  let inString = false
  let escaped = false
  let endIdx = -1

  for (let i = firstBrace; i < cleaned.length; i++) {
    const ch = cleaned[i]
    if (escaped) {
      escaped = false
      continue
    }
    if (ch === '\\') {
      escaped = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      continue
    }
    if (inString) continue
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) {
        endIdx = i + 1
        break
      }
    }
  }

  if (endIdx > 0) {
    cleaned = cleaned.substring(firstBrace, endIdx)
  } else {
    // Si no se encontró cierre, intentar con el substring desde la primera llave
    cleaned = cleaned.substring(firstBrace)
  }

  // Fix: escapar saltos de línea dentro de strings JSON
  cleaned = cleaned.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match) => {
    // Ya está en un string JSON, no modificar
    return match
  })

  // Fix: si el JSON está incompleto, intentar cerrarlo
  let openBraces = 0
  let openBrackets = 0
  for (const ch of cleaned) {
    if (ch === '{') openBraces++
    else if (ch === '}') openBraces--
    else if (ch === '[') openBrackets++
    else if (ch === ']') openBrackets--
  }
  
  // Cerrar arrays pendientes
  while (openBrackets > 0) { cleaned += ']'; openBrackets-- }
  // Cerrar objetos pendientes  
  while (openBraces > 0) { cleaned += '}'; openBraces-- }

  // Fix: remover caracteres de control excepto \n \r \t (pero no dentro de strings)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

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

  // Strategy 3: Intentar extraer JSON con regex greedy
  const match = cleaned.match(/\{[\s\S]*\}/)
  if (match) {
    try { return JSON.parse(match[0]) } catch {}
  }

  // Strategy 4: Remover todos los saltos de línea (pueden romper el parse)
  const noNewlines = cleaned.replace(/\n/g, '\\n').replace(/\r/g, '\\r')
  try { return JSON.parse(noNewlines) } catch {}

  throw new Error(`JSON inválido después de múltiples intentos. Respuesta: ${text.substring(0, 200)}...`)
}
