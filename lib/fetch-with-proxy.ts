import http from 'http'
import https from 'https'
import tls from 'tls'

const PROXY_DOMAINS = ['peruapi.com']

function shouldProxy(url: string): boolean {
  return PROXY_DOMAINS.some(domain => url.includes(domain))
}

function getProxyConfig(): { host: string; port: number; auth: string } | null {
  const fixieUrl = process.env.FIXIE_URL
  if (!fixieUrl) return null
  const u = new URL(fixieUrl)
  return {
    host: u.hostname,
    port: parseInt(u.port || '80'),
    auth: 'Basic ' + Buffer.from(`${decodeURIComponent(u.username)}:${decodeURIComponent(u.password)}`).toString('base64'),
  }
}

function httpsViaProxy(
  targetUrl: string,
  options: { method: string; headers: Record<string, string> }
): Promise<Response> {
  const proxy = getProxyConfig()
  if (!proxy) return fetch(targetUrl, options)

  const parsed = new URL(targetUrl)
  const targetHost = parsed.hostname
  const targetPort = parseInt(parsed.port || '443')
  const path = parsed.pathname + parsed.search

  return new Promise((resolve, reject) => {
    console.log('[Fixie] Conectando proxy:', proxy.host, '->', targetHost)

    const proxyReq = http.request({
      host: proxy.host,
      port: proxy.port,
      method: 'CONNECT',
      path: `${targetHost}:${targetPort}`,
      headers: {
        'Proxy-Authorization': proxy.auth,
        'Host': `${targetHost}:${targetPort}`,
      },
    })

    proxyReq.on('connect', (_res, socket) => {
      console.log('[Fixie] Túnel CONNECT OK, iniciando TLS...')

      const tlsSocket = tls.connect({
        socket,
        servername: targetHost,
        rejectUnauthorized: true,
      })

      const req = https.get({
        host: targetHost,
        port: targetPort,
        path,
        method: options.method,
        headers: { ...options.headers, Host: targetHost },
        agent: false,
        createConnection: () => tlsSocket,
      }, (res) => {
        const chunks: Buffer[] = []
        res.on('data', (chunk: Buffer) => chunks.push(chunk))
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString()
          console.log('[Fixie] Respuesta:', res.statusCode)
          resolve(new Response(body, {
            status: res.statusCode || 502,
            statusText: res.statusMessage,
          }))
        })
      })

      req.on('error', (err) => {
        console.error('[Fixie] Error HTTP:', err.message)
        reject(err)
      })

      req.setTimeout(15000, () => {
        req.destroy()
        reject(new Error('Timeout HTTP'))
      })
    })

    proxyReq.on('error', (err) => {
      console.error('[Fixie] Error proxy:', err.message)
      reject(err)
    })

    proxyReq.setTimeout(10000, () => {
      proxyReq.destroy()
      reject(new Error('Timeout proxy'))
    })

    proxyReq.end()
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

  const headers: Record<string, string> = { 'Accept': 'application/json' }
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

  console.log('[Fixie] Enrutando:', url.substring(0, 90))
  return httpsViaProxy(url, {
    method: init?.method || 'GET',
    headers,
  })
}
