import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'
import { decryptApiKey } from '@/lib/api-crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

let cache: { data: any; timestamp: number } | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5 min

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'news' // news | calendar

    // Check cache
    const cacheKey = `portal_${type}`
    if (cache && cache.timestamp > Date.now() - CACHE_TTL && cache.data?._key === cacheKey) {
      return NextResponse.json(cache.data)
    }

    // Get Finnhub API key
    const { data: keys } = await supabase
      .from('api_keys')
      .select('key_name, key_value')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .eq('is_global', true)
      .eq('key_name', 'finnhub_api_key')
      .single()

    const apiKey = keys ? decryptApiKey(keys.key_value || '') : ''
    if (!apiKey) {
      return NextResponse.json({ success: true, data: { news: [], calendar: [], error: 'API key no configurada' } })
    }

    let data: any = {}

    if (type === 'news') {
      const res = await fetch(
        `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`,
        { signal: AbortSignal.timeout(8000) }
      )
      if (res.ok) {
        const news = await res.json()
        data.news = (Array.isArray(news) ? news.slice(0, 12) : []).map((n: any) => ({
          id: String(n.id),
          title: n.headline || n.title,
          summary: n.summary || '',
          source: n.source || '',
          url: n.url || '',
          image: n.image || '',
          date: new Date(n.datetime * 1000).toISOString(),
          category: n.category || '',
        }))
      } else {
        data.news = []
      }
    }

    if (type === 'calendar') {
      const today = new Date()
      const from = today.toISOString().split('T')[0]
      const to = new Date(today.getTime() + 7 * 86400000).toISOString().split('T')[0]

      const res = await fetch(
        `https://finnhub.io/api/v1/calendar/economic?from=${from}&to=${to}&token=${apiKey}`,
        { signal: AbortSignal.timeout(8000) }
      )
      if (res.ok) {
        const cal = await res.json()
        data.calendar = (cal?.economicCalendar || []).slice(0, 15).map((e: any) => ({
          date: e.date || '',
          time: e.time || '',
          country: e.country || '',
          event: e.event || e.name || '',
          actual: e.actual,
          previous: e.previous,
          estimate: e.estimate,
          impact: e.impact || '',
          unit: e.unit || '',
        }))
      } else {
        data.calendar = []
      }
    }

    const result = { success: true, data, _key: cacheKey }
    cache = { data: result, timestamp: Date.now() }

    return NextResponse.json(result)
  } catch {
    if (cache) return NextResponse.json(cache.data)
    return NextResponse.json({ success: true, data: { news: [], calendar: [] } })
  }
}
