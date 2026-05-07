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

async function callGemini(prompt: string, systemPrompt: string, model: string, maxTokens: number): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const response = await fetch(`${url}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [
          { role: "user", parts: [{ text: prompt }] },
        ],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      console.error("[chat/ai] Gemini error:", await response.text());
      return null;
    }
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.error("[chat/ai] Gemini exception:", err);
    return null;
  }
}

async function callChatGPT(prompt: string, systemPrompt: string, model: string, maxTokens: number): Promise<string | null> {
  if (!OPENAI_API_KEY) return null;
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error("[chat/ai] OpenAI error:", await response.text());
      return null;
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error("[chat/ai] OpenAI exception:", err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mensaje, sala_id, contexto = [], empresa_id } = body;

    if (!mensaje) {
      return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Load config from database if empresa_id provided
    let config: any = {};
    if (empresa_id) {
      const { data: dbConfig } = await supabaseAdmin
        .from("chat_config")
        .select("*")
        .eq("empresa_id", empresa_id)
        .single();
      if (dbConfig) config = dbConfig;
    }

    // If IA is disabled, respond with fallback
    if (config.ia_activa === false) {
      const fallback = config.widget_mensaje_fuera_horario ||
        "Gracias por contactarnos. Un asesor te atenderá en breve.";
      if (sala_id) {
        await supabaseAdmin.from("chat_mensajes").insert({
          sala_id,
          user_id: null,
          tipo: "sistema",
          contenido: fallback,
          enviado: true,
          metadata: { es_ia: false, motivo: "ia_desactivada" },
        });
      }
      return NextResponse.json({ success: true, respuesta: fallback, necesita_derivacion: true, confianza: 0.1 });
    }

    // Build system prompt
    const systemPrompt = config.ia_prompt_sistema ||
      `Eres un asistente virtual profesional de BLIS Corp. Responde de manera clara, concisa y servicial en español. Si no sabes algo, ofrece derivar al usuario con un agente humano.`;

    // Build conversation context
    const contextText = contexto
      .map((c: any) => `${c.rol === "ia" ? "Asistente" : "Usuario"}: ${c.contenido}`)
      .join("\n");

    const fullPrompt = `${contextText}\nUsuario: ${mensaje}\nAsistente:`;

    const iaModelo = config.ia_modelo || "gemini-2.5-flash-preview-05-20";
    const maxTokens = config.ia_max_tokens || 1024;
    const isGemini = iaModelo.startsWith("gemini");

    // Try configured model first, then fallback
    let respuesta: string | null = null;
    let modeloUsado = iaModelo;

    if (isGemini) {
      respuesta = await callGemini(fullPrompt, systemPrompt, iaModelo, maxTokens);
      if (!respuesta && OPENAI_API_KEY) {
        respuesta = await callChatGPT(fullPrompt, systemPrompt, "gpt-4o-mini", maxTokens);
        modeloUsado = "gpt-4o-mini";
      }
    } else {
      respuesta = await callChatGPT(fullPrompt, systemPrompt, iaModelo, maxTokens);
      if (!respuesta && GEMINI_API_KEY) {
        respuesta = await callGemini(fullPrompt, systemPrompt, "gemini-1.5-flash", maxTokens);
        modeloUsado = "gemini-1.5-flash";
      }
    }

    // Fallback if both fail
    if (!respuesta) {
      respuesta = "Lo siento, estoy experimentando dificultades técnicas. Un agente humano te atenderá en breve.";
      modeloUsado = "fallback";
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
        metadata: { es_ia: true, modelo: modeloUsado },
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
