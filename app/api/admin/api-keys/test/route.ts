import { NextRequest, NextResponse } from 'next/server'
import { fetchProxied } from '@/lib/fetch-with-proxy'

// ─── Helpers de Conexión ───────────────────────────────────────────

async function testGemini(key: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`,
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
    if (res.ok || res.status === 401) return { valid: true }
    return { valid: false, error: `Error HTTP ${res.status}` }
  } catch (e: any) {
    return { valid: false, error: e.message || 'Error de red' }
  }
}

// Bearer token estándar
async function testBearer(endpoint: string, key: string): Promise<{ valid: boolean; error?: string }> {
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

// Bearer con headers adicionales
async function testBearerWithHeaders(
  endpoint: string,
  key: string,
  extraHeaders: Record<string, string>
): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${key}`, ...extraHeaders },
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

// API key como query param (?api_token=, ?key=, ?token=, ?api_key=)
async function testKeyInUrl(
  urlTemplate: string,
  key: string,
  paramName: string = 'api_token'
): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetchProxied(`${urlTemplate}?${paramName}=${encodeURIComponent(key)}`)
    if (res.ok) return { valid: true }
    if (res.status === 401) return { valid: false, error: 'Token inválido (401)' }
    if (res.status === 403) return { valid: false, error: 'Acceso denegado (403)' }
    if (res.status === 429) return { valid: false, error: 'Límite excedido (429)' }
    const data = await res.json().catch(() => ({}))
    return { valid: false, error: (data as any).mensaje || (data as any).message || `Error HTTP ${res.status}` }
  } catch (e: any) {
    return { valid: false, error: e.message || 'Error de red' }
  }
}

// API key en header personalizado (ej: x-api-key, x-n8n-api-key)
async function testKeyInHeader(
  endpoint: string,
  key: string,
  headerName: string = 'x-api-key'
): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch(endpoint, {
      headers: { [headerName]: key },
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

// Basic Auth (username:password)
async function testBasicAuth(
  endpoint: string,
  username: string,
  password: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const encoded = Buffer.from(`${username}:${password}`).toString('base64')
    const res = await fetch(endpoint, {
      headers: { Authorization: `Basic ${encoded}` },
    })
    if (res.ok) return { valid: true }
    if (res.status === 401) return { valid: false, error: 'Credenciales inválidas (401)' }
    if (res.status === 403) return { valid: false, error: 'Prohibido (403)' }
    return { valid: false, error: `Error HTTP ${res.status}` }
  } catch (e: any) {
    return { valid: false, error: e.message || 'Error de red' }
  }
}

// ─── TESTERS ────────────────────────────────────────────────────────

const TESTERS: Record<string, (value: string, extra?: Record<string, string>) => Promise<{ valid: boolean; error?: string }>> = {

  // ── Productividad ──────────────────────────────────────────────

  notion_api_key: (v) => testBearerWithHeaders('https://api.notion.com/v1/users', v, {
    'Notion-Version': '2022-06-28',
  }),

  // ── Academia ───────────────────────────────────────────────────

  vimeo_token: (v) => testBearer('https://api.vimeo.com/me', v),

  // ── Mapas ──────────────────────────────────────────────────────

  google_maps_key: (v) => testKeyInUrl(
    'https://maps.googleapis.com/maps/api/geocode/json?address=test', v, 'key'
  ),
  locationiq_key: (v) => testKeyInUrl(
    'https://us1.locationiq.com/v1/reverse?lat=0&lon=0&format=json', v, 'key'
  ),

  // ── APIs Perú ──────────────────────────────────────────────────

  peru_api_token: (v) => testKeyInUrl('https://peruapi.com/api/tipo_cambio', v, 'api_token'),

  tipo_cambio_api: (v) => testKeyInUrl(
    'https://api.apis.net.pe/v2/sunat/tipo-cambio', v, 'token'
  ),

  apisunat_token: (v) => testBearer('https://sandbox.apisunat.pe/api/v3/organizations', v),

  reniec_api_token: (v) => testKeyInUrl('https://peruapi.com/api/tipo_cambio', v, 'api_token'),

  // ── APIs Ecuador ───────────────────────────────────────────────

  apiconsult_token: (v) => testKeyInUrl(
    'https://apiconsult.zampisoft.com/api/consultar?identificacion=0900000000', v, 'token'
  ),

  sri_api_key: (v) => testKeyInUrl(
    'https://api.sriven.com/api/test', v, 'key'
  ),

  registro_civil_ec_token: (v) => testKeyInUrl(
    'https://api.registro-civil.gob.ec/consulta', v, 'token'
  ),

  // ── APIs Colombia ──────────────────────────────────────────────

  datauno_api_key: (v) => testKeyInHeader('https://api.datauno.com/api/v1/saludo', v, 'x-api-key'),

  validaruc_api_key: (v) => testKeyInUrl(
    'https://api.validaruc.com/api/consulta?documento=0999999999', v, 'token'
  ),

  // ── Inteligencia Artificial ────────────────────────────────────

  gemini_key: (v) => testGemini(v),
  openai_key: (v) => testOpenAI(v),
  groq_key: (v) => testBearer('https://api.groq.com/openai/v1/models', v),
  anthropic_key: (v) => testKeyInHeader('https://api.anthropic.com/v1/models', v, 'x-api-key'),
  replicate_key: (v) => testBearer('https://api.replicate.com/v1/models', v),
  stability_key: (v) => testBearer('https://api.stability.ai/v1/user/account', v),
  elevenlabs_key: (v) => testKeyInHeader('https://api.elevenlabs.io/v1/user', v, 'xi-api-key'),
  huggingface_key: (v) => testBearer('https://huggingface.co/api/whoami-v2', v),

  opencodego_key: (v) => testBearer('https://api.opencodego.com/v1/models', v),

  opengozen_key: (v) => testBearer('https://api.opengozen.com/v1/models', v),

  freepik_key: (v) => testKeyInHeader('https://api.freepik.com/v1/resources?limit=1', v, 'x-freepik-api-key'),
  freepik_ai_key: (v) => testKeyInHeader('https://api.freepik.com/v1/resources?limit=1', v, 'x-freepik-api-key'),

  // ── Calendar & Scheduling ──────────────────────────────────────

  flaxxa_api_key: (v) => testKeyInHeader('https://api.flaxxa.com/v1/me', v, 'x-api-key'),
  flaxxa_auth_token: (v) => testBearer('https://api.flaxxa.com/v1/me', v),

  calendly_api_key: (v) => testBearer('https://api.calendly.com/users/me', v),

  calcom_api_key: (v) => testKeyInUrl('https://api.cal.com/v1/me', v, 'apiKey'),

  // ── Automatización ─────────────────────────────────────────────

  pabbly_api_key: (v) => testKeyInUrl(
    'https://emails.pabbly.com/api/ext/verify', v, 'api_key'
  ),

  make_api_key: (v) => testBearer('https://eu1.make.com/api/v2/users/me', v),

  n8n_api_key: (v) => testKeyInHeader('https://api.n8n.io/api/v1/me', v, 'x-n8n-api-key'),
  n8n_api_url: (v, extra) => {
    if (!extra?.n8n_api_key) return Promise.resolve({ valid: false, error: 'Falta n8n_api_key' })
    return testKeyInHeader(`${v.replace(/\/$/, '')}/api/v1/workflows`, extra.n8n_api_key, 'x-n8n-api-key')
  },

  // ── Pagos Perú ─────────────────────────────────────────────────

  culqi_public_key: (v) => testBearer('https://api.culqi.com/v2/tokens', v),
  culqi_secret_key: (v) => testBearer('https://api.culqi.com/v2/charges?limit=1', v),

  // ── Pagos Ecuador ──────────────────────────────────────────────

  paymentez_key: (v) => testBearer('https://ccapi.paymentez.com/v2/merchant/status', v),

  placetopay_key: (v) => testBearer('https://api.placetopay.com/redirection/api/session', v),

  // ── Pagos Internacionales ──────────────────────────────────────

  stripe_secret_key: (v) => testBearer('https://api.stripe.com/v1/account', v),

  mercadopago_access_token: (v) => testBearer('https://api.mercadopago.com/users/me', v),

  paypal_client_id: (v, extra) => {
    if (!extra?.paypal_secret) return Promise.resolve({ valid: false, error: 'Falta paypal_secret' })
    return testBasicAuth('https://api-m.paypal.com/v1/oauth2/token', v, extra.paypal_secret)
  },
  paypal_secret: (v, extra) => {
    if (!extra?.paypal_client_id) return Promise.resolve({ valid: false, error: 'Falta paypal_client_id' })
    return testBasicAuth('https://api-m.paypal.com/v1/oauth2/token', extra.paypal_client_id, v)
  },

  // ── Crypto ─────────────────────────────────────────────────────

  coinbase_api_key: (v) => testBearer('https://api.coinbase.com/v2/accounts', v),

  // ── Trading & Bots ─────────────────────────────────────────────

  tradingview_key: (v) => testKeyInUrl(
    'https://scanner.tradingview.com/forex/scan', v, 'token'
  ),

  alpaca_api_key: (v, extra) => {
    if (!extra?.alpaca_secret_key) return Promise.resolve({ valid: false, error: 'Falta alpaca_secret_key' })
    return testBearer('https://paper-api.alpaca.markets/v2/account', v)
  },

  cryptohopper_api_key: (v) => testKeyInUrl(
    'https://api.cryptohopper.com/v1/hopper', v, 'api_key'
  ),

  quantconnect_api_key: (v) => testBearer('https://www.quantconnect.com/api/v2/projects', v),

  // ── Comunicaciones ─────────────────────────────────────────────

  planifyx_access_token: (v) => testBearer('https://api.planifyx.com/v1/me', v),

  twilio_account_sid: (v, extra) => {
    if (!extra?.twilio_auth_token) return Promise.resolve({ valid: false, error: 'Falta twilio_auth_token' })
    return testBasicAuth(
      `https://api.twilio.com/2010-04-01/Accounts/${v}`, v, extra.twilio_auth_token
    )
  },
  twilio_auth_token: (v, extra) => {
    if (!extra?.twilio_account_sid) return Promise.resolve({ valid: false, error: 'Falta twilio_account_sid' })
    return testBasicAuth(
      `https://api.twilio.com/2010-04-01/Accounts/${extra.twilio_account_sid}`, extra.twilio_account_sid, v
    )
  },

  whatsapp_token: (v) => testBearer('https://graph.facebook.com/v18.0/me', v),

  sendgrid_key: (v) => testBearer('https://api.sendgrid.com/v3/user/profile', v),
  resend_key: (v) => testBearer('https://api.resend.com/api-keys', v),
  mailgun_key: (v) => testBasicAuth('https://api.mailgun.net/v3/domains', 'api', v),

  pusher_app_id: (v, extra) => {
    if (!extra?.pusher_key || !extra?.pusher_secret || !extra?.pusher_cluster)
      return Promise.resolve({ valid: false, error: 'Faltan pusher_key, pusher_secret y pusher_cluster' })
    const timestamp = Math.floor(Date.now() / 1000)
    const authString = `${v}:${extra.pusher_key}:${extra.pusher_secret}:${timestamp}`
    return testBearer(`https://api-${extra.pusher_cluster}.pusher.com/apps/${v}/channels`, authString)
  },

  onesignal_app_id: (v, extra) => {
    if (!extra?.onesignal_api_key)
      return Promise.resolve({ valid: false, error: 'Falta onesignal_api_key' })
    return testKeyInHeader(`https://onesignal.com/api/v1/apps/${v}`, extra.onesignal_api_key, 'Authorization')
  },
  onesignal_api_key: (v, extra) => {
    if (!extra?.onesignal_app_id)
      return Promise.resolve({ valid: false, error: 'Falta onesignal_app_id' })
    return testKeyInHeader(`https://onesignal.com/api/v1/apps/${extra.onesignal_app_id}`, v, 'Authorization')
  },

  pushwoosh_app_id: (v, extra) => {
    if (!extra?.pushwoosh_api_key)
      return Promise.resolve({ valid: false, error: 'Falta pushwoosh_api_key' })
    return testKeyInHeader('https://cp.pushwoosh.com/json/1.3/getApplication', extra.pushwoosh_api_key, 'x-pushwoosh-token')
  },
  pushwoosh_api_key: (v, extra) => {
    if (!extra?.pushwoosh_app_id)
      return Promise.resolve({ valid: false, error: 'Falta pushwoosh_app_id' })
    return testKeyInHeader('https://cp.pushwoosh.com/json/1.3/getApplication', v, 'x-pushwoosh-token')
  },

  fcm_server_key: (v) => testKeyInHeader(
    'https://fcm.googleapis.com/fcm/send', v, 'Authorization'
  ).then(r => {
    if (r.valid) return r
    if (r.error?.includes('401')) return r
    return { valid: true } // FCM responde 400 si falta body pero el key es válido si no es 401
  }),

  // ── Diseño & Video ─────────────────────────────────────────────

  canva_api_key: (v) => testBearer('https://api.canva.com/v1/users/me', v),

  adilo_api_key: (v) => testKeyInHeader('https://api.adilo.com/v1/me', v, 'x-api-key'),

  // ── Recursos & Stock ───────────────────────────────────────────

  unsplash_access_key: (v) => testKeyInUrl('https://api.unsplash.com/photos/random', v, 'client_id'),
  unsplash_secret_key: (v, extra) => {
    if (!extra?.unsplash_access_key)
      return Promise.resolve({ valid: false, error: 'Falta unsplash_access_key' })
    return testBasicAuth('https://unsplash.com/oauth/token', extra.unsplash_access_key, v)
  },

  pexels_api_key: (v) => testBearer('https://api.pexels.com/v1/curated?per_page=1', v),

  pixabay_api_key: (v) => testKeyInUrl(
    'https://pixabay.com/api/?q=test&image_type=photo&per_page=1', v, 'key'
  ),

  brandfetch_api_key: (v) => testBearer('https://api.brandfetch.io/v2/brands/brandfetch.com', v),

  envato_api_key: (v) => testBearer('https://api.envato.com/v1/market/private/user/account', v),
  envato_personal_token: (v) => testBearer('https://api.envato.com/v1/market/private/user/account', v),

  iconfinder_api_key: (v) => testBearer('https://api.iconfinder.com/v4/auth/check', v),

  flaticon_api_key: (v) => testKeyInUrl(
    'https://api.flaticon.com/v3/app/authentication', v, 'apikey'
  ),

  // ── Documentos & PDF ───────────────────────────────────────────

  pdfmonkey_api_key: (v) => testBearer('https://api.pdfmonkey.com/api/v1/documents?per_page=1', v),

  docspring_api_key: (v, extra) =>
    testBasicAuth('https://api.docspring.com/api/v1/templates', v, extra?.docspring_secret || ''),
  docspring_secret: (v, extra) =>
    testBasicAuth('https://api.docspring.com/api/v1/templates', extra?.docspring_api_key || '', v),

  pandadoc_api_key: (v) => testKeyInHeader(
    'https://api.pandadoc.com/public/v1/documents?count=1', v, 'Authorization'
  ),

  // ── Verificación de Identidad ──────────────────────────────────

  onfido_api_key: (v) => testBearer('https://api.onfido.com/v3/applicants?per_page=1', v),

  jumio_api_key: (v, extra) =>
    testBasicAuth('https://api.jumio.com/v4/accounts', v, extra?.jumio_api_secret || ''),
  jumio_api_secret: (v, extra) =>
    testBasicAuth('https://api.jumio.com/v4/accounts', extra?.jumio_api_key || '', v),

  authenteq_api_key: (v) => testBearer('https://api.authenteq.com/v1/me', v),

  // ── Bases de Datos ─────────────────────────────────────────────

  mongodb_api_key: (v) => testKeyInHeader(
    'https://cloud.mongodb.com/api/atlas/v2/groups', v, 'Authorization'
  ),

  planetscale_api_key: (v, extra) =>
    testBasicAuth('https://api.planetscale.com/v1/organizations', v, extra?.planetscale_service_token || ''),
  planetscale_service_token: (v, extra) =>
    testBasicAuth('https://api.planetscale.com/v1/organizations', extra?.planetscale_api_key || '', v),

  upstash_token: (v, extra) => {
    if (!extra?.upstash_url) return Promise.resolve({ valid: false, error: 'Falta upstash_url' })
    return testBearer(`${extra.upstash_url.replace(/\/$/, '')}/ping`, v)
  },
  upstash_url: (v, extra) => {
    if (!extra?.upstash_token) return Promise.resolve({ valid: false, error: 'Falta upstash_token' })
    return testBearer(`${v.replace(/\/$/, '')}/ping`, extra.upstash_token)
  },

  // ── Analytics ──────────────────────────────────────────────────

  mixpanel_token: (v) => testBasicAuth(
    'https://mixpanel.com/api/app/me', v, ''
  ),

  amplitude_key: (v) => testBasicAuth(
    'https://amplitude.com/api/3/middleware', v, ''
  ),

  // ── Cloud & Storage (multi-field) ──────────────────────────────

  cloudinary_api_key: (v, extra) => {
    if (!extra?.cloudinary_api_secret || !extra?.cloudinary_cloud_name)
      return Promise.resolve({ valid: false, error: 'Faltan secret y cloud name' })
    return testBasicAuth(
      `https://api.cloudinary.com/v1_1/${extra.cloudinary_cloud_name}/ping`, v, extra.cloudinary_api_secret
    )
  },

  supabase_url: (v, extra) => {
    if (!extra?.supabase_anon_key) return Promise.resolve({ valid: false, error: 'Falta anon key' })
    return testSupabase(v, extra.supabase_anon_key)
  },

  // ── YouTube ────────────────────────────────────────────────────

  youtube_key: (v) => testKeyInUrl(
    'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=test', v, 'key'
  ),

  // ── Mapbox ─────────────────────────────────────────────────────

  mapbox_token: (v) => testKeyInUrl(
    'https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?limit=1', v, 'access_token'
  ),

  // ── CoinMarketCap / CoinGecko ──────────────────────────────────

  coinmarketcap_key: (v) => testKeyInHeader(
    'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=1', v, 'X-CMC_PRO_API_KEY'
  ),

  coingecko_key: (v) => testKeyInHeader(
    'https://api.coingecko.com/api/v3/ping', v, 'x-cg-demo-api-key'
  ),
}

// ─── POST Handler ──────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fieldId, value, extraValues } = body

    if (!fieldId || !value) {
      return NextResponse.json({ success: false, error: 'fieldId y value son requeridos' }, { status: 400 })
    }

    const tester = TESTERS[fieldId]
    if (!tester) {
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
