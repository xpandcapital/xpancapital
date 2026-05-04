let _dispatcher: any = undefined

const PROXY_DOMAINS = ['peruapi.com']

function shouldProxy(url: string): boolean {
  return PROXY_DOMAINS.some(domain => url.includes(domain))
}

function getProxyDispatcher(): any | undefined {
  if (_dispatcher !== undefined) return _dispatcher

  const fixieUrl = process.env.FIXIE_URL
  if (!fixieUrl) {
    console.warn('[Fixie] ERROR: FIXIE_URL no está definida en process.env')
    _dispatcher = null
    return undefined
  }

  console.log('[Fixie] FIXIE_URL detectada:', fixieUrl.replace(/\/\/.*@/, '//***@'))

  try {
    const { ProxyAgent } = require('undici')
    _dispatcher = new ProxyAgent({ uri: fixieUrl, requestTls: { rejectUnauthorized: false } })
    console.log('[Fixie] ProxyAgent de undici creado exitosamente')
  } catch (e: any) {
    console.error('[Fixie] No se pudo crear ProxyAgent de undici:', e.message)

    try {
      const { HttpsProxyAgent } = require('https-proxy-agent')
      _dispatcher = new HttpsProxyAgent(fixieUrl)
      console.log('[Fixie] Fallback: HttpsProxyAgent creado')
    } catch (e2: any) {
      console.error('[Fixie] No se pudo crear HttpsProxyAgent:', e2.message)
      _dispatcher = null
    }
  }

  return _dispatcher || undefined
}

export async function fetchProxied(
  input: RequestInfo | URL,
  init?: RequestInit & { next?: { revalidate?: number | false } }
): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url

  if (!shouldProxy(url)) {
    return fetch(input, init)
  }

  const dispatcher = getProxyDispatcher()
  if (!dispatcher) {
    console.error('[Fixie] Sin dispatcher, usando fetch directo (IP de Vercel)')
    return fetch(input, init)
  }

  console.log('[Fixie] Enrutando:', url.substring(0, 90))
  try {
    const res = await fetch(input, { ...init, dispatcher } as any)
    console.log('[Fixie] Respuesta:', res.status, res.statusText)
    return res
  } catch (e: any) {
    console.error('[Fixie] Error en fetch:', e.message, e.cause)
    throw e
  }
}
