import { getApiKey } from '@/lib/api-keys'
import { getAuthUser } from '@/lib/supabase/api-auth'
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

const REPLICATE_BASE = 'https://api.replicate.com/v1'
const SAM_MODELS = ['meta/sam-2', 'meta/segment-anything-2', 'meta/segment-anything']
const REMBG_MODEL = 'cjwbw/rembg'

interface ReplicatePrediction {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output: any
  error: string | null
}

async function waitForPrediction(predictionId: string, token: string, maxWaitMs = 60000): Promise<ReplicatePrediction> {
  const start = Date.now()
  while (Date.now() - start < maxWaitMs) {
    const res = await fetch(`${REPLICATE_BASE}/predictions/${predictionId}`, {
      headers: { Authorization: `Token ${token}` }
    })
    const prediction: ReplicatePrediction = await res.json()
    if (prediction.status === 'succeeded' || prediction.status === 'failed' || prediction.status === 'canceled') {
      return prediction
    }
    await new Promise(r => setTimeout(r, 2000))
  }
  throw new Error('Timeout esperando predicción de Replicate')
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
  let lastError: Error | null = null

  for (const model of SAM_MODELS) {
    try {
      console.log(`[client] Probando SAM: ${model}`)
      const res = await fetch(`${REPLICATE_BASE}/models/${model}/predictions`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: { image: imageUrl }
        })
      })

      if (!res.ok) {
        const err = await res.text()
        console.warn(`[client] ${model} no disponible: ${res.status}`)
        continue
      }

      const prediction: ReplicatePrediction = await res.json()
      const result = await waitForPrediction(prediction.id, token)

      if (result.status !== 'succeeded' || !result.output) {
        console.warn(`[client] ${model} falló: ${result.error || 'sin output'}`)
        continue
      }

      const output = result.output
      if (Array.isArray(output)) return output
      if (output?.masks && Array.isArray(output.masks)) return output.masks
      if (typeof output === 'string') return [output]
      return [JSON.stringify(output)]
    } catch (err) {
      lastError = err as Error
      console.warn(`[client] ${model} error:`, err)
    }
  }

  throw lastError || new Error('Ningún modelo SAM disponible en Replicate')
}

export async function removeBackground(imageUrl: string, token: string): Promise<string> {
  const res = await fetch(`${REPLICATE_BASE}/models/${REMBG_MODEL}/predictions`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: { image: imageUrl }
    })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Replicate rembg error: ${res.status} ${err}`)
  }

  const prediction: ReplicatePrediction = await res.json()
  const result = await waitForPrediction(prediction.id, token)

  if (result.status !== 'succeeded' || !result.output) {
    throw new Error(`rembg falló: ${result.error || 'Sin output'}`)
  }

  return result.output
}
