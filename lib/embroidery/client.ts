import { getApiKey } from '@/lib/api-keys'
import { getAuthUser } from '@/lib/supabase/api-auth'
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

const REPLICATE_BASE = 'https://api.replicate.com/v1'
const SAM2_MODEL = 'meta/sam-2'
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
    await new Promise(r => setTimeout(r, 1000))
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
  const res = await fetch(`${REPLICATE_BASE}/models/${SAM2_MODEL}/predictions`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: {
        image: imageUrl,
        output_type: 'mask'
      }
    })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Replicate SAM 2 error: ${res.status} ${err}`)
  }

  const prediction: ReplicatePrediction = await res.json()
  const result = await waitForPrediction(prediction.id, token)

  if (result.status !== 'succeeded' || !result.output) {
    throw new Error(`SAM 2 falló: ${result.error || 'Sin output'}`)
  }

  const maskUrls: string[] = Array.isArray(result.output) ? result.output : [result.output]
  return maskUrls
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
