import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { decryptApiKey } from '@/lib/api-crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const cacheStore = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 3 * 60 * 1000

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'today'

    const cacheKey = `forex_${type}`
    const cached = cacheStore.get(cacheKey)
    if (cached && cached.timestamp > Date.now() - CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    const { data: keys } = await supabase
      .from('api_keys')
      .select('key_name, key_value')
      .eq('key_name', 'jbnews_api_key')
      .maybeSingle()

    const encrypted = keys?.key_value || ''
    let apiKey = ''
    if (encrypted) {
      try { apiKey = decryptApiKey(encrypted) } catch { /* plain text */ }
    }

    if (!apiKey) {
      return NextResponse.json({ success: true, data: { events: [], hint: 'API key no configurada' } })
    }

    let endpoint = 'https://www.jblanked.com/news/api/mql5/calendar/today/'
    if (type === 'backtesting') {
      endpoint = 'https://www.jblanked.com/news/api/mql5/calendar/backtesting/smart/'
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Api-Key ${apiKey}`,
      },
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) {
      return NextResponse.json({ success: false, error: `HTTP ${res.status}`, data: { events: [] } })
    }

    const raw = await res.json()
    const events = (Array.isArray(raw) ? raw : raw?.data || raw?.events || []).map((e: any) => ({
      id: e.id || `${e.event}-${e.time}-${e.currency}`,
      event: e.event || e.name || '',
      currency: e.currency || '',
      time: e.time || '',
      impact: e.impact || 'low',
      outcome: e.outcome || '',
      strength: e.strength || '',
      quality: e.quality || '',
      forecast: e.forecast || null,
      previous: e.previous || null,
      actual: e.actual || null,
    }))

    const result = { success: true, data: { events } }
    cacheStore.set(cacheKey, { data: result, timestamp: Date.now() })

    return NextResponse.json(result)
  } catch {
    const cached = cacheStore.get(`forex_today`)
    if (cached) return NextResponse.json(cached.data)
    return NextResponse.json({ success: true, data: { events: [] } })
  }
}
