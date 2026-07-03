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
    const debug = searchParams.get('debug') === 'true'

    const cacheKey = `forex_${type}`
    // Saltar cache en modo debug
    if (!debug) {
      const cached = cacheStore.get(cacheKey)
      if (cached && cached.timestamp > Date.now() - CACHE_TTL) {
        return NextResponse.json(cached.data)
      }
    }

    // Buscar por key_name sin filtrar por empresa
    const { data: keys } = await supabase
      .from('api_keys')
      .select('key_name, key_value')
      .eq('key_name', 'jbnews_api_key')
      .maybeSingle()

    const debugInfo: any = {
      keyFound: !!keys,
      keyName: keys?.key_name || null,
      hasEncryptedValue: !!(keys?.key_value),
      encryptedPreview: keys?.key_value ? keys.key_value.slice(0, 30) + '...' : null,
    }

    const encrypted = keys?.key_value || ''
    let apiKey = ''
    let decryptSuccess = false
    if (encrypted) {
      try {
        apiKey = decryptApiKey(encrypted)
        decryptSuccess = !!apiKey
        debugInfo.decryptedPreview = apiKey ? apiKey.slice(0, 10) + '...' : null
        debugInfo.decryptOk = true
      } catch (e: any) { 
        debugInfo.decryptError = e.message || 'unknown'
        apiKey = encrypted // fallback a texto plano
      }
    }

    if (!apiKey) {
      const result = { success: true, data: { events: [] }, debug: debugInfo }
      return NextResponse.json(result)
    }

    let endpoint = 'https://www.jblanked.com/news/api/mql5/calendar/today/'
    if (type === 'backtesting') {
      endpoint = 'https://www.jblanked.com/news/api/mql5/calendar/backtesting/smart/'
    }

    debugInfo.endpoint = endpoint
    debugInfo.authHeader = `Api-Key ${apiKey.slice(0, 8)}...`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    
    let res: Response
    try {
      res = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Api-Key ${apiKey}`,
        },
        signal: controller.signal,
      })
    } catch (e: any) {
      debugInfo.fetchError = e.message || 'fetch failed'
      clearTimeout(timeout)
      const result = { success: false, error: 'Fetch error', data: { events: [] }, debug: debugInfo }
      return NextResponse.json(result)
    }
    clearTimeout(timeout)

    debugInfo.httpStatus = res.status
    debugInfo.httpOk = res.ok

    let rawText = ''
    try {
      rawText = await res.text()
      debugInfo.rawLength = rawText.length
      debugInfo.rawPreview = rawText.slice(0, 300)
    } catch (e: any) {
      debugInfo.readError = e.message || 'read failed'
    }

    if (!res.ok) {
      return NextResponse.json({ success: false, error: `HTTP ${res.status}`, data: { events: [] }, debug: debugInfo })
    }

    if (!rawText.trim()) {
      return NextResponse.json({ success: true, data: { events: [] }, debug: { ...debugInfo, hint: 'Empty response body' } })
    }

    let raw: any
    try {
      raw = JSON.parse(rawText)
    } catch {
      debugInfo.parseError = 'Invalid JSON'
      return NextResponse.json({ success: true, data: { events: [] }, debug: debugInfo })
    }

    debugInfo.responseType = Array.isArray(raw) ? 'array' : typeof raw
    if (!Array.isArray(raw)) {
      debugInfo.responseKeys = Object.keys(raw || {}).slice(0, 10)
    }

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

    const result = { success: true, data: { events }, debug: debug ? debugInfo : undefined }
    cacheStore.set(cacheKey, { data: result, timestamp: Date.now() })

    return NextResponse.json(result)
  } catch (e: any) {
    const cached = cacheStore.get(`forex_today`)
    if (cached) return NextResponse.json(cached.data)
    return NextResponse.json({ success: true, data: { events: [] }, debug: { catchError: e.message || 'unknown' } })
  }
}
