import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseFormaDePago, validarPagoRecibo, getEstadoColor } from '@/lib/parse-forma-pago';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Interpreta el número de cuota desde el título del recibo
 * Ejemplos: "Recibo 17-01" -> cuota 1, "Recibo 17-0" -> inicial/reserva
 */
function parsePaymentNumber(title: string): { lotNumber: string | null; paymentNumber: number | null; isInitial: boolean } {
  if (!title) return { lotNumber: null, paymentNumber: null, isInitial: false };
  
  const match = title.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (match) {
    const paymentNum = parseInt(match[2], 10);
    return {
      lotNumber: match[1].padStart(2, '0'),
      paymentNumber: paymentNum,
      isInitial: paymentNum === 0 // 0 = reserva/inicial
    };
  }
  
  return { lotNumber: null, paymentNumber: null, isInitial: false };
}

/**
 * Genera lista de meses para las cuotas
 */
function generateMonths(startDate: string, monthsCount: number): string[] {
  const months: string[] = [];
  let [year, month] = startDate.split('-').map(Number);
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  for (let i = 0; i < monthsCount; i++) {
    months.push(`${monthNames[month - 1]} ${year}`);
    month++;
    if (month > 12) { month = 1; year++; }
  }
  
  return months;
}

/**
 * Determina si un mes es futuro (después del mes actual)
 * Formato de mes: "Enero 2025"
 */
function isFutureMonth(monthStr: string): boolean {
  const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const match = monthStr.toLowerCase().match(/(\w+)\s+(\d{4})/);
  if (!match) return false;
  
  const monthIdx = monthNames.indexOf(match[1]);
  const year = parseInt(match[2], 10);
  
  if (monthIdx === -1) return false;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11
  
  // Comparar: si el mes de la cuota es mayor al actual, es futuro
  return (year > currentYear) || (year === currentYear && monthIdx > currentMonth);
}

export async function POST(request: NextRequest) {
  try {
    const { project_id } = await request.json();

    if (!project_id) {
      return NextResponse.json({ success: false, error: 'Se requiere project_id' }, { status: 400 });
    }

    // 1. Obtener configuración del proyecto
    const { data: project } = await supabase
      .from('projects')
      .select('id, signature_month, escritura_month')
      .eq('id', project_id)
      .single();

    // 2. Obtener todos los recibos NO desistidos
    const { data: receipts, error: receiptsError } = await supabase
      .from('notion_receipts')
      .select('*')
      .eq('project_id', project_id)
      .eq('is_desistido', false)
      .order('date', { ascending: true });

    if (receiptsError) throw receiptsError;

    // 3. Obtener todos los lotes del proyecto
    const { data: lots, error: lotsError } = await supabase
      .from('project_lots')
      .select('id, lot_number, notion_page_id, payments, initial_payments, expected_quota, start_month, extra_data, total_price')
      .eq('project_id', project_id);

    if (lotsError) throw lotsError;

    // 4. Crear mapas
    const lotByNotionId = new Map<string, any>();
    const lotByNumber = new Map<string, any>();
    
    lots?.forEach(lot => {
      if (lot.notion_page_id) {
        lotByNotionId.set(lot.notion_page_id, lot);
      }
      const normalized = (lot.lot_number || '').replace(/[^0-9]/g, '').padStart(2, '0');
      lotByNumber.set(normalized, lot);
    });

    // 5. Agrupar recibos por lote
    const receiptsByLot = new Map<string, any[]>();
    
    receipts?.forEach(receipt => {
      let lotId: string | null = receipt.lot_id;
      
      if (!lotId && receipt.lot_number) {
        const normalized = receipt.lot_number.replace(/[^0-9]/g, '').padStart(2, '0');
        const lot = lotByNumber.get(normalized);
        if (lot) lotId = lot.id;
      }
      
      if (!lotId && receipt.lot_notion_id) {
        const lot = lotByNotionId.get(receipt.lot_notion_id);
        if (lot) lotId = lot.id;
      }
      
      if (lotId) {
        if (!receiptsByLot.has(lotId)) receiptsByLot.set(lotId, []);
        receiptsByLot.get(lotId)?.push(receipt);
      }
    });

    // 6. Calcular meses de cuotas por defecto
    let defaultMonths: string[] = [];
    if (project?.signature_month && project?.escritura_month) {
      const startParts = project.signature_month.split('-');
      const endParts = project.escritura_month.split('-');
      if (startParts.length >= 2 && endParts.length >= 2) {
        const monthsDiff = (parseInt(endParts[0]) * 12 + parseInt(endParts[1])) - (parseInt(startParts[0]) * 12 + parseInt(startParts[1]));
        defaultMonths = generateMonths(project.signature_month.substring(0, 7), Math.max(monthsDiff, 24));
      }
    }
    if (defaultMonths.length === 0) defaultMonths = generateMonths('2025-01', 24);

    // 7. Actualizar cada lote
    let updatedLots = 0;
    const details: any[] = [];

    for (const [lotId, lotReceipts] of receiptsByLot) {
      const lot = lots?.find(l => l.id === lotId);
      if (!lot) continue;

      // Separar recibos por tipo usando el número de recibo
      const initials: any[] = [];
      const cuotas: any[] = [];
      const refuerzos: any[] = [];

      lotReceipts.forEach(r => {
        const parsed = parsePaymentNumber(r.concept || '');
        if (r.receipt_type === 'inicial' || parsed.isInitial || r.receipt_number === 0) {
          initials.push(r);
        } else if (r.receipt_type === 'refuerzo') {
          refuerzos.push(r);
        } else {
          cuotas.push(r);
        }
      });

      // Parsear "Forma de Pago" para obtener esperados
      const formaPagoText = lot.extra_data?.forma_pago || '';
      const formaPagoInfo = parseFormaDePago(formaPagoText, lot.total_price);

      // Construir initial_payments con validación
      const initialPayments: any[] = [];
      
      // Primero, intentar usar los esperados de "Forma de Pago"
      if (formaPagoInfo.iniciales.length > 0) {
        formaPagoInfo.iniciales.forEach((esperado, idx) => {
          // Buscar recibo que coincida con este inicial
          const matchingReceipts = initials.filter(r =>
            (r.receipt_number !== null && r.receipt_number === idx) ||
            (r.receipt_number === 0 && idx === 0) ||
            (r.receipt_number === null && idx < initials.length)
          );
          
          const actualTotal = matchingReceipts.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
          
          initialPayments.push({
            id: crypto.randomUUID(),
            description: esperado.descripcion,
            expected: esperado.monto,
            actual: actualTotal,
            payment_date: matchingReceipts[0]?.date || esperado.fecha || null,
            receipt_attached: matchingReceipts[0]?.file_url || null,
            validation: validarPagoRecibo(esperado.monto, actualTotal)
          });
        });
      }
      
      // Agregar recibos adicionales que no tienen inicial correspondiente
      initials.forEach((r, idx) => {
        if (idx >= initialPayments.length) {
          initialPayments.push({
            id: crypto.randomUUID(),
            description: r.concept || `Inicial ${idx + 1}`,
            expected: 0,
            actual: r.amount || 0,
            payment_date: r.date || null,
            receipt_attached: r.file_url || null,
            validation: validarPagoRecibo(0, r.amount || 0)
          });
        }
      });

      // Si no hay nada, crear uno vacío
      if (initialPayments.length === 0) {
        initialPayments.push({
          id: crypto.randomUUID(),
          description: 'Entrada Inicial',
          expected: 0,
          actual: 0,
          payment_date: null,
          receipt_attached: null,
          validation: validarPagoRecibo(0, 0)
        });
      }

      // Construir payments (cuotas mensuales)
      const expectedQuota = lot.expected_quota || lot.extra_data?.monto_cuota || formaPagoInfo.cuotas.monto || 0;
      const expectedCuotas = formaPagoInfo.cuotas.cantidad || defaultMonths.length;
      
      // Usar meses del proyecto o default
      const lotMonths = defaultMonths.slice(0, expectedCuotas);
      
      // Mes actual para comparación
      const now = new Date();
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const payments = lotMonths.map((month, idx) => {
        // Cuota número idx + 1 (porque 0 es inicial)
        const matchingReceipts = cuotas.filter(r => r.receipt_number === idx + 1);
        const actualTotal = matchingReceipts.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
        
        // Determinar si es mes futuro
        const monthIsFuture = isFutureMonth(month);
        
        // Si es futuro y no tiene pago, marcar como 'futuro' en lugar de 'pendiente'
        let validation;
        if (monthIsFuture && actualTotal === 0) {
          validation = {
            estado: 'futuro',
            diferencia: -expectedQuota,
            porcentaje: 0,
            mensaje: `Cuota futura: ${month}`
          };
        } else {
          validation = validarPagoRecibo(expectedQuota, actualTotal);
        }
        
        return {
          id: idx,
          month,
          expected: expectedQuota,
          actual: actualTotal,
          payment_date: matchingReceipts[0]?.date || null,
          receipt_attached: matchingReceipts[0]?.file_url || null,
          validation: validation
        };
      });

      // Actualizar en Supabase
      const { error: updateError } = await supabase
        .from('project_lots')
        .update({
          initial_payments: initialPayments,
          payments: payments,
          updated_at: new Date().toISOString()
        })
        .eq('id', lotId);

      if (updateError) {
        details.push({ lot_id: lotId, error: updateError.message });
      } else {
        updatedLots++;
        details.push({ 
          lot_id: lotId,
          lot_number: lot.lot_number,
          initials: initials.length,
          cuotas: cuotas.length,
          validations: {
            initials: initialPayments.map(p => ({ desc: p.description, ...p.validation })),
            payments: payments.filter(p => p.validation.estado !== 'ok').length
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Pagos sincronizados en ${updatedLots} lotes`,
      lots_updated: updatedLots,
      total_receipts: receipts?.length || 0,
      details: details.slice(0, 20)
    });

  } catch (err: any) {
    console.error('Error en sync-lot-payments:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}