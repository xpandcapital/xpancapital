import { getApiKey } from '@/lib/api-keys'
import { getAuthUser } from '@/lib/supabase/api-auth'
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

const REPLICATE_BASE = 'https://api.replicate.com/v1'
const SAM_MODELS = [
  { owner: 'meta', name: 'sam-2' },
  { owner: 'meta', name: 'segment-anything-2' },
  { owner: 'meta', name: 'segment-anything' },
  { owner: 'cjwbw', name: 'rembg' },
]
const REMBG_MODEL = { owner: 'cjwbw', name: 'rembg' }

interface ReplicatePrediction {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output: any
  error: string | null
  logs?: string
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
  throw new Error('Timeout esperando predicción de Replicate (60s)')
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
      const modelPath = `${model.owner}/${model.name}`
      console.log(`[segment] Probando modelo: ${modelPath}`)

      const res = await fetch(`${REPLICATE_BASE}/models/${modelPath}/predictions`, {
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
        const errText = await res.text()
        console.warn(`[segment] ${modelPath} no disponible (${res.status}): ${errText.slice(0, 200)}`)
        continue
      }

      const prediction: ReplicatePrediction = await res.json()
      console.log(`[segment] Predicción creada: ${prediction.id}, status: ${prediction.status}`)

      const result = await waitForPrediction(prediction.id, token)
      console.log(`[segment] Resultado: ${result.status}`)

      if (result.status === 'failed') {
        console.warn(`[segment] ${modelPath} falló: ${result.error}`)
        continue
      }

      if (result.status !== 'succeeded' || !result.output) {
        continue
      }

      const output = result.output
      if (Array.isArray(output)) return output
      if (output?.masks && Array.isArray(output.masks)) return output.masks
      if (output?.combined_image) return [output.combined_image]
      if (typeof output === 'string') return [output]
      return []
    } catch (err) {
      lastError = err as Error
      console.warn(`[segment] ${model.owner}/${model.name} error:`, err)
    }
  }

  throw lastError || new Error('Ningún modelo SAM disponible en Replicate. Verifica los nombres de modelo.')
}

export async function removeBackground(imageUrl: string, token: string): Promise<string> {
  console.log(`[remove-bg] Iniciando con modelo: ${REMBG_MODEL.owner}/${REMBG_MODEL.name}`)
  console.log(`[remove-bg] Image URL: ${imageUrl.slice(0, 80)}...`)

  const res = await fetch(
    `${REPLICATE_BASE}/models/${REMBG_MODEL.owner}/${REMBG_MODEL.name}/predictions`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: { image: imageUrl }
      })
    }
  )

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Replicate ${REMBG_MODEL.owner}/${REMBG_MODEL.name} error ${res.status}: ${errText.slice(0, 300)}`)
  }

  const prediction: ReplicatePrediction = await res.json()
  console.log(`[remove-bg] Predicción: ${prediction.id}`)

  const result = await waitForPrediction(prediction.id, token)

  if (result.status === 'failed') {
    throw new Error(`rembg falló: ${result.error || 'error desconocido'}`)
  }

  if (result.status !== 'succeeded' || !result.output) {
    throw new Error(`rembg no generó output (status: ${result.status})`)
  }

  console.log(`[remove-bg] Éxito, output: ${typeof result.output}`)
  return typeof result.output === 'string' ? result.output : result.output.image || JSON.stringify(result.output)
}
