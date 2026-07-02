import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'
import { decryptApiKey } from '@/lib/api-crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&rsquo;|&lsquo;/g, "'")
    .replace(/&rdquo;|&ldquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
}

const cacheStore = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000

function fetchWithTimeout(url: string, ms: number) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer))
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'news'
    const force = searchParams.get('force') === 'true'

    // Return cached if valid and not forced
    const cacheKey = `portal_${type}`
    if (!force) {
      const cached = cacheStore.get(cacheKey)
      if (cached && cached.timestamp > Date.now() - CACHE_TTL) {
        return NextResponse.json(cached.data)
      }
    }

    // Get Finnhub API key — buscar por key_name, sin filtrar por empresa/is_global
    const { data: keys } = await supabase
      .from('api_keys')
      .select('key_name, key_value')
      .eq('key_name', 'finnhub_api_key')
      .maybeSingle()

    const encrypted = keys?.key_value || ''
    let apiKey = ''
    let decryptError = ''
    if (encrypted) {
      try {
        apiKey = decryptApiKey(encrypted)
      } catch (e: any) {
        decryptError = e.message || 'desconocido'
      }
    }

    if (!apiKey) {
      const result = {
        success: true,
        data: { news: [], calendar: [] },
        debug: { hint: 'API key no configurada o error al desencriptar', decryptError, hasRecord: !!keys }
      }
      return NextResponse.json(result)
    }

    const data: any = {}
    const errors: string[] = []

    if (type === 'news') {
      try {
        const res = await fetchWithTimeout(
          `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`,
          10000
        )
        if (res.ok) {
          const raw = await res.json()
          if (Array.isArray(raw)) {
            data.news = raw.slice(0, 12).map((n: any) => ({
              id: String(n.id || Math.random()),
              title: decodeEntities(n.headline || n.title || 'Sin título'),
              summary: decodeEntities(n.summary || ''),
              source: n.source || '',
              url: n.url || '',
              image: n.image || '',
              date: n.datetime ? new Date(n.datetime * 1000).toISOString() : new Date().toISOString(),
              category: n.category || 'general',
            }))
          } else {
            errors.push(`news: no es array (${typeof raw})`)
            data.news = []
          }
        } else {
          const errText = await res.text().catch(() => '')
          errors.push(`news: HTTP ${res.status} - ${errText.slice(0, 100)}`)
          data.news = []
        }
      } catch (e: any) {
        errors.push(`news: ${e.message || 'fetch failed'}`)
        data.news = []
      }
    }

    if (type === 'calendar') {
      const today = new Date()
      const from = today.toISOString().split('T')[0]
      const to = new Date(today.getTime() + 7 * 86400000).toISOString().split('T')[0]

      try {
        const res = await fetchWithTimeout(
          `https://finnhub.io/api/v1/calendar/economic?from=${from}&to=${to}&token=${apiKey}`,
          10000
        )
        if (res.ok) {
          const cal = await res.json()
          const events = cal?.economicCalendar || cal?.data || []
          if (Array.isArray(events)) {
            data.calendar = events.slice(0, 15).map((e: any) => ({
              date: e.date || '',
              time: e.time || '',
              country: e.country || '',
              event: e.event || e.name || e.title || '',
              actual: e.actual !== undefined ? e.actual : null,
              previous: e.previous !== undefined ? e.previous : null,
              estimate: e.estimate !== undefined ? e.estimate : null,
              impact: e.impact || '',
              unit: e.unit || '',
            }))
          } else {
            data.calendar = []
          }
        } else {
          const errText = await res.text().catch(() => '')
          errors.push(`calendar: HTTP ${res.status} - ${errText.slice(0, 100)}`)
          data.calendar = []
        }
        } catch (e: any) {
        errors.push(`calendar: ${e.message || 'fetch failed'}`)
        data.calendar = []
      }
    }

    // Only cache if we got actual data
    const hasData = (data.news?.length > 0) || (data.calendar?.length > 0)
    const result = { success: true, data, _fromCache: false, errors: errors.length ? errors : undefined }

    if (hasData) {
      cacheStore.set(cacheKey, { data: result, timestamp: Date.now() })
    }

    return NextResponse.json(result)
  } catch (e: any) {
    console.error('[Portal] Unexpected error:', e.message || e)
    return NextResponse.json({ success: true, data: { news: [], calendar: [] } })
  }
}
