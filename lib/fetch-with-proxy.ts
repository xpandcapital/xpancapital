import { HttpsProxyAgent } from 'https-proxy-agent'

let _agent: HttpsProxyAgent<string> | null | undefined = undefined

function getProxyAgent(): HttpsProxyAgent<string> | undefined {
  if (_agent === undefined) {
    const url = process.env.FIXIE_URL
    if (url) {
      console.log('[Fixie] Proxy configurado:', url.replace(/\/\/.*@/, '//***@'))
      _agent = new HttpsProxyAgent(url)
    } else {
      console.log('[Fixie] FIXIE_URL no configurada')
      _agent = null
    }
  }
  return _agent || undefined
}

const PROXY_DOMAINS = ['peruapi.com']

function shouldProxy(url: string): boolean {
  return PROXY_DOMAINS.some(domain => url.includes(domain))
}

export function fetchProxied(
  input: RequestInfo | URL,
  init?: RequestInit & { next?: { revalidate?: number | false } }
): Promise<Response> {
  const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url

  if (shouldProxy(urlStr)) {
    const dispatcher = getProxyAgent()
    if (dispatcher) {
      console.log('[Fixie] Enrutando por proxy:', urlStr.substring(0, 80))
      return fetch(input, { ...init, dispatcher } as any)
    }
  }
  return fetch(input, init)
}
