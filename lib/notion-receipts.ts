/**
 * BLIS Corp — Notion Receipts Integration
 * Sincroniza recibos de Notion con Supabase
 */
import { queryDatabase, resolveNotionId } from './notion';
import { logger } from './utils/logger';

export interface NotionReceipt {
  id: string;
  notion_page_id: string;
  notion_receipt_id: string;
  lot_notion_id: string | null;
  lot_number: string;
  receipt_number: number | null;
  amount: number;
  date: string | null;
  receipt_type: 'cuota' | 'inicial' | 'refuerzo' | 'otro' | 'desistido';
  concept: string | null;
  payment_method: string | null;
  reference: string | null;
  file_url: string | null;
  client_name: string | null;
  created_at: string;
  is_desistido: boolean;
}

const parseNumber = (val: any): number | null => {
  if (val === null || val === undefined) return null;
  // Si ya es un número, retornarlo directamente
  if (typeof val === 'number') return val;
  // Si es string, limpiar y parsear
  const cleaned = String(val).replace(/[^0-9.-]/g, '').replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

const getPropValue = (props: any, name: string): any => {
  const prop = props[name];
  if (!prop) return null;
  
  switch (prop.type) {
    case 'title': return prop.title?.map((t: any) => t.plain_text).join('') || '';
    case 'rich_text': return prop.rich_text?.map((t: any) => t.plain_text).join('') || '';
    case 'number': return prop.number ?? null;
    case 'select': return prop.select?.name || null;
    case 'multi_select': return prop.multi_select?.map((s: any) => s.name) || [];
    case 'date': return prop.date?.start || null;
    case 'checkbox': return prop.checkbox ?? false;
    case 'files': return prop.files?.map((f: any) => f.file?.url || f.external?.url).filter(Boolean) || [];
    case 'relation': return prop.relation?.map((r: any) => r.id) || [];
    case 'formula': return prop.formula?.string || prop.formula?.number || prop.formula?.boolean || null;
    case 'rollup':
      if (prop.rollup?.type === 'number') return prop.rollup.number;
      if (prop.rollup?.type === 'array') return prop.rollup.array?.map((a: any) => {
        if (a.type === 'title') return a.title?.[0]?.plain_text;
        return a.number || a.string || null;
      });
      return null;
    default: return null;
  }
};

// Buscar propiedad por nombre parcial (case insensitive)
const findPropByKeywords = (props: any, keywords: string[]): any => {
  const keys = Object.keys(props);
  for (const keyword of keywords) {
    const found = keys.find(k => k.toLowerCase().includes(keyword.toLowerCase()));
    if (found) {
      return getPropValue(props, found);
    }
  }
  return null;
};

function parseReceiptTitle(title: string): { lotNumber: string | null; receiptNumber: number | null } {
  if (!title) return { lotNumber: null, receiptNumber: null };
  
  // Formato: "Recibo 17-01" o "Recibo 17 - 01" o "17-01"
  const match = title.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (match) {
    return { lotNumber: match[1].padStart(2, '0'), receiptNumber: parseInt(match[2], 10) };
  }
  
  // Formato alternativo: "Recibo 17"
  const singleMatch = title.match(/(?:Recibo\s+)?(\d+)/i);
  if (singleMatch) {
    return { lotNumber: singleMatch[1].padStart(2, '0'), receiptNumber: null };
  }
  
  return { lotNumber: null, receiptNumber: null };
}

export function mapNotionPageToReceipt(page: any): NotionReceipt {
  const props = page.properties || {};
  const get = (name: string) => getPropValue(props, name);
  
  // Debug: mostrar campos disponibles
  const availableFields = Object.keys(props).map(k => `${k}(${props[k]?.type})`).join(', ');
  logger.debug(`[Notion Receipt] Processing page. Available fields: ${availableFields}`);

  const titleProp = Object.values(props).find((p: any) => p.type === 'title') as any;
  const receiptTitle = titleProp?.title?.[0]?.plain_text || `Recibo-${page.id.substring(0, 8)}`;
  
  const { lotNumber: parsedLotNumber, receiptNumber } = parseReceiptTitle(receiptTitle);
  
  // Buscar relación en "Lotes y Cuotas" primero, luego otros campos
  const loteRelationIds = get('Lotes y Cuotas') || get('Lotes') || get('Lote') || get('Cliente') || [];
  const lotNotionId = Array.isArray(loteRelationIds) && loteRelationIds.length > 0 ? loteRelationIds[0] : null;
  
  // Buscar monto con múltiples estrategias
  let montoRaw = get('Monto');
  if (montoRaw === null) montoRaw = get('Valor');
  if (montoRaw === null) montoRaw = get('Cantidad');
  if (montoRaw === null) montoRaw = get('Pago');
  if (montoRaw === null) montoRaw = findPropByKeywords(props, ['monto', 'valor', 'cantidad', 'pago', 'amount', 'price', 'precio']);
  
  logger.debug(`[Notion Receipt] Raw monto value: ${montoRaw} (type: ${typeof montoRaw})`);
  const monto = parseNumber(montoRaw);
  logger.debug(`[Notion Receipt] Parsed monto: ${monto}`);
  
  // Buscar fecha
  let fechaRaw = get('Fecha');
  if (fechaRaw === null) fechaRaw = get('Fecha de pago');
  if (fechaRaw === null) fechaRaw = get('Fecha Pago');
  if (fechaRaw === null) fechaRaw = findPropByKeywords(props, ['fecha', 'date', 'pago', 'payment']);
  const fecha = fechaRaw;
  
  const tipoStr = (get('Tipo') || get('Tipo de pago') || get('Categoría') || get('Categoria') || 'otro').toLowerCase();
  
  // Detectar si es desistido por el número de lote (ej: 17) o título
  const isDesistido = receiptTitle.toLowerCase().includes('desistid') || 
                       (parsedLotNumber === '17');
  
  let receiptType: 'cuota' | 'inicial' | 'refuerzo' | 'otro' | 'desistido' = 'otro';
  
  if (isDesistido) {
    receiptType = 'desistido';
  } else if (tipoStr.includes('cuota') || tipoStr.includes('mensual')) {
    receiptType = 'cuota';
  } else if (tipoStr.includes('inicial') || tipoStr.includes('reserva') || tipoStr.includes('entrada') || tipoStr.includes('promesa')) {
    receiptType = 'inicial';
  } else if (tipoStr.includes('refuerzo') || tipoStr.includes('extra') || tipoStr.includes('abono')) {
    receiptType = 'refuerzo';
  }
  
  const concepto = get('Concepto') || get('Descripción') || get('Descripcion') || get('Notas');
  const mesCuota = get('Mes') || get('Mes de cuota') || get('Periodo');
  const conceptoFinal = concepto ? String(concepto) : (mesCuota ? `Cuota ${mesCuota}` : null);
  
  const metodoPago = get('Método') || get('Metodo') || get('Método de pago') || get('Forma de pago');
  const referencia = get('Referencia') || get('Ref') || get('Número de comprobante') || get('Comprobante');
  const archivos = get('Archivo') || get('Comprobante') || get('PDF') || get('Recibo') || get('Adjunto');
  const cliente = get('Cliente') || get('Nombre') || get('Pagador') || get('Cliente Nombre');

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    notion_page_id: page.id,
    notion_receipt_id: page.id,
    lot_notion_id: lotNotionId,
    lot_number: parsedLotNumber || '',
    receipt_number: receiptNumber,
    amount: monto || 0,
    date: fecha,
    receipt_type: receiptType,
    concept: conceptoFinal,
    payment_method: metodoPago ? String(metodoPago) : null,
    reference: referencia ? String(referencia) : null,
    file_url: Array.isArray(archivos) ? archivos[0] : (archivos || null),
    client_name: cliente ? String(cliente) : null,
    created_at: new Date().toISOString(),
    is_desistido: isDesistido,
  };
}

export async function syncNotionReceipts(databaseId: string, projectId: string): Promise<{
  success: boolean;
  receipts: NotionReceipt[];
  errors: string[];
}> {
  const errors: string[] = [];
  const receipts: NotionReceipt[] = [];
  
  try {
    let resolvedDbId = databaseId;
    try {
      const resolved = await resolveNotionId(databaseId);
      if (resolved.type === 'page' && resolved.databases && resolved.databases.length > 0) {
        resolvedDbId = resolved.databases[0].id;
      } else if (resolved.type === 'database') {
        resolvedDbId = resolved.id;
      }
    } catch (e) {}
    
    logger.debug(`[Notion Receipts] Querying database: ${resolvedDbId}`);
    const pages = await queryDatabase(resolvedDbId);
    logger.debug(`[Notion Receipts] Found ${pages.length} pages`);
    
    for (const page of pages) {
      try {
        const receipt = mapNotionPageToReceipt(page);
        receipts.push(receipt);
      } catch (err: any) {
        errors.push(`Error procesando recibo ${page.id}: ${err.message}`);
      }
    }
    
    return { success: true, receipts, errors };
  } catch (err: any) {
    logger.error('[Notion Receipts] Error:', err);
    return { success: false, receipts: [], errors: [err.message] };
  }
}