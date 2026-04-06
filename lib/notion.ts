/**
 * BLIS Corp — Notion Integration
 * Sincroniza lotes de Notion con la base de datos de Supabase
 */
import { createClient } from '@supabase/supabase-js';
import { parseFormaDePago } from './parse-forma-pago';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getNotionToken(): Promise<string> {
  const { data } = await supabase.from('api_keys').select('key_name, key_value');
  const keys: Record<string, string> = {};
  data?.forEach((k: any) => { keys[k.key_name] = k.key_value || ''; });
  return keys.notion_token || keys.notion_api_key || '';
}

// ── Llamada base a la API de Notion ──────────────────────────────────────────
export async function notionFetch(path: string, options: RequestInit = {}) {
  const token = await getNotionToken();
  if (!token) throw new Error('Token de Notion no configurado. Ve a Configuración → API Keys y agrega notion_token.');

  const res = await fetch(`https://api.notion.com/v1${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(`Notion API ${res.status}: ${err.message || JSON.stringify(err)}`);
  }

  return res.json();
}

// ── Obtener bases de datos dentro de una página ───────────────────────────────
export async function getDatabasesFromPage(pageId: string): Promise<{ id: string; title: string }[]> {
  try {
    const data = await notionFetch(`/blocks/${pageId}/children?page_size=100`);
    const databases: { id: string; title: string }[] = [];
    
    for (const block of data.results || []) {
      if (block.type === 'child_database') {
        const dbInfo = await notionFetch(`/databases/${block.id}`);
        const title = dbInfo.title?.[0]?.plain_text || dbInfo.title?.[0]?.text?.content || 'Sin título';
        databases.push({ id: block.id, title });
      }
    }
    
    return databases;
  } catch (err) {
    console.error('Error getting databases from page:', err);
    return [];
  }
}

// ── Detectar si es página o base de datos y obtener el ID correcto ────────────
export async function resolveNotionId(inputId: string): Promise<{ type: 'database' | 'page'; id: string; databases?: { id: string; title: string }[] }> {
  const cleanId = inputId.replace(/-/g, '');
  const formattedId = `${cleanId.slice(0,8)}-${cleanId.slice(8,12)}-${cleanId.slice(12,16)}-${cleanId.slice(16,20)}-${cleanId.slice(20)}`;
  
  // Primero intentar como database
  try {
    const dbInfo = await notionFetch(`/databases/${formattedId}`);
    return { type: 'database', id: formattedId };
  } catch (dbErr: any) {
    // Si falla, intentar como página
    try {
      const pageInfo = await notionFetch(`/pages/${formattedId}`);
      // Es una página, buscar bases de datos dentro
      const databases = await getDatabasesFromPage(formattedId);
      return { type: 'page', id: formattedId, databases };
    } catch (pageErr: any) {
      throw new Error(`No se pudo encontrar ni base de datos ni página con el ID proporcionado`);
    }
  }
}

// ── Obtener todas las páginas de una database ─────────────────────────────────
export async function queryDatabase(databaseId: string, filter?: any): Promise<any[]> {
  const pages: any[] = [];
  let cursor: string | undefined;

  do {
    const body: any = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    if (filter) body.filter = filter;

    const data = await notionFetch(`/databases/${databaseId}/query`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    pages.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return pages;
}

// ── Obtener propiedades de una database ───────────────────────────────────────
export async function getDatabaseSchema(databaseId: string) {
  return notionFetch(`/databases/${databaseId}`);
}

// ── Extraer valor de una propiedad de Notion ──────────────────────────────────
export function extractPropValue(prop: any): any {
  if (!prop) return null;

  switch (prop.type) {
    case 'title':
      return prop.title?.map((t: any) => t.plain_text).join('') || '';
    case 'rich_text':
      return prop.rich_text?.map((t: any) => t.plain_text).join('') || '';
    case 'number':
      return prop.number ?? null;
    case 'select':
      return prop.select?.name || null;
    case 'multi_select':
      return prop.multi_select?.map((s: any) => s.name) || [];
    case 'date':
      return prop.date?.start || null;
    case 'checkbox':
      return prop.checkbox ?? false;
    case 'email':
      return prop.email || null;
    case 'phone_number':
      return prop.phone_number || null;
    case 'url':
      return prop.url || null;
    case 'files':
      return prop.files?.[0]?.file?.url || prop.files?.[0]?.external?.url || null;
    case 'relation':
      return prop.relation?.map((r: any) => r.id) || [];
    case 'formula':
      return prop.formula?.string || prop.formula?.number || prop.formula?.boolean || null;
    case 'rollup':
      if (prop.rollup?.type === 'number') return prop.rollup.number;
      if (prop.rollup?.type === 'array') return prop.rollup.array?.map((a: any) => extractPropValue(a));
      return null;
    case 'status':
      return prop.status?.name || null;
    case 'people':
      return prop.people?.map((p: any) => p.name || p.id).join(', ') || null;
    case 'created_time':
      return prop.created_time || null;
    case 'last_edited_time':
      return prop.last_edited_time || null;
    default:
      return null;
  }
}

// ── Mapear una página de Notion a un lote de Supabase ────────────────────────
export function mapNotionPageToLot(page: any, projectId: string): Partial<LotRecord> {
  const props = page.properties || {};
  const get = (name: string) => extractPropValue(props[name]);
  
  const parseNumber = (val: any): number | null => {
    if (val === null || val === undefined) return null;
    const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? null : num;
  };

  // ── Número de lote (siempre es el título) ───────────────────────────────────
  const titleProp = Object.values(props).find((p: any) => p.type === 'title') as any;
  const lotNumber = extractPropValue(titleProp) || `Lote-${page.id.substring(0, 6)}`;

  // ── Cliente — NOMBRE EN MAYÚSCULAS SIEMPRE ───────────────────────────────────
  const cliente = get('Cliente') || get(findPropByKeywords(props, ['cliente', 'client', 'comprador', 'nombre cliente']) || '');
  const clienteStr = cliente ? String(cliente).trim().toUpperCase() : '';
  
  // Estado basado en cliente
  let estado = clienteStr.length > 0 ? 'Vendido' : 'Disponible';
  
  // ── Identificación / Cédula ───────────────────────────────────────────────────
  const identificacion = get('Identificación') || get('Cédula') || get('Cedula') || get('DNI') || get('Documento') || get('RUC') || null;
  
  // ── Contacto ─────────────────────────────────────────────────────────────────
  const celular = get('Celular') || get(findPropByKeywords(props, ['celular', 'telefono', 'teléfono', 'phone']) || '');
  const email = get('Correo') || get('Email') || get(findPropByKeywords(props, ['correo', 'email', 'mail']) || '');
  const contactoEmergencia = get('Contacto de emergencia') || get('Contacto Emergencia') || get('Contacto de Emergencia');
  
  // ── Asesor ───────────────────────────────────────────────────────────────────
  const asesorVal = get('Asesor') || get(findPropByKeywords(props, ['asesor', 'agente', 'vendedor']) || '');
  const asesor = Array.isArray(asesorVal) ? asesorVal.join(', ') : asesorVal;
  
  // ── Precios ──────────────────────────────────────────────────────────────────
  const precioTotalReferencial = parseNumber(get('Precio total referencial') || get('Precio Total Referencial'));
  const precioVentaFinal = parseNumber(get('Precio de venta') || get('Precio de Venta') || get('Precio Final'));
  const precioContadoM2 = parseNumber(get('Precio contado m2') || get('Precio contado'));
  const precioCuotasM2 = parseNumber(get('Precio cuotas m2') || get('Precio cuotas'));
  
  // ── Metraje ──────────────────────────────────────────────────────────────────
  const metraje = parseNumber(get('Metraje') || get(findPropByKeywords(props, ['metraje', 'area', 'área', 'm2']) || ''));
  
// ── Cuotas y Forma de Pago ───────────────────────────────────────────────────
  const montoCuota = parseNumber(get('Monto de cuota') || get('Monto cuota') || get('Cuota mensual'));
  const formaPago = get('Forma de pago') || get('Forma de Pago') || null;
  const diaPago = get('Día de pago') || get('Dia de pago');
  const cuotasCantidad = parseNumber(get('Cuotas') || get('Número de cuotas') || get('Cantidad de cuotas'));
  
  // ── Fechas ───────────────────────────────────────────────────────────────────
  const fechaVenta = get('Fecha de venta') || get('Fecha Venta') || get('Fecha de Venta');
  const fechaInicial2 = get('Fecha de la inicial 2') || get('Fecha inicial 2');
  
  // ── Otros datos ──────────────────────────────────────────────────────────────
  const contratoPdf = get('Contrato') || get('Contrato PDF') || get('PDF Contrato');
  const observaciones = get('Observaciones') || get('Notas') || get('Notas especiales') || null;
  
  // ── Calcular pagos iniciales desde Forma de Pago ─────────────────────────────
  const initialPayments: any[] = [];
  
  // Parsear "Forma de Pago" con el parser avanzado
  const formaPagoInfo = parseFormaDePago(formaPago ? String(formaPago) : '');
  
  // Si se encontraron iniciales en el texto, usarlos
  if (formaPagoInfo.iniciales.length > 0) {
    formaPagoInfo.iniciales.forEach((inicial) => {
      // Si es un porcentaje, calcular con el precio
      let expected = inicial.monto;
      if (expected === 0 && inicial.descripcion.includes('%') && precioVentaFinal) {
        const porcentaje = parseFloat(inicial.descripcion.match(/\d+/)?.[0] || '0');
        expected = (precioVentaFinal * porcentaje) / 100;
      }
      
      initialPayments.push({
        id: crypto.randomUUID(),
        description: inicial.descripcion,
        expected: expected,
        actual: 0,
        payment_date: inicial.fecha || null,
        receipt_attached: null
      });
    });
  }
  
  // Si no se encontró nada, usar valores por defecto
  if (initialPayments.length === 0) {
    const inicial = parseNumber(get('Inicial') || get('Inicial referencial') || 0);
    initialPayments.push({
      id: crypto.randomUUID(),
      description: 'Entrada Inicial',
      expected: inicial,
      actual: 0,
      payment_date: null,
      receipt_attached: null
    });
  }
  
  // Agregar inicial 2 si existe en los campos de Notion
  const inicial2 = parseNumber(get('Inicial 2') || get('Inicial Referencial 2'));
  if (inicial2 && inicial2 > 0) {
    initialPayments.push({
      id: crypto.randomUUID(),
      description: 'Inicial 2',
      expected: inicial2,
      actual: 0,
      payment_date: null,
      receipt_attached: null
    });
  }

  // ── Construir objeto de owners ───────────────────────────────────────────────
  const owners = [{
    id: crypto.randomUUID(),
    name: clienteStr || 'No especificado',
    documentId: identificacion ? String(identificacion).toUpperCase() : '',
    email: email ? String(email).toLowerCase() : '',
    phoneCode: '+593',
    phone: celular ? String(celular).replace(/[^0-9]/g, '') : ''
  }];

  // ── Estado: verificar si hay estado explícito en Notion ─────────────────────
  const estadoNotion = get('Estado') || get('Status') || get('Estado del lote') || null;
  if (estadoNotion) {
    const estadoLower = String(estadoNotion).toLowerCase();
    if (estadoLower.includes('vendido') || estadoLower.includes('vend') || estadoLower.includes('sold')) {
      estado = 'Vendido';
    } else if (estadoLower.includes('reservado') || estadoLower.includes('reserv') || estadoLower.includes('reserved')) {
      estado = 'Reservado';
    } else if (estadoLower.includes('disponible') || estadoLower.includes('avail') || estadoLower.includes('libre')) {
      estado = 'Disponible';
    } else if (estadoLower.includes('desistido') || estadoLower.includes('cancelado')) {
      estado = 'Desistido';
    }
  }

  return {
    project_id: projectId,
    lot_number: lotNumber,
    client_name: clienteStr || null,
    status: estado,
    total_price: precioVentaFinal || precioTotalReferencial,
    lot_area: metraje,
    expected_quota: montoCuota,
    owners: owners,
    notion_page_id: page.id,
    notion_last_sync: new Date().toISOString(),
    initial_payments: initialPayments,
    alternate_contact: contactoEmergencia ? {
      name: String(contactoEmergencia).split(/[,\s]/)[0] || '',
      phone: String(contactoEmergencia).replace(/[^0-9]/g, '').slice(-10) || '',
      phone_code: '+593'
    } : { name: '', phone: '', phone_code: '+593' },
    extra_data: {
      // Datos del cliente
      celular: celular ? String(celular) : null,
      email: email ? String(email) : null,
      identificacion: identificacion ? String(identificacion).toUpperCase() : null,
      contacto_emergencia: contactoEmergencia ? String(contactoEmergencia) : null,
      contrato_pdf: contratoPdf,
      
      // Asesor
      asesor: asesor ? String(asesor) : null,
      
      // Precios
      precio_total_referencial: precioTotalReferencial,
      precio_venta_final: precioVentaFinal,
      precio_contado_m2: precioContadoM2,
      precio_cuotas_m2: precioCuotasM2,
      
      // Cuotas y forma de pago
      forma_pago: formaPago ? String(formaPago) : null,
      dia_pago: diaPago || null,
      
      // Observaciones
      observaciones: observaciones,
      
      // Fechas
      fecha_venta: fechaVenta,
      fecha_inicial_2: fechaInicial2,
      
      notion_url: page.url || page.public_url,
    },
  };
}

function findPropByKeywords(props: any, keywords: string[]): string | null {
  const keys = Object.keys(props);
  for (const kw of keywords) {
    const found = keys.find(k => k.toLowerCase().includes(kw.toLowerCase()));
    if (found) return found;
  }
  return null;
}

function normalizeStatus(status: string | null): string {
  if (!status) return 'Disponible';
  const s = status.toLowerCase();
  if (s.includes('vend') || s.includes('sold') || s.includes('compra')) return 'Vendido';
  if (s.includes('reserv')) return 'Reservado';
  if (s.includes('desist') || s.includes('cancel')) return 'Desistido';
  if (s.includes('dispon') || s.includes('avail') || s.includes('libre')) return 'Disponible';
  return status;
}

export interface LotRecord {
  id?: string;
  project_id: string;
  lot_number: string;
  client_name: string | null;
  status: string;
  total_price: number | null;
  lot_area: number | null;
  expected_quota?: number | null;
  owners?: any[];
  initial_payments?: any[];
  alternate_contact?: any;
  notion_page_id: string;
  notion_last_sync: string;
  extra_data?: Record<string, any>;
}
