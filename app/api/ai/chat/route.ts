import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/api-auth'
import { getApiKey } from '@/lib/api-keys'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const supabase = createClient()
    const body = await request.json()
    const { model, prompt, systemPrompt, maxTokens, temperature, images } = body

    if (!prompt) {
      return NextResponse.json({ error: 'prompt es requerido' }, { status: 400 })
    }

    const modelProvider = model || 'gemini'

    if (modelProvider === 'gemini' || modelProvider === 'gemini-pro' || modelProvider === 'gemini-flash') {
      const apiKey = await getApiKey(supabase, 'gemini_key', auth.userId, auth.empresaId)
      if (!apiKey) {
        return NextResponse.json({ error: 'Gemini API key no configurada. Configúrala en API Nube.' }, { status: 400 })
      }

      const modelName = modelProvider === 'gemini-flash' ? 'gemini-2.5-flash' : 'gemini-2.5-pro'

      const geminiContents: any[] = []

      if (systemPrompt) {
        geminiContents.push({ role: 'user', parts: [{ text: `Instructions: ${systemPrompt}` }] })
        geminiContents.push({ role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] })
      }

      const userParts: any[] = [{ text: prompt }]
      if (images && images.length > 0) {
        for (const img of images) {
          userParts.push({
            inlineData: {
              mimeType: img.mimeType || 'image/jpeg',
              data: img.data,
            }
          })
        }
      }
      geminiContents.push({ role: 'user', parts: userParts })

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: geminiContents,
            generationConfig: {
              maxOutputTokens: maxTokens || 2048,
              temperature: temperature || 0.7,
            },
          }),
        }
      )

      const data = await response.json()

      if (data.error) {
        return NextResponse.json({ error: data.error.message || 'Gemini API error' }, { status: response.status })
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      return NextResponse.json({ text, model: modelName, provider: 'gemini' })
    }

    if (modelProvider === 'openai' || modelProvider === 'gpt-4' || modelProvider === 'gpt-4o' || modelProvider === 'chatgpt') {
      const apiKey = await getApiKey(supabase, 'openai_key', auth.userId, auth.empresaId)
      if (!apiKey) {
        return NextResponse.json({ error: 'OpenAI API key no configurada. Configúrala en API Nube.' }, { status: 400 })
      }

      const modelName = modelProvider === 'gpt-4o' ? 'gpt-4o' : modelProvider === 'gpt-4' ? 'gpt-4' : 'gpt-4o-mini'

      const messages: any[] = []
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })

      if (images && images.length > 0) {
        const content: any[] = [{ type: 'text', text: prompt }]
        for (const img of images) {
          content.push({ type: 'image_url', image_url: { url: `data:${img.mimeType || 'image/jpeg'};base64,${img.data}` } })
        }
        messages.push({ role: 'user', content })
      } else {
        messages.push({ role: 'user', content: prompt })
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages,
          max_tokens: maxTokens || 2048,
          temperature: temperature || 0.7,
        }),
      })

      const data = await response.json()

      if (data.error) {
        return NextResponse.json({ error: data.error.message || 'OpenAI API error' }, { status: response.status })
      }

      const text = data.choices?.[0]?.message?.content || ''
      return NextResponse.json({ text, model: modelName, provider: 'openai' })
    }

    if (modelProvider === 'groq') {
      const apiKey = await getApiKey(supabase, 'groq_key', auth.userId, auth.empresaId)
      if (!apiKey) {
        return NextResponse.json({ error: 'Groq API key no configurada. Configúrala en API Nube.' }, { status: 400 })
      }

      const messages: any[] = []
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
      messages.push({ role: 'user', content: prompt })

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages,
          max_tokens: maxTokens || 2048,
          temperature: temperature || 0.7,
        }),
      })

      const data = await response.json()

      if (data.error) {
        return NextResponse.json({ error: data.error.message || 'Groq API error' }, { status: response.status })
      }

      const text = data.choices?.[0]?.message?.content || ''
      return NextResponse.json({ text, model: 'llama-3.3-70b-versatile', provider: 'groq' })
    }

    return NextResponse.json({ error: `Modelo no soportado: ${modelProvider}. Usa: gemini, openai, groq` }, { status: 400 })
  } catch (error) {
    console.error('[AI Chat] Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}