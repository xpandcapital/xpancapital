// Types ────────────────────────────────────────────────────────────────────────
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

interface AIParsedInicial {
  descripcion?: string;
  description?: string;
  monto: number | string;
  fecha: string | null;
}

interface AIParsedCuotas {
  cantidad?: number;
  monto?: number | null;
  fecha_inicio?: string | null;
  dia_pago?: number | null;
}

interface AIParsedResponse {
  iniciales: AIParsedInicial[];
  cuotas: AIParsedCuotas;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Implementation
// ═══════════════════════════════════════════════════════════════════════════════

import { parseFormaDePago as parseWithRules } from './parse-forma-pago';
import { logger } from './utils/logger';
import { aiChat } from './ai-client';

export async function parseFormaDePagoWithAI(
  formaDePago: string,
  _geminiApiKey?: string
): Promise<ParsedFormaDePago> {
  if (!formaDePago || formaDePago.trim() === '') {
    return {
      iniciales: [],
      cuotas: { cantidad: 24, monto: null, fecha_inicio: null, dia_pago: null }
    };
  }

  if (formaDePago.trim().length < 5) {
    const result = parseWithRules(formaDePago);
    return {
      iniciales: result.iniciales,
      cuotas: { cantidad: result.cuotas.cantidad, monto: result.cuotas.monto, fecha_inicio: result.cuotas.fecha_inicio, dia_pago: null }
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
    logger.debug('[Notion AI Parser] Enviando a través del proxy...');

    const result = await aiChat({
      model: 'gemini-flash',
      prompt,
      temperature: 0.1
    });

    if (result.error) {
      logger.error('[Notion AI Parser] Proxy error:', result.error);
      throw new Error(result.error);
    }

    const text = result.text;
    if (!text) {
      logger.error('[Notion AI Parser] No response text from proxy');
      throw new Error('Empty response');
    }

    const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed: AIParsedResponse = JSON.parse(cleanJson);

    logger.debug('[Notion AI Parser] AI result:', parsed);

    if (!parsed.iniciales || !Array.isArray(parsed.iniciales)) {
      throw new Error('Invalid response structure');
    }

    return {
      iniciales: parsed.iniciales.map((i: AIParsedInicial) => ({
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
    console.warn('[Notion AI Parser] Error con proxy, usando reglas:', error);

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
