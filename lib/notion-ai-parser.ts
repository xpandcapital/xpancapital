/**
 * BLIS Corp — Notion AI Parser (Forma de Pago)
 * Usa Gemini para interpretar inteligentemente el campo "Forma de Pago"
 * Adaptado del sistema de extracción de contratos
 */

import { parseFormaDePago as parseWithRules } from './parse-forma-pago';

export interface ParsedFormaDePago {
  iniciales: Array<{
    descripcion: string;
    monto: number;
    fecha: string | null;
  }>;
  cuotas: {
    cantidad: number;
    monto: number | null;
    fecha_inicio: string | null;
    dia_pago: number | null;
  };
}

/**
 * Usa Gemini para interpretar el campo "Forma de Pago"
 * Si no hay API key o falla, usa reglas
 */
export async function parseFormaDePagoWithAI(
  formaDePago: string,
  geminiApiKey?: string
): Promise<ParsedFormaDePago> {
  // Si no hay texto, retornar vacío
  if (!formaDePago || formaDePago.trim() === '') {
    return {
      iniciales: [],
      cuotas: { cantidad: 24, monto: null, fecha_inicio: null, dia_pago: null }
    };
  }

  // Si no hay API key, usar reglas inmediatamente
  if (!geminiApiKey) {
    console.log('[Notion AI Parser] No API key, usando reglas');
    const result = parseWithRules(formaDePago);
    return {
      iniciales: result.iniciales,
      cuotas: {
        cantidad: result.cuotas.cantidad,
        monto: result.cuotas.monto,
        fecha_inicio: result.cuotas.fecha_inicio,
        dia_pago: null
      }
    };
  }

  const prompt = `Eres un experto en análisis de datos inmobiliarios. Analiza el campo "FORMA DE PAGO" y extrae los datos estructurados.

TEXTO A ANALIZAR:
"""
${formaDePago}
"""

INSTRUCCIONES CRÍTICAS:

1. IDENTIFICA PAGOS INICIALES (son pagos ÚNICOS al inicio, NO recurrentes):
   - Busca montos que vienen ANTES de cualquier mención de "cuotas" o "mensual"
   - Ejemplos: Reserva $150, Inicial $10.617, Entrada $5.000
   - Todo monto con $ que tenga fecha específica es un inicial

2. IDENTIFICA CUOTAS MENSUALES (son pagos RECURRENTES):
   - Busca frases como "cuotas mensuales de $X", "cuota mensual", "pagos mensuales"
   - El monto de cuota es RECURRENTE, no es un pago único
   - Las cuotas NO van en la lista de iniciales

3. PARSEA FECHAS CORRECTAMENTE:
   - "9 de abril de 2025" → fecha: "2025-04-09"
   - "10 de ABRIL de 2025" → fecha: "2025-04-10"
   - "abril de 2025" o "mayo de 2025" → fecha_inicio: "2025-04" o "2025-05"
   - "los días 17" → dia_pago: 17

4. EJEMPLOS DE PARSING CORRECTO:

   Ejemplo 1:
   "$150,00 USD el 9 de ABRIL de 2025
   $10.617,45 USD 10 de ABRIL de 2025
   Cuotas mensuales de $500,00 los días 17 a partir de Mayo de 2025"
   →
   iniciales: [
      { descripcion: "Reserva", monto: 150, fecha: "2025-04-09" },
      { descripcion: "Inicial 1", monto: 10617.45, fecha: "2025-04-10" }
    ]
   cuotas: { cantidad: 24, monto: 500, fecha_inicio: "2025-05", dia_pago: 17 }

   Ejemplo 2:
   "Reserva $500, Inicial 20%, 48 cuotas de $300"
   →
   iniciales: [
      { descripcion: "Reserva", monto: 500, fecha: null }
    ]
   cuotas: { cantidad: 48, monto: 300, fecha_inicio: null, dia_pago: null }

5. REGLAS DE NEGOCIO:
   - Si hay "cuota mensual" o "mensuales", eso es CUOTA (no inicial)
   - Montos pequeños (< $1000) son generalmente reservas
   - Montos grandes con fechas son iniciales
   - Todo lo que viene DESPUÉS de "cuotas mensuales" pertenece a cuotas

Responde ÚNICAMENTE con este JSON exacto (sin markdown, sin explicaciones):
{
  "iniciales": [
     {
       "descripcion": "Reserva|Inicial 1|Inicial 2|etc",
       "monto": 0,
       "fecha": "YYYY-MM-DD o null"
     }
  ],
  "cuotas": {
    "cantidad": 24,
    "monto": 0,
    "fecha_inicio": "YYYY-MM o null",
    "dia_pago": null
  }
}`;

  try {
    console.log('[Notion AI Parser] Enviando a Gemini...');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!response.ok) {
      console.error('[Notion AI Parser] Gemini API error:', response.status);
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error('[Notion AI Parser] No response text from Gemini');
      throw new Error('Empty response');
    }

    // Limpiar posible markdown
    const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    
    console.log('[Notion AI Parser] Gemini result:', parsed);
    
    // Validar estructura mínima
    if (!parsed.iniciales || !Array.isArray(parsed.iniciales)) {
      throw new Error('Invalid response structure');
    }

    return {
      iniciales: parsed.iniciales.map((i: any) => ({
        descripcion: i.descripcion || i.description || 'Pago',
        monto: typeof i.monto === 'number' ? i.monto : parseFloat(i.monto) || 0,
        fecha: i.fecha || null
      })),
      cuotas: {
        cantidad: parsed.cuotas?.cantidad || 24,
        monto: parsed.cuotas?.monto || null,
        fecha_inicio: parsed.cuotas?.fecha_inicio || null,
        dia_pago: parsed.cuotas?.dia_pago || null
      }
    };
  } catch (error) {
    console.warn('[Notion AI Parser] Error con Gemini, usando reglas:', error);
    
    // Fallback a reglas
    const result = parseWithRules(formaDePago);
    return {
      iniciales: result.iniciales,
      cuotas: {
        cantidad: result.cuotas.cantidad,
        monto: result.cuotas.monto,
        fecha_inicio: result.cuotas.fecha_inicio,
        dia_pago: null
      }
    };
  }
}

/**
 * Obtiene la API key de Gemini desde localStorage o Supabase
 */
export async function getGeminiApiKey(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  // Intentar desde localStorage primero
  const localKey = localStorage.getItem('gemini_key');
  if (localKey) return localKey;
  
  // Intentar desde blis_ai_config
  const configStr = localStorage.getItem('blis_ai_config');
  if (configStr) {
    try {
      const config = JSON.parse(configStr);
      if (config.gemini_key) return config.gemini_key;
    } catch {}
  }
  
  return null;
}
