"use client";

import { getAIConfig } from './ai-config';

const callAI = async (prompt: string, preferredModel: 'gemini' | 'gpt' = 'gemini') => {
    const config = getAIConfig();
    const models = preferredModel === 'gemini' ? ['gemini', 'gpt', 'groq'] : ['gpt', 'gemini', 'groq'];
    let lastError = '';

    for (const model of models) {
        try {
            if (model === 'gemini') {
                if (!config.gemini_key) throw new Error("Sin Key de Gemini");
                let modelId = 'gemini-1.5-flash';
                try {
                    const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${config.gemini_key}`, { signal: AbortSignal.timeout(5000) });
                    if (listResp.ok) {
                        const listData = await listResp.json();
                        const bestFlash = listData.models?.find((m: any) => m.name.includes('flash') && m.name.includes('2.5')) ||
                            listData.models?.find((m: any) => m.name.includes('flash') && m.name.includes('2.0')) ||
                            listData.models?.find((m: any) => m.name.includes('flash') && m.name.includes('3.1')) ||
                            listData.models?.find((m: any) => m.name.includes('flash') && m.name.includes('1.5')) ||
                            listData.models?.find((m: any) => m.name.includes('flash'));
                        if (bestFlash) modelId = bestFlash.name.replace('models/', '');
                    }
                } catch (e) { }

                const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${config.gemini_key}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                    signal: AbortSignal.timeout(25000)
                });
                if (!resp.ok) throw new Error(`Gemini Error: ${resp.status}`);
                const data = await resp.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return { text, modelUsed: `Google ${modelId.toUpperCase()}` };
                throw new Error("Respuesta vacía de Gemini");
            } else if (model === 'gpt') {
                if (!config.openai_key) throw new Error("Sin Key de GPT");
                const resp = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${config.openai_key}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: prompt }], temperature: 0.7 }),
                    signal: AbortSignal.timeout(30000)
                });
                if (!resp.ok) throw new Error(`GPT Error: ${resp.status}`);
                const data = await resp.json();
                const text = data.choices?.[0]?.message?.content;
                if (text) return { text, modelUsed: 'OpenAI GPT-4o Enterprise' };
                throw new Error("Respuesta vacía de GPT");
            } else if (model === 'groq') {
                if (!config.groq_key) throw new Error("Sin Key de Groq");
                const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${config.groq_key}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], temperature: 0.7 }),
                    signal: AbortSignal.timeout(20000)
                });
                if (!resp.ok) throw new Error(`Groq Error: ${resp.status}`);
                const data = await resp.json();
                const text = data.choices?.[0]?.message?.content;
                if (text) return { text, modelUsed: 'Groq Llama 3.3 (Fast Tier)' };
                throw new Error("Respuesta vacía de Groq");
            }
        } catch (err: any) {
            console.warn(`AI Orchestrator Failover: ${model} ->`, err.message);
            lastError = err.message;
        }
    }

    return { text: `ERROR_OFFLINE: Todas las instancias de IA fallaron. Último error: ${lastError}`, modelUsed: 'None' };
};

export { callAI };