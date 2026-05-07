import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// ChatGPT fallback
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

async function callGemini(prompt: string, systemPrompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "model", parts: [{ text: "Entendido." }] },
          { role: "user", parts: [{ text: prompt }] },
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch {
    return null;
  }
}

async function callChatGPT(prompt: string, systemPrompt: string): Promise<string | null> {
  if (!OPENAI_API_KEY) return null;
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mensaje, sala_id, contexto = [], empresa_id, configuracion_ia } = body;

    if (!mensaje) {
      return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const config = configuracion_ia || {};

    // Build system prompt
    const systemPrompt = config.ia_prompt_sistema ||
      `Eres un asistente virtual profesional de BLIS Corp. Responde de manera clara, concisa y servicial en español. Si no sabes algo, ofrece derivar al usuario con un agente humano.`;

    // Build conversation context
    const contextText = contexto
      .map((c: any) => `${c.rol === "ia" ? "Asistente" : "Usuario"}: ${c.contenido}`)
      .join("\n");

    const fullPrompt = `${contextText}\nUsuario: ${mensaje}\nAsistente:`;

    // Try Gemini first, then ChatGPT
    let respuesta = await callGemini(fullPrompt, systemPrompt);
    if (!respuesta) {
      respuesta = await callChatGPT(fullPrompt, systemPrompt);
    }

    // Fallback if both fail
    if (!respuesta) {
      respuesta = "Lo siento, estoy experimentando dificultades técnicas. Un agente humano te atenderá en breve.";
    }

    // Detectar intención de derivación
    const palabrasDerivacion = config.palabras_clave_derivacion || [
      "agente", "humano", "persona", "supervisor", "reclamo", "urgente", "queja"
    ];
    const necesitaDerivacion = palabrasDerivacion.some((p: string) =>
      mensaje.toLowerCase().includes(p.toLowerCase())
    );

    // Save AI response to database
    if (sala_id) {
      await supabaseAdmin.from("chat_mensajes").insert({
        sala_id,
        user_id: null,
        tipo: "ia",
        contenido: respuesta,
        enviado: true,
        metadata: { es_ia: true, modelo: respuesta ? "gemini" : "fallback" },
      });
    }

    return NextResponse.json({
      success: true,
      respuesta,
      necesita_derivacion: necesitaDerivacion,
      confianza: necesitaDerivacion ? 0.3 : 0.9,
    });
  } catch (error: any) {
    console.error("[chat/ai] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
