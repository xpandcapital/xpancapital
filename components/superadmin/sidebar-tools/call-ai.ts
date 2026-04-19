"use client"

import { aiChat } from '@/lib/ai-client'

const callAI = async (prompt: string, preferredModel: 'gemini' | 'gpt' = 'gemini') => {
    const models = preferredModel === 'gemini' 
        ? ['gemini-flash', 'openai', 'groq'] as const 
        : ['openai', 'gemini-flash', 'groq'] as const

    const modelMap: Record<string, 'gemini-flash' | 'openai' | 'groq'> = {
        'gemini-flash': 'gemini-flash',
        'openai': 'openai',
        'groq': 'groq',
    }

    const nameMap: Record<string, string> = {
        'gemini-flash': 'Google Gemini',
        'openai': 'OpenAI GPT-4o',
        'groq': 'Groq Llama 3.3',
    }

    let lastError = ''

    for (const model of models) {
        try {
            const result = await aiChat({
                model: modelMap[model],
                prompt,
                temperature: 0.7,
            })

            if (result.error) {
                lastError = result.error
                continue
            }

            if (result.text) {
                return { text: result.text, modelUsed: nameMap[model] || model }
            }

            lastError = 'Respuesta vacía'
        } catch (err: any) {
            console.warn(`AI Orchestrator Failover: ${model} ->`, err.message)
            lastError = err.message
        }
    }

    return { text: `ERROR_OFFLINE: Todas las instancias de IA fallaron. Último error: ${lastError}`, modelUsed: 'None' }
}

export { callAI }