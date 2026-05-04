import { HttpsProxyAgent } from 'https-proxy-agent'
import https from 'https'

const PROXY_DOMAINS = ['peruapi.com']

function shouldProxy(url: string): boolean {
  return PROXY_DOMAINS.some(domain => url.includes(domain))
}

function getProxyAgent(): HttpsProxyAgent<string> | undefined {
  const url = process.env.FIXIE_URL
  if (!url) {
    console.warn('[Fixie] FIXIE_URL no definida')
    return undefined
  }
  return new HttpsProxyAgent(url)
}

function fetchWithAgent(
  url: string,
  options: { method: string; headers: Record<string, string> }
): Promise<Response> {
  const agent = getProxyAgent()
  if (!agent) return fetch(url, options)

  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: options.method,
        headers: options.headers,
        agent,
      },
      (res) => {
        const chunks: Buffer[] = []
        res.on('data', (chunk: Buffer) => chunks.push(chunk))
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString()
          resolve(new Response(body, {
            status: res.statusCode || 200,
            statusText: res.statusMessage,
          }))
        })
      }
    )

    req.on('error', (err) => {
      console.error('[Fixie] Error:', err.message)
      reject(err)
    })

    req.setTimeout(15000, () => {
      req.destroy()
      reject(new Error('Timeout de conexión'))
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

  console.log('[Fixie] Enrutando:', url.substring(0, 90))

  const headers: Record<string, string> = {}
  if (init?.headers) {
    const h = init.headers
    if (h instanceof Headers) {
      h.forEach((v, k) => { headers[k] = v })
    } else if (Array.isArray(h)) {
      h.forEach(([k, v]) => { headers[k] = v })
    } else {
      Object.assign(headers, h)
    }
  }

  try {
    return await fetchWithAgent(url, {
      method: init?.method || 'GET',
      headers,
    })
  } catch (e: any) {
    console.error('[Fixie] Fallo:', e.message)
    throw e
  }
}
