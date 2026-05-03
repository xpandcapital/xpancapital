import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { cart, context, catalog, apiKey: bodyApiKey, gptKey: bodyGptKey, groqKey: bodyGroqKey } = await request.json();

        // 1. Keys from Headers (if any)
        const headerGemini = request.headers.get('x-gemini-key');
        const headerOpenAI = request.headers.get('x-openai-key');
        const headerGroq = request.headers.get('x-groq-key');

        // 2. Usamos Body o Env como fallback
        const activeKey = headerGemini || bodyApiKey || process.env.GEMINI_API_KEY;
        const activeGptKey = headerOpenAI || bodyGptKey || process.env.OPENAI_API_KEY;
        const activeGroqKey = headerGroq || bodyGroqKey || process.env.GROQ_API_KEY;

        if (!activeKey && !activeGptKey && !activeGroqKey) {
            return NextResponse.json({ error: "No se configuraron llaves de IA (Gemini, GPT ni Groq)" }, { status: 400 });
        }

        const systemInstruction = `
Eres un ASISTENTE DE VENTAS EXPERTO e Inteligente para el POS de "Blis Corp". 
Tu misión es analizar el carrito actual del cliente y el "contexto del cliente" (lo que quiere lograr) para sugerir productos que aumenten el valor de la venta (Upselling y Cross-selling).

REGLAS DE RESPUESTA:
1. **Sugerencias de Catálogo**: Analiza el "catalog" proporcionado y sugiere productos que EXISTEN actualmente y complementan la compra.
2. **Sugerencias Ideales (NUEVAS)**: Sugiere productos que NO están en el catálogo pero que serían PERFECTOS para lo que el cliente quiere hacer.
3. **Lenguaje**: Habla de forma persuasiva pero breve. Explica POR QUÉ cada sugerencia es útil.
4. **Formato**: Debes responder ÚNICAMENTE con un objeto JSON válido con la estructura:
{
  "catalog_suggestions": [
     { "id": "id_del_producto", "title": "Nombre", "reason": "Por qué sugerirlo" }
  ],
  "ideal_suggestions": [
     { "title": "Nombre del Producto Ideal", "reason": "Por qué sería un éxito", "estimated_price": 0.00 }
  ]
}
`;

        const userPrompt = `
CARRITO ACTUAL: ${JSON.stringify(cart)}
CONTEXTO DEL CLIENTE: "${context || 'No especificado'}"
CATÁLOGO: ${JSON.stringify(catalog.map((p: any) => ({ id: p.id, title: p.title, category: p.category, price: p.price })))}
`;

        const fullPrompt = systemInstruction + "\n\n" + userPrompt;

        // --- ATTEMPT GEMINI ---
        if (activeKey) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
                        generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
                    }),
                    signal: AbortSignal.timeout(15000)
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) return NextResponse.json(JSON.parse(text));
                }
            } catch (e) { console.error("Gemini POS Error:", e); }
        }

        // --- ATTEMPT OPENAI (FALLBACK) ---
        if (activeGptKey) {
            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeGptKey}` },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [{ role: 'user', content: fullPrompt }],
                        response_format: { type: "json_object" },
                        temperature: 0.7
                    }),
                    signal: AbortSignal.timeout(15000)
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data.choices?.[0]?.message?.content;
                    if (text) return NextResponse.json(JSON.parse(text));
                }
            } catch (e) { console.error("OpenAI POS Error:", e); }
        }

        // --- ATTEMPT GROQ (FALLBACK) ---
        if (activeGroqKey) {
            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeGroqKey}` },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [{ role: 'user', content: fullPrompt }],
                        response_format: { type: "json_object" },
                        temperature: 0.7
                    }),
                    signal: AbortSignal.timeout(15000)
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data.choices?.[0]?.message?.content;
                    if (text) return NextResponse.json(JSON.parse(text));
                }
            } catch (e) { console.error("Groq POS Error:", e); }
        }

        return NextResponse.json({ error: "No se pudo obtener respuesta de ninguna IA. Verifique sus API Keys." }, { status: 500 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
