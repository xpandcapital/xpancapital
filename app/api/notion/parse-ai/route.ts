import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { getAuthUser } from '@/lib/supabase/api-auth';
import { getApiKey } from '@/lib/api-keys';
import { createClient as createSupabaseClient } from '@/lib/supabase/server';

/**
 * Parsea "Forma de Pago" usando Gemini Flash
 */
async function parseWithGemini(text: string, apiKey: string) {
  const prompt = `Analiza este campo "Forma de Pago" de un contrato inmobiliario y extrae los datos.

TEXTO:
"""
${text}
"""

INSTRUCCIONES:
1. Los pagos INICIALES son pagos ÚNICOS al inicio (reserva, entrada, inicial)
2. Las CUOTAS son pagos MENSUALES RECURRENTES
3. Todo monto con $ ANTES de la palabra "cuota" es un inicial
4. El monto DESPUÉS de "cuotas mensuales de $X" es la cuota mensual

EJEMPLO:
"$150 el 9 de abril
$10.617 el 10 de abril  
Cuotas mensuales de $500 los días 17 a partir de mayo 2025"
→ iniciales: [{desc:"Reserva",monto:150,fecha:"2025-04-09"}, {desc:"Inicial 1",monto:10617,fecha:"2025-04-10"}]
→ cuotas: {monto:500,desde:"2025-05",dia:17}

Responde SOLO con este JSON:
{
  "iniciales": [{"descripcion":"string","monto":number,"fecha":"YYYY-MM-DD|null"}],
  "cuotas": {"monto":number|null,"desde":"YYYY-MM|null","dia":number|null}
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!responseText) {
    throw new Error('Empty response from Gemini');
  }

  // Limpiar markdown si existe
  const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleanJson);
}

/**
 * POST - Analiza "Forma de Pago" con Gemini AI y actualiza los expected
 * MANTIENE los actual de los recibos ya sincronizados
 */
export async function POST(request: NextRequest) {
  try {
    const { project_id, gemini_api_key } = await request.json();

    if (!project_id) {
      return NextResponse.json(
        { success: false, error: 'Se requiere project_id' },
        { status: 400 }
      );
    }

    // Obtener key: prioridad al body (compatibilidad), fallback a API Nube
    let finalKey = gemini_api_key || ''
    if (!finalKey) {
      const auth = await getAuthUser(request)
      if (auth) {
        const supabaseClient = createSupabaseClient()
        finalKey = await getApiKey(supabaseClient, 'gemini_key', auth.userId, auth.empresaId) || ''
      }
    }

    if (!finalKey) {
      return NextResponse.json(
        { success: false, error: 'Se requiere Gemini API Key. Agréga tu key en API Nube.' },
        { status: 400 }
      );
    }

    logger.debug('[Notion AI] Iniciando análisis para proyecto:', project_id);

    // Obtener lotes del proyecto (con cliente, no solo "Vendido")
    const { data: lots, error: lotsError } = await supabase
      .from('project_lots')
      .select('id, lot_number, extra_data, status, initial_payments, expected_quota, client_name')
      .eq('project_id', project_id)
      .not('client_name', 'is', null)
      .neq('client_name', '')
      .neq('client_name', 'No especificado');

    if (lotsError) {
      logger.error('[Notion AI] Error obteniendo lotes:', lotsError);
      throw lotsError;
    }

    if (!lots || lots.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay lotes con cliente para analizar',
        processed: 0
      });
    }

    logger.debug(`[Notion AI] ${lots.length} lotes encontrados con cliente`);

    let processed = 0;
    let skipped = 0;
    const errors: string[] = [];
    const results = [];

    for (const lot of lots) {
      try {
        const formaPagoText = lot.extra_data?.forma_pago || '';
        
        logger.debug(`[Notion AI] Lote ${lot.lot_number}: forma_pago = "${formaPagoText?.substring(0, 100) || 'SIN DATO'}..."`);
        
        if (!formaPagoText || formaPagoText.trim() === '') {
          logger.debug(`[Notion AI] Lote ${lot.lot_number} omitido: SIN forma de pago`);
          skipped++;
          continue;
        }

        logger.debug(`[Notion AI] Analizando lote ${lot.lot_number} con Gemini...`);

        // Llamar a Gemini
        const parsed = await parseWithGemini(formaPagoText, finalKey);
        logger.debug(`[Notion AI] Resultado:`, JSON.stringify(parsed, null, 2));

        // Obtener los initial_payments ACTUALES para mantener los `actual`
        const existingPayments = Array.isArray(lot.initial_payments) ? lot.initial_payments : [];
        logger.debug(`[Notion AI] Pagos existentes:`, existingPayments.length);

        // Construir nuevos initial_payments combinando esperados del AI con actual de recibos
        const newInitialPayments: any[] = [];
        
        if (parsed.iniciales && parsed.iniciales.length > 0) {
          parsed.iniciales.forEach((inicial: any, idx: number) => {
            // Buscar si ya existe un pago con este índice
            const existingPayment = existingPayments[idx];
            const existingActual = existingPayment?.actual || 0;
            const existingDate = existingPayment?.payment_date || existingPayment?.paymentDate || null;
            const existingReceipt = existingPayment?.receipt_attached || existingPayment?.receiptAttached || null;
            
            newInitialPayments.push({
              id: existingPayment?.id || crypto.randomUUID(),
              description: inicial.descripcion || `Inicial ${idx + 1}`,
              expected: inicial.monto || 0,
              // MANTENER el actual de los recibos ya sincronizados
              actual: existingActual,
              payment_date: inicial.fecha || existingDate,
              receipt_attached: existingReceipt
            });
          });
        }

        // Si no hay iniciales del AI, mantener los existentes o crear vacío
        if (newInitialPayments.length === 0 && existingPayments.length > 0) {
          // Mantener los existentes
          newInitialPayments.push(...existingPayments);
        } else if (newInitialPayments.length === 0) {
          newInitialPayments.push({
            id: crypto.randomUUID(),
            description: 'Entrada Inicial',
            expected: 0,
            actual: 0,
            payment_date: null,
            receipt_attached: null
          });
        }

        logger.debug(`[Notion AI] Lote ${lot.lot_number}: ${newInitialPayments.length} pagos iniciales`);

        // Actualizar en Supabase
        const updateData = {
          initial_payments: newInitialPayments,
          // Solo actualizar expected_quota si Gemini encontró un valor
          ...(parsed.cuotas?.monto ? { expected_quota: parsed.cuotas.monto } : {}),
          extra_data: {
            ...lot.extra_data,
            forma_pago_ai: {
              parsed_at: new Date().toISOString(),
              iniciales: parsed.iniciales,
              cuotas: parsed.cuotas
            }
          }
        };

        const { error: updateError } = await supabase
          .from('project_lots')
          .update(updateData)
          .eq('id', lot.id);

        if (updateError) {
          logger.error(`[Notion AI] ❌ Error update lote ${lot.lot_number}:`, updateError);
          errors.push(`Lote ${lot.lot_number}: ${updateError.message}`);
        } else {
          logger.debug(`[Notion AI] ✓ Lote ${lot.lot_number} actualizado`);
          processed++;
          results.push({
            lot_number: lot.lot_number,
            iniciales: newInitialPayments.length,
            expected_cuota: parsed.cuotas?.monto || lot.expected_quota,
            payments: newInitialPayments.map(p => ({
              desc: p.description,
              expected: p.expected,
              actual: p.actual
            }))
          });
        }

        // Pausa para no saturar la API
        await new Promise(r => setTimeout(r, 500));

      } catch (err: any) {
        logger.error(`[Notion AI] Error lote ${lot.lot_number}:`, err);
        errors.push(`Lote ${lot.lot_number}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Análisis completado: ${processed} lotes actualizados, ${skipped} omitidos`,
      processed,
      skipped,
      total: lots.length,
      errors: errors.length > 0 ? errors : undefined,
      results
    });

  } catch (err: any) {
    logger.error('[Notion AI] Error general:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
