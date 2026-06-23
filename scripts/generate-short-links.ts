/**
 * Script: Genera enlaces cortos inteligentes (max 6 caracteres) para productos sin uno
 * Uso: npx tsx scripts/generate-short-links.ts
 * Requiere: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const STOP_WORDS = new Set([
  'de', 'la', 'el', 'los', 'las', 'del', 'en', 'un', 'una',
  'para', 'por', 'con', 'sin', 'al', 'su', 'se', 'lo', 'le',
  'y', 'e', 'o', 'a', 'que', 'es', 'no', 'tu', 'mi', 'ya',
  '1', '11', '30', '365', 'all', 'in', 'one', 'roi', 'roe',
])

function getSignificantWords(nombre: string): string[] {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
}

function generateBaseCode(nombre: string): string[] {
  const words = getSignificantWords(nombre)
  const attempts: string[] = []

  if (words.length === 0) {
    // Caso extremo: usar el slug directamente
    return [nombre.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 6)]
  }

  if (words.length === 1) {
    const w = words[0]
    // Tomar primeros 6, o rellenar repitiendo
    const code = w.substring(0, Math.min(w.length, 6)).padEnd(3, 'x')
    attempts.push(code.substring(0, 6))
    // Variante: primeras 3 + últimas 3
    if (w.length >= 6) {
      attempts.push(w.substring(0, 3) + w.substring(w.length - 3))
    }
    return attempts
  }

  // 2+ palabras: 3+3 de primera y última
  const first = words[0]
  const last = words[words.length - 1]
  attempts.push((first.substring(0, 3) + last.substring(0, 3)).substring(0, 6))

  // 3+2+1 o 2+2+2 si hay 3+ palabras
  if (words.length >= 3) {
    const mid = words[Math.floor(words.length / 2)]
    attempts.push((first.substring(0, 2) + mid.substring(0, 2) + last.substring(0, 2)).substring(0, 6))
  }

  // Variante 2+4
  if (first.length >= 2 && last.length >= 4) {
    attempts.push(first.substring(0, 2) + last.substring(0, 4))
  }

  // Variante 4+2
  if (first.length >= 4 && last.length >= 2) {
    attempts.push(first.substring(0, 4) + last.substring(0, 2))
  }

  // Variante: primera palabra completa acortada a 6
  attempts.push(first.substring(0, 6).padEnd(3, 'x'))

  // Variante: última palabra acortada a 6
  attempts.push(last.substring(0, 6).padEnd(3, 'x'))

  return [...new Set(attempts.map(a => a.substring(0, 6)))]
}

function makeUnique(base: string, usedCodes: Set<string>): string {
  if (!usedCodes.has(base)) return base

  // Intentar con dígito al final (5 chars + 1 dígito)
  const prefix = base.substring(0, 5)
  for (let i = 1; i <= 9; i++) {
    const attempt = prefix + i
    if (!usedCodes.has(attempt)) return attempt
  }

  // Intentar con letras
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  for (const l of letters) {
    const attempt = prefix + l
    if (!usedCodes.has(attempt)) return attempt
  }

  // Último recurso: 5 chars aleatorios
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  for (let r = 0; r < 1000; r++) {
    let code = ''
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
    if (!usedCodes.has(code)) return code
  }

  throw new Error('No se pudo generar código único')
}

async function main() {
  // Obtener todos los productos
  const { data: productos, error: prodError } = await supabase
    .from('productos')
    .select('id, slug, nombre')
    .order('creado_en', { ascending: true })

  if (prodError || !productos) {
    console.error('Error obteniendo productos:', prodError)
    return
  }

  // Obtener enlaces cortos existentes
  const { data: linksExistentes } = await supabase
    .from('short_links')
    .select('codigo, url_destino')

  const codigosUsados = new Set(linksExistentes?.map(l => l.codigo) || [])
  const urlsExistentes = new Set(linksExistentes?.map(l => l.url_destino) || [])

  let creados = 0
  let actualizados = 0
  let omitidos = 0

  console.log(`Productos: ${productos.length} | Enlaces existentes: ${linksExistentes?.length || 0}\n`)

  for (const p of productos) {
    const url = `/tienda/producto/${p.slug}`

    // Verificar si ya tiene un short link para esta URL
    const linkExistente = linksExistentes?.find(l => l.url_destino === url)

    // Si ya tiene uno generado por este script (6 chars significativo), omitir
    if (linkExistente && linkExistente.codigo.length <= 6) {
      omitidos++
      continue
    }

    // Generar nuevo código de 6 chars
    const attempts = generateBaseCode(p.nombre)
    let codigo = ''
    for (const attempt of attempts) {
      const candidate = makeUnique(attempt, codigosUsados)
      if (candidate === attempt || candidate.length === 6) {
        codigo = candidate
        break
      }
    }

    if (!codigo) {
      codigo = makeUnique('tmp' + Math.random().toString(36).substring(2, 5), codigosUsados)
    }

    if (linkExistente) {
      // Actualizar existente (era largo/aleatorio, reemplazar con nuevo significativo)
      const { error } = await supabase
        .from('short_links')
        .update({ codigo })
        .eq('url_destino', url)

      if (!error) {
        codigosUsados.delete(linkExistente.codigo)
        codigosUsados.add(codigo)
        actualizados++
        console.log(`  ↻ ${codigo.padEnd(8)} ← ${linkExistente.codigo.padEnd(22)} ${p.nombre}`)
      }
    } else {
      // Crear nuevo
      const { error } = await supabase
        .from('short_links')
        .insert({ codigo, url_destino: url })

      if (!error) {
        codigosUsados.add(codigo)
        urlsExistentes.add(url)
        creados++
        const words = getSignificantWords(p.nombre)
        console.log(`  ✓ ${codigo.padEnd(8)} ${words.length ? words.join('+') : '—'.padEnd(12)} ${p.nombre}`)
      } else {
        console.error(`  ⚠ Error "${p.nombre}": ${error.message}`)
      }
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`  Creados: ${creados} | Actualizados: ${actualizados} | Omitidos: ${omitidos} | Total: ${productos.length}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}

main().catch(console.error)
