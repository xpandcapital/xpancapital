import { NextRequest, NextResponse } from 'next/server'

async function testGemini(key: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hi' }] }],
        }),
      }
    )
    if (res.ok) return { valid: true }
    const data = await res.json().catch(() => ({}))
    if (res.status === 400 && data.error?.message?.includes('API key not valid')) {
      return { valid: false, error: 'API key inválida' }
    }
    if (res.status === 403) return { valid: false, error: 'Acceso denegado (403)' }
    if (res.status === 429) return { valid: false, error: 'Límite de rate excedido (429)' }
    return { valid: false, error: `Error HTTP ${res.status}` }
  } catch (e: any) {
    return { valid: false, error: e.message || 'Error de red' }
  }
}

async function testOpenAI(key: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    })
    if (res.ok) return { valid: true }
    if (res.status === 401) return { valid: false, error: 'API key inválida (401)' }
    if (res.status === 429) return { valid: false, error: 'Rate limit excedido (429)' }
    return { valid: false, error: `Error HTTP ${res.status}` }
  } catch (e: any) {
    return { valid: false, error: e.message || 'Error de red' }
  }
}

async function testSupabase(url: string, key: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    })
    if (res.ok || res.status === 401) return { valid: true } // 401 significa que el endpoint existe pero necesita auth
    return { valid: false, error: `Error HTTP ${res.status}` }
  } catch (e: any) {
    return { valid: false, error: e.message || 'Error de red' }
  }
}

async function testGenericBearer(endpoint: string, key: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${key}` },
    })
    if (res.ok) return { valid: true }
    if (res.status === 401) return { valid: false, error: 'No autorizado (401)' }
    if (res.status === 403) return { valid: false, error: 'Prohibido (403)' }
    if (res.status === 429) return { valid: false, error: 'Rate limit (429)' }
    return { valid: false, error: `Error HTTP ${res.status}` }
  } catch (e: any) {
    return { valid: false, error: e.message || 'Error de red' }
  }
}

const TESTERS: Record<string, (value: string, extra?: Record<string, string>) => Promise<{ valid: boolean; error?: string }>> = {
  gemini_key: (v) => testGemini(v),
  openai_key: (v) => testOpenAI(v),
  groq_key: (v) => testGenericBearer('https://api.groq.com/openai/v1/models', v),
  anthropic_key: (v) => testGenericBearer('https://api.anthropic.com/v1/models', v),
  replicate_key: (v) => testGenericBearer('https://api.replicate.com/v1/models', v),
  stability_key: (v) => testGenericBearer('https://api.stability.ai/v1/user/account', v),
  elevenlabs_key: (v) => testGenericBearer('https://api.elevenlabs.io/v1/user', v),
  huggingface_key: (v) => testGenericBearer('https://huggingface.co/api/whoami-v2', v),
  youtube_key: (v) => testGenericBearer(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=test&key=${v}`, v),
  mapbox_token: (v) => testGenericBearer(`https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token=${v}&limit=1`, v),
  sendgrid_key: (v) => testGenericBearer('https://api.sendgrid.com/v3/user/profile', v),
  resend_key: (v) => testGenericBearer('https://api.resend.com/api-keys', v),
  mailgun_key: (v) => testGenericBearer('https://api.mailgun.net/v3/domains', v),
  unsplash_access_key: (v) => testGenericBearer(`https://api.unsplash.com/photos/random?client_id=${v}`, v),
  pexels_api_key: (v) => testGenericBearer('https://api.pexels.com/v1/curated?per_page=1', v),
  pixabay_api_key: (v) => testGenericBearer(`https://pixabay.com/api/?key=${v}&q=test&image_type=photo&per_page=1`, v),
  coingecko_key: (v) => testGenericBearer('https://api.coingecko.com/api/v3/ping', v),
  coinmarketcap_key: (v) => testGenericBearer('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=1', v),
  cloudinary_api_key: (v, extra) => {
    if (!extra?.cloudinary_api_secret || !extra?.cloudinary_cloud_name) return Promise.resolve({ valid: false, error: 'Faltan secret y cloud name' })
    return testGenericBearer(`https://${v}:${extra.cloudinary_api_secret}@api.cloudinary.com/v1_1/${extra.cloudinary_cloud_name}/ping`, v)
  },
  supabase_url: (v, extra) => {
    if (!extra?.supabase_anon_key) return Promise.resolve({ valid: false, error: 'Falta anon key' })
    return testSupabase(v, extra.supabase_anon_key)
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fieldId, value, extraValues } = body

    if (!fieldId || !value) {
      return NextResponse.json({ success: false, error: 'fieldId y value son requeridos' }, { status: 400 })
    }

    const tester = TESTERS[fieldId]
    if (!tester) {
      // Si no hay tester específico, solo verificamos que el valor no esté vacío y tenga formato razonable
      if (value.length < 8) {
        return NextResponse.json({ success: false, valid: false, error: 'La clave parece demasiado corta' })
      }
      return NextResponse.json({ success: true, valid: true, warning: 'Validación básica (no se pudo probar conexión real)' })
    }

    const result = await tester(value, extraValues || {})
    return NextResponse.json({ success: true, ...result })
  } catch (error: any) {
    console.error('[API Keys Test] error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Error interno' }, { status: 500 })
  }
}
