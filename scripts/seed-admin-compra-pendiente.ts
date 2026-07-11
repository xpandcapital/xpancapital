/**
 * Seed: Actualiza la plantilla admin_nueva_compra_revisar
 * con los botones de link mágico (aprobar/rechazar compra sin login)
 *
 * Uso: npx tsx scripts/seed-admin-compra-pendiente.ts
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae';
const LOGO_URL = 'https://srjhrhiesienkofisvnv.supabase.co/storage/v1/object/public/cms/email-media/6186f014-c8c7-4027-9f08-8acf2bae3eae/1779111044315-yyaszr.png';
const getUniqueId = (type: string) => `${type}-evt-${Date.now()}-${Math.floor(Math.random() * 99999)}`;

function hdrDark(lw = 600) {
  return { id: getUniqueId('header'), type: 'header', content: { logoUrl: LOGO_URL, bgColor: '#0a0a0a', padding: 0, align: 'center', logoWidth: lw } };
}
function spac(h = 0) {
  return { id: getUniqueId('spacer'), type: 'spacer', content: { height: h, bgColor: 'transparent' } };
}
function txtDark(texto: string, opts: any = {}) {
  return { id: getUniqueId('text'), type: 'text', content: { text: texto, textColor: opts.textColor || '#e5e7eb', fontSize: opts.fontSize || 15, fontWeight: opts.fontWeight || 'normal', align: opts.align || 'left', bgColor: 'transparent', padding: opts.padding ?? 24, paddingTop: opts.paddingTop ?? null, paddingRight: opts.paddingRight ?? null, paddingBottom: opts.paddingBottom ?? null, paddingLeft: opts.paddingLeft ?? null, lineHeight: 1.7, fontFamily: 'Verdana, Geneva, sans-serif' } };
}
function btn(texto: string, url: string, opts: any = {}) {
  return { id: getUniqueId('button'), type: 'button', content: { text: texto, url, buttonBgColor: opts.bg || '#e11d48', containerBgColor: 'transparent', textColor: '#ffffff', align: 'center', paddingY: opts.paddingY || 14, paddingX: opts.paddingX || 32, borderRadius: 8, fontSize: opts.fontSize || 16, fontWeight: 'bold', fontFamily: 'Verdana, Geneva, sans-serif', width: 'auto', borderStyle: 'none', borderWidth: 0, borderColor: opts.bg || '#e11d48', padding: opts.containerPadding ?? 0 } };
}
function div(color = '#1f1f1f', h = 1) {
  return { id: getUniqueId('divider'), type: 'divider', content: { color, height: h, borderStyle: 'solid', bgColor: 'transparent', padding: 0 } };
}
function ftrDark() {
  return { id: getUniqueId('footer'), type: 'footer', content: { text: '© 2026 Xpand Capital. Todos los derechos reservados.', bgColor: 'transparent', textColor: '#6b7280', padding: 0, fontSize: 11, fontFamily: 'Verdana, Geneva, sans-serif', align: 'center' } };
}
function receipt() {
  return { id: getUniqueId('receipt'), type: 'receipt', content: {
    items: [
      { nombre: '{{producto_1_nombre}}', categoria: '{{producto_1_categoria}}', precio: '{{producto_1_precio}}', imagen: '{{producto_1_imagen}}' },
      { nombre: '{{producto_2_nombre}}', categoria: '{{producto_2_categoria}}', precio: '{{producto_2_precio}}', imagen: '{{producto_2_imagen}}' },
      { nombre: '{{producto_3_nombre}}', categoria: '{{producto_3_categoria}}', precio: '{{producto_3_precio}}', imagen: '{{producto_3_imagen}}' }
    ],
    bgColor: '#0a0a0a', headerBg: '#141414', totalBg: '#0a1a0f', rowBg1: '#0f0f0f', rowBg2: '#0a0a0a',
    accentColor: '#4ade80',
    subtotalVar: '{{total_compra}}', descuentoVar: '', cuponVar: '', totalVar: '{{total_compra}}',
    metodoPagoVar: '{{metodo_pago_compra}}', fechaVar: '{{fecha_compra}}', showDiscount: false, padding: '16px 20px 20px'
  }};
}

const blocks = [
  hdrDark(600),
  spac(24),
  txtDark('Nueva Compra Pendiente', { fontSize: 24, fontWeight: 'bold', align: 'center', paddingTop: 0, paddingBottom: 4, textColor: '#ffffff' }),
  txtDark('Requiere tu aprobación para activarse.', { fontSize: 14, textColor: '#9ca3af', align: 'center', paddingTop: 0, paddingBottom: 16 }),
  txtDark('Comprador: {{nombre_comprador}} {{apellido_comprador}}\nEmail: {{email_comprador}}\nOrden: #{{comprobante_id}}', { fontSize: 13, textColor: '#e5e7eb', align: 'left', padding: 20 }),
  spac(4),
  receipt(),
  spac(8),
  txtDark('Total: {{moneda}} {{total_compra}}\nMétodo: {{metodo_pago_compra}}\nFecha: {{fecha_compra}}', { fontSize: 13, textColor: '#e5e7eb', align: 'left', padding: 20 }),
  spac(16),
  btn('Aprobar Compra', '{{enlace_aprobar_compra}}', { bg: '#16a34a', paddingX: 48, paddingY: 18, fontSize: 16 }),
  spac(6),
  btn('Rechazar Compra', '{{enlace_rechazar_compra}}', { bg: '#dc2626', paddingX: 48, paddingY: 18, fontSize: 16 }),
  spac(24),
  txtDark('Este enlace expira en 7 días.\nNo compartas este correo.', { fontSize: 11, textColor: '#6b7280', align: 'center', padding: 16 }),
  div('#1f1f1f', 1),
  spac(8),
  ftrDark(),
  spac(12),
];

const settings = {
  bodyBg: '#0a0a0a',
  containerBg: '#111111',
  width: 600,
  fontFamily: 'Verdana, Geneva, sans-serif',
  sectionGap: 0,
  activePaletteId: 'xpancapital-dark',
  palettes: [
    { id: 'xpancapital-dark', name: 'XpandCapital Oscuro', bodyBg: '#181818', containerBg: '#181818', text: '#e5e7eb', primary: '#e11d48' },
    { id: 'xpancapital-light', name: 'XpandCapital Claro', bodyBg: '#F3F4F6', containerBg: '#FFFFFF', text: '#333333', primary: '#e11d48' }
  ],
  subject: 'Compra pendiente: {{nombre_comprador}} — {{moneda}} {{total_compra}}',
  previewText: 'Orden #{{comprobante_id}} via {{metodo_pago_compra}}. Acción requerida.',
  evento: 'admin_nueva_compra_revisar',
};

async function main() {
  console.log('[Seed] Buscando plantilla existente para admin_nueva_compra_revisar...');

  const { data: existing } = await supabase
    .from('email_templates')
    .select('id, nombre')
    .eq('empresa_id', DEFAULT_EMPRESA_ID)
    .eq('evento', 'admin_nueva_compra_revisar')
    .maybeSingle();

  const payload = {
    empresa_id: DEFAULT_EMPRESA_ID,
    nombre: 'Nueva Compra a Revisar (Link Mágico)',
    descripcion: 'Notificación al admin con botones para aprobar o rechazar compras pendientes sin iniciar sesión.',
    evento: 'admin_nueva_compra_revisar',
    settings,
    blocks,
    actualizado_en: new Date().toISOString(),
  };

  if (existing) {
    console.log(`[Seed] Actualizando plantilla existente: ${existing.nombre} (${existing.id})`);
    const { error } = await supabase
      .from('email_templates')
      .update(payload)
      .eq('id', existing.id);

    if (error) {
      console.error('[Seed] Error actualizando:', error);
    } else {
      console.log('[Seed] Plantilla actualizada exitosamente.');
    }
  } else {
    console.log('[Seed] Creando nueva plantilla...');
    const { error } = await supabase
      .from('email_templates')
      .insert({ ...payload, creado_en: new Date().toISOString() });

    if (error) {
      console.error('[Seed] Error insertando:', error);
    } else {
      console.log('[Seed] Plantilla creada exitosamente.');
    }
  }
}

main();



