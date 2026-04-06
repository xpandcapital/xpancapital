import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { title, idea, apiKey: bodyApiKey, gptKey: bodyGptKey, groqKey: bodyGroqKey } = await request.json();

        // 1. Priorizamos Headers (enviados desde el Dashboard)
        const headerGemini = request.headers.get('x-gemini-key');
        const headerOpenAI = request.headers.get('x-openai-key');
        const headerGroq = request.headers.get('x-groq-key');

        // 2. Usamos Body o Env como fallback
        const activeKey = headerGemini || bodyApiKey || process.env.GEMINI_API_KEY;
        const activeGptKey = headerOpenAI || bodyGptKey || process.env.OPENAI_API_KEY;
        const activeGroqKey = headerGroq || bodyGroqKey || process.env.GROQ_API_KEY;

        if (!activeKey && !activeGptKey && !activeGroqKey) {
            return NextResponse.json({ error: "No se configuraron llaves de IA (Gemini, GPT ni Groq)" }, { status: 500 });
        }

        const systemInstruction = `
Eres un copywriter de ÉLITE y experto en educación financiera para Blis Corp. Tu misión es redactar un artículo MONUMENTALMENTE LARGO y EXHAUSTIVO (MÍNIMO 1200 PALABRAS). No es un artículo, es una CLASE MAESTRA.

REGLAS DE ORO (INNEGOCIABLES):
1. **VERACIDAD Y CONTEXTO LOCAL (CRÍTICO)**: No inventes términos. Debes usar terminología real y legal del país en cuestión. 
   - Ejemplo para PERÚ: Usa "Impuesto de Alcabala", "Impuesto Predial", "Arbitrios", "Impuesto a la Renta de 2da Categoría". 
   - PROHIBIDO usar términos genéricos o inventados como "ISV" o "IPIN". Si no estás seguro de un término legal, descríbelo con precisión real.
2. **EXTENSIÓN OBLIGATORIA (MÍNIMO 1200 PALABRAS)**: Desglosa cada idea hasta el mínimo detalle. Queremos al menos 8,000 caracteres de texto puro.
3. **FILOSOFÍA ELI5**: Explica conceptos técnicos mediante analogías divertidas (ej: "La Alcabala es como el peaje que pagas por entrar a tu propia casa").
4. **PÚRPURA MARCO DE IMÁGENES**: Inserta MÍNIMO 5 bloques:
   <blockquote class="image-prompt-suggestion" style="background:#2d0a4e;color:#b175ff;padding:15px;border-radius:10px;margin:20px 0;"><strong>🎨 Sugerencia de Imagen:</strong> [Prompt detallado en español para Midjourney]</blockquote>
5. **ESTRUCTURA DE CONSULTALTA**: Mínimo 8 Secciones H2. Incluye siempre una "📖 Guía Paso a Paso" y un "❓ FAQ" con 5 preguntas reales.
6. **EMOJIS (MÍNIMO 60)**: Inunda el texto con emojis pertinentes.

Debes devolver un JSON exacto:
{
  "title": "Un título magnético e informativo",
  "seoTitle": "Título SEO para Blis Corp",
  "excerpt": "Cliffhanger con emojis",
  "category": "Categoría",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"],
  "content": "EL ARTÍCULO MONUMENTAL (1200+ PALABRAS) EN HTML. Usa <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em> y los blockquotes morados."
}
IMPORTANTE: La precisión técnica combinada con la calidez de Kevin Valdez es lo que hace a Blis Corp único.
`;

        const userPrompt = `Título o Base inicial (únete de esto para mejorar el título final): ${title}
Idea Principal de lo que debe tratar el blog: ${idea}
¡Redacta el artículo ahora con todo el formato esperado!`;

        // --- Strategy: Try Gemini First, Fallback to GPT, Fallback to Groq ---
        let resultJSON = null;
        let lastError = '';

        // --- STEP 1: Attempt Gemini ---
        if (activeKey) {
            try {
                // We use the models endpoint to find the actually available version and verify the key
                const modelsResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${activeKey}`, {
                    signal: AbortSignal.timeout(10000)
                });
                const modelsData = await modelsResp.json();

                if (modelsResp.ok) {
                    const flashModel = modelsData.models?.find((m: any) => m.name.includes('flash') && m.name.includes('2.5'))?.name
                        || modelsData.models?.find((m: any) => m.name.includes('flash') && m.name.includes('2.0'))?.name
                        || modelsData.models?.find((m: any) => m.name.includes('flash') && m.name.includes('3.1'))?.name
                        || modelsData.models?.find((m: any) => m.name.includes('flash') && m.name.includes('1.5'))?.name
                        || modelsData.models?.find((m: any) => m.name.includes('flash'))?.name
                        || 'models/gemini-pro';

                    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/${flashModel}:generateContent?key=${activeKey}`;
                    const response = await fetch(geminiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            systemInstruction: { parts: [{ text: systemInstruction }] },
                            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                            generationConfig: { temperature: 0.8, responseMimeType: "application/json", maxOutputTokens: 8192 }
                        }),
                        signal: AbortSignal.timeout(60000)
                    });

                    const data = await response.json();
                    if (response.ok) {
                        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (responseText) {
                            const cleanText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
                            resultJSON = JSON.parse(cleanText);
                        }
                    } else {
                        lastError = `Gemini: ${data.error?.message || response.status}`;
                    }
                } else {
                    lastError = `Gemini Model Access: ${modelsData.error?.message || modelsResp.status}`;
                }
            } catch (e: any) {
                lastError = `Gemini Exception: ${e.message}`;
                console.error("Gemini Failure:", e);
            }
        }

        // --- STEP 2: Fallback to OpenAI if Gemini failed or was skipped ---
        if (!resultJSON && activeGptKey) {
            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${activeGptKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o',
                        messages: [
                            { role: 'system', content: systemInstruction },
                            { role: 'user', content: userPrompt }
                        ],
                        temperature: 0.8,
                        max_tokens: 4006,
                        response_format: { type: "json_object" }
                    }),
                    signal: AbortSignal.timeout(60000)
                });

                const data = await response.json();
                if (response.ok) {
                    resultJSON = JSON.parse(data.choices?.[0]?.message?.content);
                } else {
                    lastError += ` | GPT: ${data.error?.message || response.status}`;
                }
            } catch (e: any) {
                lastError += ` | GPT Exception: ${e.message}`;
                console.error("GPT Failure:", e);
            }
        }

        // --- STEP 3: Fallback to Groq if everything else failed ---
        if (!resultJSON && activeGroqKey) {
            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${activeGroqKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [
                            { role: 'system', content: systemInstruction },
                            { role: 'user', content: userPrompt }
                        ],
                        temperature: 0.8,
                        max_tokens: 4096,
                        response_format: { type: "json_object" }
                    }),
                    signal: AbortSignal.timeout(60000)
                });

                const data = await response.json();
                if (response.ok) {
                    resultJSON = data.choices?.[0]?.message?.content ? JSON.parse(data.choices?.[0]?.message?.content) : null;
                } else {
                    lastError += ` | Groq: ${data.error?.message || response.status}`;
                }
            } catch (e: any) {
                lastError += ` | Groq Exception: ${e.message}`;
                console.error("Groq Failure:", e);
            }
        }

        if (resultJSON) {
            return NextResponse.json(resultJSON);
        }

        return NextResponse.json({ error: `No se pudo generar el contenido. Detalle: ${lastError}` }, { status: 500 });

    } catch (error: any) {
        console.error("Critical Generate Blog Error:", error);
        return NextResponse.json({ error: `Excepción crítica: ${error.message}` }, { status: 500 });
    }
}
