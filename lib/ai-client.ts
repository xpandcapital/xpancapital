interface ChatOptions {
  model?: 'gemini' | 'gemini-flash' | 'openai' | 'gpt-4o' | 'gpt-4' | 'groq'
  prompt: string
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
  images?: Array<{ mimeType: string; data: string }>
  responseMimeType?: string  // Para forzar JSON en Gemini (ej: "application/json")
}

interface ChatResponse {
  text: string
  model: string
  provider: string
  error?: string
}

export async function aiChat(options: ChatOptions): Promise<ChatResponse> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  })

  const data = await response.json()

  if (!response.ok || data.error) {
    return { text: '', model: '', provider: '', error: data.error || 'Error de conexión con el servicio de IA' }
  }

  return data
}

export async function getApiKey(service: string): Promise<Record<string, string>> {
  const response = await fetch(`/api/admin/api-keys?service=${encodeURIComponent(service)}`)
  const data = await response.json()
  if (!data.success) return {}
  return data.keys || {}
}

export async function saveApiKeys(keys: Record<string, string>): Promise<{ saved: number; errors: number }> {
  const response = await fetch('/api/admin/api-keys', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keys }),
  })
  const data = await response.json()
  return { saved: data.saved || 0, errors: data.errors || 0 }
}