// Types ────────────────────────────────────────────────────────────────────────
export interface NotionRichTextItem {
  plain_text: string;
  text?: { content: string };
}

export interface NotionSelectProperty {
  name: string;
}

export interface NotionMultiSelectProperty {
  name: string;
}

export interface NotionRelationProperty {
  id: string;
}

export interface NotionPeopleProperty {
  name?: string;
  id: string;
}

export interface NotionFileProperty {
  file?: { url: string };
  external?: { url: string };
}

export interface NotionRollupArrayItem {
  type: string;
  title?: NotionRichTextItem[];
  number?: number;
  string?: string;
}

export interface NotionPropertyValue {
  type: string;
  title?: NotionRichTextItem[];
  rich_text?: NotionRichTextItem[];
  number?: number | null;
  select?: NotionSelectProperty | null;
  multi_select?: NotionMultiSelectProperty[];
  date?: { start: string } | null;
  checkbox?: boolean;
  email?: string | null;
  phone_number?: string | null;
  url?: string | null;
  files?: NotionFileProperty[];
  relation?: NotionRelationProperty[];
  formula?: { string?: string; number?: number; boolean?: boolean };
  rollup?: { type: string; number?: number; array?: NotionRollupArrayItem[] };
  status?: NotionSelectProperty | null;
  people?: NotionPeopleProperty[];
  created_time?: string;
  last_edited_time?: string;
}

export interface NotionPageProperties {
  [key: string]: NotionPropertyValue;
}

export interface NotionPage {
  id: string;
  url?: string;
  public_url?: string;
  properties: NotionPageProperties;
}

export interface NotionBlock {
  id: string;
  type: string;
}

export interface NotionDatabaseInfo {
  title?: NotionRichTextItem[];
}

export interface NotionQueryBody {
  page_size: number;
  start_cursor?: string;
  filter?: Record<string, unknown>;
}

export interface NotionQueryResponse {
  results: NotionPage[];
  has_more: boolean;
  next_cursor?: string;
}

export interface NotionAPIKeyRow {
  key_name: string;
  key_value: string | null;
}

export interface Owner {
  id: string;
  name: string;
  documentId: string;
  email: string;
  phoneCode: string;
  phone: string;
}

export interface AlternateContact {
  name: string;
  phone: string;
  phone_code: string;
}

export interface InitialPayment {
  id: string;
  description: string;
  expected: number;
  actual: number;
  payment_date: string | null;
  receipt_attached: string | null;
}

export interface LotExtraData {
  celular: string | null;
  email: string | null;
  identificacion: string | null;
  contacto_emergencia: string | null;
  contrato_pdf: string | null;
  asesor: string | null;
  precio_total_referencial: number | null;
  precio_venta_final: number | null;
  precio_contado_m2: number | null;
  precio_cuotas_m2: number | null;
  forma_pago: string | null;
  dia_pago: string | null;
  observaciones: string | null;
  fecha_venta: string | null;
  fecha_inicial_2: string | null;
  notion_url: string | undefined;
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
  owners?: Owner[];
  initial_payments?: InitialPayment[];
  alternate_contact?: AlternateContact;
  notion_page_id: string;
  notion_last_sync: string;
  extra_data?: LotExtraData;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Implementation
// ═══════════════════════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';
import { createClient as createSupabaseClient } from './supabase/server';
import { getApiKey } from './api-keys';
import { parseFormaDePago } from './parse-forma-pago';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getNotionToken(userId?: string, empresaId?: string): Promise<string> {
  if (userId && empresaId) {
    const supabaseClient = createSupabaseClient();
    const token = await getApiKey(supabaseClient, 'notion_api_key', userId, empresaId);
    if (token) return token;
    const token2 = await getApiKey(supabaseClient, 'notion_token', userId, empresaId);
    if (token2) return token2;
    return '';
  }

  const { data } = await supabase.from('api_keys').select('key_name, key_value');
  const keys: Record<string, string> = {};
  data?.forEach((k: NotionAPIKeyRow) => { keys[k.key_name] = k.key_value || ''; });
  return keys.notion_token || keys.notion_api_key || '';
}

export async function notionFetch(path: string, options: RequestInit = {}, userId?: string, empresaId?: string) {
  const token = await getNotionToken(userId, empresaId);
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

export async function getDatabasesFromPage(pageId: string): Promise<{ id: string; title: string }[]> {
  try {
    const data = await notionFetch(`/blocks/${pageId}/children?page_size=100`);
    const databases: { id: string; title: string }[] = [];

    for (const block of (data.results || []) as NotionBlock[]) {
      if (block.type === 'child_database') {
        const dbInfo = await notionFetch(`/databases/${block.id}`) as NotionDatabaseInfo;
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

export async function resolveNotionId(inputId: string): Promise<{ type: 'database' | 'page'; id: string; databases?: { id: string; title: string }[] }> {
  const cleanId = inputId.replace(/-/g, '');
  const formattedId = `${cleanId.slice(0,8)}-${cleanId.slice(8,12)}-${cleanId.slice(12,16)}-${cleanId.slice(16,20)}-${cleanId.slice(20)}`;

  try {
    await notionFetch(`/databases/${formattedId}`);
    return { type: 'database', id: formattedId };
  } catch (_dbErr) {
    try {
      await notionFetch(`/pages/${formattedId}`);
      const databases = await getDatabasesFromPage(formattedId);
      return { type: 'page', id: formattedId, databases };
    } catch (_pageErr) {
      throw new Error(`No se pudo encontrar ni base de datos ni página con el ID proporcionado`);
    }
  }
}

export async function queryDatabase(databaseId: string, filter?: Record<string, unknown>): Promise<NotionPage[]> {
  const pages: NotionPage[] = [];
  let cursor: string | undefined;

  do {
    const body: NotionQueryBody = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    if (filter) body.filter = filter;

    const data = await notionFetch(`/databases/${databaseId}/query`, {
      method: 'POST',
      body: JSON.stringify(body),
    }) as NotionQueryResponse;

    pages.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return pages;
}

export async function getDatabaseSchema(databaseId: string) {
  return notionFetch(`/databases/${databaseId}`);
}

export function extractPropValue(prop: NotionPropertyValue): unknown {
  if (!prop) return null;

  switch (prop.type) {
    case 'title':
      return prop.title?.map((t: NotionRichTextItem) => t.plain_text).join('') || '';
    case 'rich_text':
      return prop.rich_text?.map((t: NotionRichTextItem) => t.plain_text).join('') || '';
    case 'number':
      return prop.number ?? null;
    case 'select':
      return prop.select?.name || null;
    case 'multi_select':
      return prop.multi_select?.map((s: NotionMultiSelectProperty) => s.name) || [];
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
      return prop.relation?.map((r: NotionRelationProperty) => r.id) || [];
    case 'formula':
      return prop.formula?.string || prop.formula?.number || prop.formula?.boolean || null;
    case 'rollup':
      if (prop.rollup?.type === 'number') return prop.rollup.number;
      if (prop.rollup?.type === 'array') return prop.rollup.array?.map((a: NotionRollupArrayItem) => extractPropValue(a as NotionPropertyValue));
      return null;
    case 'status':
      return prop.status?.name || null;
    case 'people':
      return prop.people?.map((p: NotionPeopleProperty) => p.name || p.id).join(', ') || null;
    case 'created_time':
      return prop.created_time || null;
    case 'last_edited_time':
      return prop.last_edited_time || null;
    default:
      return null;
  }
}

export function mapNotionPageToLot(page: NotionPage, projectId: string): Partial<LotRecord> {
  const props = page.properties || {};
  const get = (name: string) => extractPropValue(props[name]);

  const parseNumber = (val: unknown): number | null => {
    if (val === null || val === undefined) return null;
    const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? null : num;
  };

  const titleProp = Object.values(props).find((p: NotionPropertyValue) => p.type === 'title') as NotionPropertyValue | undefined;
  const lotNumber = extractPropValue(titleProp as NotionPropertyValue) || `Lote-${page.id.substring(0, 6)}`;

  const cliente = get('Cliente') || get(findPropByKeywords(props, ['cliente', 'client', 'comprador', 'nombre cliente']) || '');
  const clienteStr = cliente ? String(cliente).trim().toUpperCase() : '';

  let estado = clienteStr.length > 0 ? 'Vendido' : 'Disponible';

  const identificacion = get('Identificación') || get('Cédula') || get('Cedula') || get('DNI') || get('Documento') || get('RUC') || null;

  const celular = get('Celular') || get(findPropByKeywords(props, ['celular', 'telefono', 'teléfono', 'phone']) || '');
  const email = get('Correo') || get('Email') || get(findPropByKeywords(props, ['correo', 'email', 'mail']) || '');
  const contactoEmergencia = get('Contacto de emergencia') || get('Contacto Emergencia') || get('Contacto de Emergencia');

  const asesorVal = get('Asesor') || get(findPropByKeywords(props, ['asesor', 'agente', 'vendedor']) || '');
  const asesor = Array.isArray(asesorVal) ? asesorVal.join(', ') : asesorVal;

  const precioTotalReferencial = parseNumber(get('Precio total referencial') || get('Precio Total Referencial'));
  const precioVentaFinal = parseNumber(get('Precio de venta') || get('Precio de Venta') || get('Precio Final'));
  const precioContadoM2 = parseNumber(get('Precio contado m2') || get('Precio contado'));
  const precioCuotasM2 = parseNumber(get('Precio cuotas m2') || get('Precio cuotas'));

  const metraje = parseNumber(get('Metraje') || get(findPropByKeywords(props, ['metraje', 'area', 'área', 'm2']) || ''));

  const montoCuota = parseNumber(get('Monto de cuota') || get('Monto cuota') || get('Cuota mensual'));
  const formaPago = get('Forma de pago') || get('Forma de Pago') || null;
  const diaPago = get('Día de pago') || get('Dia de pago');
  const cuotasCantidad = parseNumber(get('Cuotas') || get('Número de cuotas') || get('Cantidad de cuotas'));

  const fechaVenta = get('Fecha de venta') || get('Fecha Venta') || get('Fecha de Venta');
  const fechaInicial2 = get('Fecha de la inicial 2') || get('Fecha inicial 2');

  const contratoPdf = get('Contrato') || get('Contrato PDF') || get('PDF Contrato');
  const observaciones = get('Observaciones') || get('Notas') || get('Notas especiales') || null;

  const initialPayments: InitialPayment[] = [];

  const formaPagoInfo = parseFormaDePago(formaPago ? String(formaPago) : '');

  if (formaPagoInfo.iniciales.length > 0) {
    formaPagoInfo.iniciales.forEach((inicial) => {
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

  if (initialPayments.length === 0) {
    const inicial = parseNumber(get('Inicial') || get('Inicial referencial') || 0);
    initialPayments.push({
      id: crypto.randomUUID(),
      description: 'Entrada Inicial',
      expected: inicial ?? 0,
      actual: 0,
      payment_date: null,
      receipt_attached: null
    });
  }

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

  const owners: Owner[] = [{
    id: crypto.randomUUID(),
    name: clienteStr || 'No especificado',
    documentId: identificacion ? String(identificacion).toUpperCase() : '',
    email: email ? String(email).toLowerCase() : '',
    phoneCode: '+593',
    phone: celular ? String(celular).replace(/[^0-9]/g, '') : ''
  }];

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
    lot_number: String(lotNumber),
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
      celular: celular ? String(celular) : null,
      email: email ? String(email) : null,
      identificacion: identificacion ? String(identificacion).toUpperCase() : null,
      contacto_emergencia: contactoEmergencia ? String(contactoEmergencia) : null,
      contrato_pdf: contratoPdf ? String(contratoPdf) : null,
      asesor: asesor ? String(asesor) : null,
      precio_total_referencial: precioTotalReferencial,
      precio_venta_final: precioVentaFinal,
      precio_contado_m2: precioContadoM2,
      precio_cuotas_m2: precioCuotasM2,
      forma_pago: formaPago ? String(formaPago) : null,
      dia_pago: diaPago ? String(diaPago) : null,
      observaciones: observaciones ? String(observaciones) : null,
      fecha_venta: fechaVenta ? String(fechaVenta) : null,
      fecha_inicial_2: fechaInicial2 ? String(fechaInicial2) : null,
      notion_url: page.url || page.public_url,
    },
  };
}

function findPropByKeywords(props: NotionPageProperties, keywords: string[]): string | null {
  const keys = Object.keys(props);
  for (const kw of keywords) {
    const found = keys.find(k => k.toLowerCase().includes(kw.toLowerCase()));
    if (found) return found;
  }
  return null;
}
