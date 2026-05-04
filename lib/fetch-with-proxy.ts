import { HttpsProxyAgent } from 'https-proxy-agent'
import https from 'https'
import http from 'http'

const PROXY_DOMAINS = ['peruapi.com']

function shouldProxy(url: string): boolean {
  return PROXY_DOMAINS.some(domain => url.includes(domain))
}

function getProxyAgent(): HttpsProxyAgent<string> | null {
  const url = process.env.FIXIE_URL
  if (!url) return null
  console.log('[Fixie] Proxy activo:', url.replace(/\/\/.*@/, '//***@'))
  return new HttpsProxyAgent(url)
}

async function fetchViaProxy(
  url: string,
  method: string,
  headers: Record<string, string>
): Promise<{ status: number; data: any; headers: Record<string, string> }> {
  const agent = getProxyAgent()
  if (!agent) throw new Error('FIXIE_URL no configurada')

  const parsed = new URL(url)
  const mod = parsed.protocol === 'https:' ? https : http

  return new Promise((resolve, reject) => {
    const req = mod.request(
      url,
      {
        method,
        headers: { ...headers, 'Accept': 'application/json' },
        agent,
      },
      (res) => {
        const chunks: Buffer[] = []
        res.on('data', (chunk: Buffer) => chunks.push(chunk))
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf-8')
          try {
            resolve({
              status: res.statusCode || 500,
              data: JSON.parse(body),
              headers: res.headers as Record<string, string>,
            })
          } catch {
            resolve({
              status: res.statusCode || 500,
              data: body,
              headers: res.headers as Record<string, string>,
            })
          }
        })
      }
    )

    req.on('error', (err) => {
      console.error('[Fixie] Error de conexión:', err.message)
      reject(err)
    })

    req.setTimeout(15000, () => {
      req.destroy()
      reject(new Error('Timeout de conexión al proxy'))
    })

    req.end()
  })
}

export async function fetchProxied(
  input: RequestInfo | URL,
  init?: RequestInit & { next?: { revalidate?: number | false } }
): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url

  if (!shouldProxy(url)) {
    return fetch(input, init)
  }

  const method = init?.method || 'GET'
  const headers = init?.headers
    ? Object.fromEntries(
        init.headers instanceof Headers
          ? (init.headers as any).entries()
          : Array.isArray(init.headers)
            ? init.headers
            : Object.entries(init.headers)
      )
    : {}

  try {
    console.log('[Fixie] Enrutando por proxy:', url.substring(0, 80))
    const result = await fetchViaProxy(url, method, headers)
    return new Response(JSON.stringify(result.data), {
      status: result.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    console.error('[Fixie] Fallo:', e.message)
    throw e
  }
}
