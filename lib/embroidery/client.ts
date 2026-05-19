import { getApiKey } from '@/lib/api-keys'
import { getAuthUser } from '@/lib/supabase/api-auth'
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

const REPLICATE_BASE = 'https://api.replicate.com/v1'

const MODELS: Record<string, string> = {
  rembg: 'fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
  'sam-2': 'fe97b453a6455861e3bac769b441ca1f1086110da7466dbb65cf1eecfd60dc83',
  'segment-anything-2': 'be7cbde9fdf0eecdc8b20ffec9dd0d1cfeace0832d4d0b58a071d993182e1be0',
  'real-esrgan': 'b3ef194191d13140337468c916c2c5b96dd0cb06dffc032a022a31807f6a5ea8',
}

interface ReplicatePrediction {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output: any
  error: string | null
  logs?: string
}

async function waitForPrediction(id: string, token: string, maxWaitMs = 90000): Promise<ReplicatePrediction> {
  const start = Date.now()
  while (Date.now() - start < maxWaitMs) {
    const res = await fetch(`${REPLICATE_BASE}/predictions/${id}`, {
      headers: { Authorization: `Token ${token}` }
    })
    const p: ReplicatePrediction = await res.json()
    if (p.status === 'succeeded' || p.status === 'failed' || p.status === 'canceled') {
      return p
    }
    await new Promise(r => setTimeout(r, 2000))
  }
  throw new Error('Timeout esperando predicción de Replicate (90s)')
}

async function createPrediction(version: string, input: Record<string, any>, token: string): Promise<ReplicatePrediction> {
  const res = await fetch(`${REPLICATE_BASE}/predictions`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ version, input })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Replicate error ${res.status}: ${err.slice(0, 300)}`)
  }

  return res.json()
}

export async function getReplicateKey(request: NextRequest): Promise<string> {
  const supabase = createClient()
  const auth = await getAuthUser(request)
  if (!auth) throw new Error('Usuario no autenticado')

  const key = await getApiKey(supabase, 'replicate_key', auth.userId, auth.empresaId)
  if (!key) throw new Error('API Key de Replicate no configurada. Ve a /superadmin/api-nube')
  return key
}

export async function segmentWithSAM2(imageUrl: string, token: string): Promise<string[]> {
  const versions = [MODELS['sam-2'], MODELS['segment-anything-2']]

  for (const version of versions) {
    try {
      console.log(`[segment] Usando version: ${version.slice(0, 8)}...`)

      const prediction = await createPrediction(version, { image: imageUrl }, token)
      console.log(`[segment] Predicción: ${prediction.id}, status: ${prediction.status}`)

      const result = await waitForPrediction(prediction.id, token)
      console.log(`[segment] Resultado: ${result.status}`)

      if (result.status === 'failed') {
        console.warn(`[segment] Version ${version.slice(0, 8)} falló: ${result.error}`)
        continue
      }

      if (result.status !== 'succeeded' || !result.output) continue

      const output = result.output
      if (Array.isArray(output)) return output
      if (output?.masks && Array.isArray(output.masks)) return output.masks
      if (output?.combined_image) return [output.combined_image]
      if (typeof output === 'string') return [output]
      return []
    } catch (err) {
      console.warn(`[segment] Error con version ${version.slice(0, 8)}:`, err)
    }
  }

  throw new Error('Ningún modelo SAM 2 disponible en Replicate')
}

export async function removeBackground(imageUrl: string, token: string): Promise<string> {
  console.log(`[remove-bg] Iniciando rembg version ${MODELS.rembg.slice(0, 8)}...`)

  const prediction = await createPrediction(MODELS.rembg, { image: imageUrl }, token)
  console.log(`[remove-bg] Predicción: ${prediction.id}`)

  const result = await waitForPrediction(prediction.id, token)

  if (result.status === 'failed') {
    throw new Error(`rembg falló: ${result.error || 'error desconocido'}`)
  }

  if (result.status !== 'succeeded' || !result.output) {
    throw new Error(`rembg sin output (status: ${result.status})`)
  }

  console.log(`[remove-bg] Éxito`)
  return typeof result.output === 'string' ? result.output : ''
}

export async function enhanceImage(imageUrl: string, scale: number, token: string): Promise<string> {
  console.log(`[enhance] Real-ESRGAN upscale ${scale}x...`)

  const prediction = await createPrediction(MODELS['real-esrgan'], {
    image: imageUrl,
    scale,
    face_enhance: false,
  }, token)
  console.log(`[enhance] Predicción: ${prediction.id}`)

  const result = await waitForPrediction(prediction.id, token)

  if (result.status === 'failed') {
    throw new Error(`Real-ESRGAN falló: ${result.error || 'error desconocido'}`)
  }

  if (result.status !== 'succeeded' || !result.output) {
    throw new Error(`Real-ESRGAN sin output (status: ${result.status})`)
  }

  console.log(`[enhance] Éxito`)
  return typeof result.output === 'string' ? result.output : ''
}
