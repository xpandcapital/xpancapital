/**
 * Seed: Crea 71 plantillas de correo para eventos del sistema
 * Uso: npx tsx scripts/seed-email-event-templates.ts
 * Requiere: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local
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

// ─── Plantilla Base ──
function buildTemplate(nombre: string, evento: string, subject: string, previewText: string, blocks: any[], dark = false) {
  const base = dark
    ? { bodyBg: '#0a0a0a', containerBg: '#111111', activePaletteId: 'xpancapital-dark' }
    : { bodyBg: '#F3F4F6', containerBg: '#FFFFFF', activePaletteId: 'xpancapital-light' };
  const settings = {
    ...base, width: 600, fontFamily: 'Verdana, Geneva, sans-serif', sectionGap: 0,
    palettes: [
      { id: 'xpancapital-dark', name: 'XpandCapital Oscuro', bodyBg: '#181818', containerBg: '#181818', text: '#e5e7eb', primary: '#e11d48' },
      { id: 'xpancapital-light', name: 'XpandCapital Claro', bodyBg: '#F3F4F6', containerBg: '#FFFFFF', text: '#333333', primary: '#e11d48' }
    ],
    subject, previewText, evento
  };
  return { empresa_id: DEFAULT_EMPRESA_ID, nombre, evento, settings, blocks };
}

function hdr(logoWidth = 600, bg = '#181818') {
  return { id: getUniqueId('header'), type: 'header', content: { logoUrl: LOGO_URL, bgColor: bg, padding: 0, align: 'center', logoWidth } };
}
function hdrDark(lw = 600) { return hdr(lw, '#0a0a0a'); }
function spac(h = 0) {
  return { id: getUniqueId('spacer'), type: 'spacer', content: { height: h, bgColor: 'transparent' } };
}
function txt(texto: string, opts: any = {}) {
  return { id: getUniqueId('text'), type: 'text', content: { text: texto, textColor: opts.textColor || '#333333', fontSize: opts.fontSize || 16, fontWeight: opts.fontWeight || 'normal', align: opts.align || 'left', bgColor: 'transparent', padding: opts.padding ?? 16, paddingTop: opts.paddingTop ?? null, paddingRight: opts.paddingRight ?? null, paddingBottom: opts.paddingBottom ?? null, paddingLeft: opts.paddingLeft ?? null, lineHeight: 1.6, fontFamily: 'Verdana, Geneva, sans-serif' } };
}
function txtDark(texto: string, opts: any = {}) {
  return txt(texto, { ...opts, textColor: opts.textColor || '#e5e7eb', fontSize: opts.fontSize || 15, padding: opts.padding ?? 24, lineHeight: 1.7 });
}
function btn(texto: string, url: string, opts: any = {}) {
  return { id: getUniqueId('button'), type: 'button', content: { text: texto, url, buttonBgColor: opts.bg || '#e11d48', containerBgColor: 'transparent', textColor: '#ffffff', align: 'center', paddingY: opts.paddingY || 14, paddingX: opts.paddingX || 32, borderRadius: 8, fontSize: 16, fontWeight: 'bold', fontFamily: 'Verdana, Geneva, sans-serif', width: 'auto', borderStyle: 'none', borderWidth: 0, borderColor: '#e11d48', padding: opts.containerPadding ?? 0 } };
}
function div(color = '#e5e7eb', h = 1) {
  return { id: getUniqueId('divider'), type: 'divider', content: { color, height: h, borderStyle: 'solid', bgColor: 'transparent', padding: 0 } };
}
function soc(networks: any[], opts: any = {}) {
  return { id: getUniqueId('social'), type: 'social', content: { align: 'center', bgColor: 'transparent', padding: 0, iconSize: opts.iconSize || 28, borderRadius: 8, networks } };
}
function ftr() {
  return { id: getUniqueId('footer'), type: 'footer', content: { text: '© 2026 Xpand Capital. Todos los derechos reservados.\nDesarrollo inmobiliario de alta precision y rentabilidad.', bgColor: 'transparent', textColor: '#9ca3af', padding: 0, fontSize: 12, fontFamily: 'Verdana, Geneva, sans-serif', align: 'center' } };
}
function ftrDark() {
  return { id: getUniqueId('footer'), type: 'footer', content: { text: '© 2026 Xpand Capital. Todos los derechos reservados.', bgColor: 'transparent', textColor: '#6b7280', padding: 0, fontSize: 11, fontFamily: 'Verdana, Geneva, sans-serif', align: 'center' } };
}

function receipt(items?: any[]) {
  return { id: getUniqueId('receipt'), type: 'receipt', content: {
    items: items || [
      { nombre: '{{producto_1_nombre}}', categoria: '{{producto_1_categoria}}', precio: '{{producto_1_precio}}', imagen: '{{producto_1_imagen}}' },
      { nombre: '{{producto_2_nombre}}', categoria: '{{producto_2_categoria}}', precio: '{{producto_2_precio}}', imagen: '{{producto_2_imagen}}' },
      { nombre: '{{producto_3_nombre}}', categoria: '{{producto_3_categoria}}', precio: '{{producto_3_precio}}', imagen: '{{producto_3_imagen}}' }
    ],
    bgColor: '#0a0a0a', headerBg: '#141414', totalBg: '#0a1a0f', rowBg1: '#0f0f0f', rowBg2: '#0a0a0a',
    accentColor: '#4ade80',
    subtotalVar: '{{subtotal}}', descuentoVar: '{{descuento_monto}}', cuponVar: '{{cupon}}', totalVar: '{{total}}',
    metodoPagoVar: '{{metodo_pago}}', fechaVar: '{{fecha_compra}}', showDiscount: true, padding: '16px 20px 20px'
  }};
}
function receiptPendiente() {
  return { id: getUniqueId('receipt'), type: 'receipt', content: {
    items: [
      { nombre: '{{producto_1_nombre}}', categoria: '{{producto_1_categoria}}', precio: '{{producto_1_precio}}', imagen: '{{producto_1_imagen}}' },
      { nombre: '{{producto_2_nombre}}', categoria: '{{producto_2_categoria}}', precio: '{{producto_2_precio}}', imagen: '{{producto_2_imagen}}' },
      { nombre: '{{producto_3_nombre}}', categoria: '{{producto_3_categoria}}', precio: '{{producto_3_precio}}', imagen: '{{producto_3_imagen}}' }
    ],
    bgColor: '#0a0a0a', headerBg: '#141414', totalBg: '#1a120e', rowBg1: '#0f0f0f', rowBg2: '#0a0a0a',
    accentColor: '#f59e0b',
    subtotalVar: '{{total}}', descuentoVar: '{{total}}', cuponVar: '', totalVar: '{{total}}',
    metodoPagoVar: '{{metodo_pago}}', fechaVar: '{{fecha_compra}}', showDiscount: false, padding: '16px 20px 20px'
  }};
}


const defaultNets = [
  { id: getUniqueId('net'), network: 'facebook', url: 'https://www.facebook.com/XpandCapital', iconColor: '#ffffff', bgColor: '#181818' },
  { id: getUniqueId('net'), network: 'instagram', url: 'https://www.instagram.com/kevinvaldezdelacruz/', iconColor: '#ffffff', bgColor: '#e11d48' },
  { id: getUniqueId('net'), network: 'twitter', url: 'https://x.com/kevinVdlc/', iconColor: '#ffffff', bgColor: '#000000' },
  { id: getUniqueId('net'), network: 'whatsapp', url: 'https://wa.me/51934111007', iconColor: '#ffffff', bgColor: '#e11d48' },
  { id: getUniqueId('net'), network: 'youtube', url: 'https://www.youtube.com/c/XpandCapital', iconColor: '#ffffff', bgColor: '#181818' }
];

// ─── 1. TRANSACCIONES & PAGOS (10) ──
const transacciones = [
  buildTemplate('Confirmacion de Compra (Logueado)', 'transaccion_compra_completada_logueado',
    '¡Gracias por tu compra, {{nombre}}!',
    'Tu pedido #{{comprobante_id}} ha sido confirmado.',
    [hdrDark(), spac(20),
      txtDark('¡Gracias por tu compra!', { fontSize: 22, fontWeight: 'bold', align: 'center', paddingTop: 0, paddingBottom: 4, textColor: '#ffffff' }),
      txtDark('Tu pedido ha sido procesado exitosamente. Aqui estan los detalles:', { fontSize: 14, textColor: '#9ca3af', align: 'center', paddingTop: 0, paddingBottom: 8 }),
      receipt(),
      spac(12),
      btn('Ver Factura', '{{enlace_factura}}'),
      spac(8),
      txtDark(`Garantia de {{dias_garantia}} dias. Soporte: {{whatsapp_soporte}}`, { fontSize: 12, textColor: '#6b7280', align: 'center', padding: 16 }),
      div('#1a1a1a'), soc(defaultNets), ftrDark(), spac(12)]
  , true),
  buildTemplate('Confirmacion de Compra (Invitado)', 'transaccion_compra_completada_invitado',
    '¡Gracias por tu compra en Xpand Capital!',
    'Tu pedido #{{comprobante_id}} ha sido confirmado.',
    [hdrDark(), spac(20),
      txtDark('¡Gracias por tu compra!', { fontSize: 22, fontWeight: 'bold', align: 'center', paddingTop: 0, paddingBottom: 4, textColor: '#ffffff' }),
      txtDark('Tu pedido ha sido confirmado. Crea tu cuenta para acceder a tus productos:', { fontSize: 14, textColor: '#9ca3af', align: 'center', paddingTop: 0, paddingBottom: 8 }),
      receipt(),
      spac(12),
      btn('Crear Mi Cuenta', '{{enlace_crear_cuenta}}'),
      spac(4),
      txtDark('Contrasena temporal:', { fontSize: 13, textColor: '#9ca3af', align: 'center', fontWeight: 'normal', padding: 16 }),
      txtDark('{{password_temporal}}', { fontSize: 18, textColor: '#4ade80', align: 'center', fontWeight: 'bold', paddingTop: 0, paddingBottom: 4 }),
      txtDark('Accede con este codigo y cambia tu contrasena al iniciar sesion.', { fontSize: 12, textColor: '#6b7280', align: 'center', paddingTop: 0, padding: 16 }),
      spac(4),
      txtDark(`Garantia de {{dias_garantia}} dias. Factura: {{enlace_factura}}`, { fontSize: 12, textColor: '#6b7280', align: 'center', padding: 16 }),
      div('#1a1a1a'), soc(defaultNets), ftrDark(), spac(12)]
  , true),
  buildTemplate('Compra Pendiente (Logueado)', 'transaccion_compra_pendiente_logueado',
    'Tu pedido #{{comprobante_id}} esta pendiente de pago',
    'Completa tu {{metodo_pago}} para confirmar.',
    [hdrDark(), spac(20),
      txtDark('Pago pendiente de confirmacion', { fontSize: 20, fontWeight: 'bold', align: 'center', paddingTop: 0, paddingBottom: 4, textColor: '#f59e0b' }),
      txtDark('Hemos recibido tu pedido pero tu pago esta pendiente:', { fontSize: 14, textColor: '#9ca3af', align: 'center', paddingTop: 0, paddingBottom: 8 }),
      receiptPendiente(),
      spac(12),
      btn('Completar Pago', '{{enlace_seguimiento}}'),
      spac(8),
      txtDark(`Tu pedido #{{comprobante_id}} sera confirmado al recibir tu pago.\nSoporte: {{whatsapp_soporte}}`, { fontSize: 13, textColor: '#6b7280', align: 'center', padding: 16 }),
      div('#1a1a1a'), soc(defaultNets), ftrDark(), spac(12)]
  , true),
  buildTemplate('Compra Pendiente (Invitado)', 'transaccion_compra_pendiente_invitado',
    'Tu pedido #{{comprobante_id}} esta pendiente de pago',
    'Completa tu {{metodo_pago}} para confirmar.',
    [hdrDark(), spac(20),
      txtDark('Pago pendiente de confirmacion', { fontSize: 20, fontWeight: 'bold', align: 'center', paddingTop: 0, paddingBottom: 4, textColor: '#f59e0b' }),
      txtDark('Hemos registrado tu pedido. Completa el pago para procesarlo:', { fontSize: 14, textColor: '#9ca3af', align: 'center', paddingTop: 0, paddingBottom: 8 }),
      receiptPendiente(),
      spac(12),
      btn('Completar Pago', '{{enlace_seguimiento}}'),
      spac(4),
      txtDark(`Al confirmar el pago recibiras acceso inmediato.\nCrea tu cuenta: {{enlace_crear_cuenta}}`, { fontSize: 13, textColor: '#d1d5db', align: 'center', padding: 16 }),
      spac(4),
      txtDark(`Soporte: {{whatsapp_soporte}}`, { fontSize: 12, textColor: '#6b7280', align: 'center', padding: 16 }),
      div('#1a1a1a'), soc(defaultNets), ftrDark(), spac(12)]
  , true),
  buildTemplate('Compra Aprobada', 'transaccion_compra_aprobada',
    '¡Tu compra ha sido aprobada, {{nombre}}!',
    'Tu pedido #{{comprobante_id}} ya esta confirmado.',
    [hdrDark(), spac(20),
      txtDark('¡Compra Aprobada!', { fontSize: 22, fontWeight: 'bold', align: 'center', paddingTop: 0, paddingBottom: 4, textColor: '#4ade80' }),
      txtDark('Tu pedido ha sido aprobado y ya tienes acceso a tus productos:', { fontSize: 14, textColor: '#9ca3af', align: 'center', paddingTop: 0, paddingBottom: 8 }),
      { ...receipt(), content: { ...receipt().content, fechaVar: '{{fecha_aprobacion}}' } },
      spac(12),
      btn('Ir al Dashboard', '{{enlace_acceso}}'),
      spac(8),
      txtDark(`Factura: {{enlace_factura}}  |  Garantia: {{dias_garantia}} dias`, { fontSize: 12, textColor: '#6b7280', align: 'center', padding: 16 }),
      div('#1a1a1a'), soc(defaultNets), ftrDark(), spac(12)]
  , true),
  buildTemplate('Compra Rechazada', 'transaccion_compra_rechazada',
    'Actualizacion sobre tu pedido #{{comprobante_id}}',
    'Lamentamos informarte que tu compra no pudo ser procesada.',
    [hdrDark(), spac(20),
      txtDark('Compra no aprobada', { fontSize: 20, fontWeight: 'bold', align: 'center', paddingTop: 0, paddingBottom: 4, textColor: '#ef4444' }),
      txtDark('Lamentamos informarte que tu compra no pudo ser aprobada:', { fontSize: 14, textColor: '#9ca3af', align: 'center', paddingTop: 0, paddingBottom: 8 }),
      { ...receiptPendiente(), content: { ...receiptPendiente().content, fechaVar: '{{fecha_rechazo}}' } },
      spac(8),
      txtDark(`Motivo: {{motivo_rechazo}}\n\nSi crees que hubo un error, contactanos al {{whatsapp_soporte}}.`, { fontSize: 13, textColor: '#d1d5db', align: 'center', padding: 16 }),
      div('#1a1a1a'), soc(defaultNets), ftrDark(), spac(12)]
  , true),
  buildTemplate('Pago de Mensualidad', 'transaccion_pago_mensualidad',
    'Tu membresia ha sido renovada, {{nombre}}',
    '{{periodo}} procesado exitosamente.',
    [hdrDark(), spac(20),
      txtDark('¡Membresia Renovada!', { fontSize: 22, fontWeight: 'bold', align: 'center', paddingTop: 0, paddingBottom: 4, textColor: '#4ade80' }),
      txtDark(`Periodo: {{periodo}}\nMonto: {{moneda}} {{total}}\nMetodo: {{metodo_pago}}\nComprobante: {{comprobante_id}}`, { fontSize: 15, textColor: '#e5e7eb', align: 'center', fontWeight: 'bold' }),
      spac(12),
      btn('Ir al Dashboard', '{{enlace_acceso}}'),
      spac(8),
      txtDark(`Factura: {{enlace_factura}}  |  Fecha: {{fecha_compra}}`, { fontSize: 12, textColor: '#6b7280', align: 'center', padding: 16 }),
      div('#1a1a1a'), soc(defaultNets), ftrDark(), spac(12)]
  , true),
  buildTemplate('Mensualidad Vencida', 'transaccion_pago_vencido',
    'Tu membresia necesita atencion, {{nombre}}',
    'Tu suscripcion vencio hace {{dias_vencidos}} dias.',
    [hdrDark(), spac(20),
      txtDark('Membresia Vencida', { fontSize: 20, fontWeight: 'bold', align: 'center', paddingTop: 0, paddingBottom: 4, textColor: '#f59e0b' }),
      txtDark(`Tu membresia ha vencido.\n\nVencimiento: {{fecha_vencimiento}}\nDias vencidos: {{dias_vencidos}}\nMonto pendiente: {{moneda}} {{total}}`, { fontSize: 15, textColor: '#e5e7eb', align: 'center' }),
      spac(12),
      btn('Renovar Ahora', '{{enlace_pago}}'),
      spac(8),
      txtDark(`Soporte: {{whatsapp_soporte}}`, { fontSize: 12, textColor: '#6b7280', align: 'center', padding: 16 }),
      div('#1a1a1a'), soc(defaultNets), ftrDark(), spac(12)]
  , true),
  buildTemplate('Factura Emitida', 'transaccion_factura_emitida',
    'Tu {{tipo_documento}} #{{comprobante_id}} esta lista',
    'Documento fiscal generado para tu compra del {{fecha_compra}}.',
    [hdrDark(), spac(20),
      txtDark('Factura Disponible', { fontSize: 22, fontWeight: 'bold', align: 'center', paddingTop: 0, paddingBottom: 4, textColor: '#ffffff' }),
      txtDark(`{{tipo_documento}} N° {{comprobante_id}}\n\nFecha: {{fecha_compra}}\nTotal: {{moneda}} {{total}}\nSubtotal: {{moneda}} {{subtotal}}\nDescuento: {{moneda}} {{descuento}}`, { fontSize: 15, textColor: '#e5e7eb', align: 'center' }),
      spac(12),
      btn('Descargar Factura', '{{enlace_factura}}'),
      div('#1a1a1a'), soc(defaultNets), ftrDark(), spac(12)]
  , true),
  buildTemplate('Reembolso Procesado', 'transaccion_reembolso_procesado',
    'Reembolso procesado, {{nombre}}',
    'Tu reembolso por {{moneda}} {{total}} ha sido ejecutado.',
    [hdrDark(), spac(20),
      txtDark('Reembolso Procesado', { fontSize: 22, fontWeight: 'bold', align: 'center', paddingTop: 0, paddingBottom: 4, textColor: '#ffffff' }),
      txtDark(`Monto: {{moneda}} {{total}}\nFecha: {{fecha_reembolso}}\nMotivo: {{motivo_reembolso}}\nReferencia: {{comprobante_id}}`, { fontSize: 15, textColor: '#e5e7eb', align: 'center' }),
      spac(8),
      txtDark(`¿Dudas? Contactanos al {{whatsapp_soporte}}.`, { fontSize: 13, textColor: '#9ca3af', align: 'center', padding: 16 }),
      div('#1a1a1a'), soc(defaultNets), ftrDark(), spac(12)]
  , true),
];

// ─── 2. CUENTA & ACCESO (10) ──
const cuenta = [
  buildTemplate('Bienvenida', 'cuenta_bienvenida',
    'Bienvenido a Xpand Capital, {{nombre}}',
    'Tu cuenta ha sido creada exitosamente. Accede a tu dashboard.',
    [hdr(), spac(20),
      txt('Bienvenido a bordo', { fontSize: 24, fontWeight: 'bold', align: 'center', textColor: '#111827', paddingTop: 0, paddingBottom: 4 }),
      txt(`Hola, {{nombre}}. Tu cuenta ha sido creada exitosamente.\n\nEstamos felices de tenerte en la plataforma lider en desarrollo inmobiliario y formacion profesional.`, { fontSize: 16, textColor: '#4b5563', align: 'center', paddingTop: 0 }),
      spac(12),
      btn('Ir al Dashboard', '{{enlace_acceso}}', { paddingX: 40, paddingY: 16, fontSize: 16 }),
      spac(16),
      txt(`¿Necesitas ayuda? Nuestro equipo esta disponible al {{whatsapp_soporte}}.`, { fontSize: 13, textColor: '#9ca3af', align: 'center' }),
      spac(8), div('#e5e7eb'), spac(8),
      soc(defaultNets), spac(8), ftr(), spac(12)]
  ),
  buildTemplate('Invitacion Crear Cuenta', 'cuenta_invitacion_crear_cuenta',
    'Completa tu registro en Xpand Capital',
    'Crea tu cuenta con la contrasena temporal {{password_temporal}}.',
    [hdr(), spac(20),
      txt('Completa tu registro', { fontSize: 24, fontWeight: 'bold', align: 'center', textColor: '#111827', paddingTop: 0, paddingBottom: 4 }),
      txt(`Gracias por tu compra en Xpand Capital. Para acceder a tus productos y beneficios, completa tu registro:`, { fontSize: 16, textColor: '#4b5563', align: 'center', paddingTop: 0 }),
      spac(12),
      btn('Crear Mi Cuenta', '{{enlace_crear_cuenta}}', { paddingX: 40, paddingY: 16, fontSize: 16 }),
      spac(16),
      txt(`Tu contrasena temporal es: {{password_temporal}}`, { fontSize: 15, textColor: '#e11d48', align: 'center', fontWeight: 'bold' }),
      txt('Accede y cambiala al iniciar sesion por primera vez.', { fontSize: 13, textColor: '#9ca3af', align: 'center' }),
      spac(8), div('#e5e7eb'), spac(8),
      soc(defaultNets), spac(8), ftr(), spac(12)]
  ),
  buildTemplate('Verificar Email', 'cuenta_verificar_email',
    'Verifica tu correo electronico',
    'Confirma tu email para activar todas las funciones de Xpand Capital.',
    [hdr(), spac(20),
      txt('Verifica tu correo electronico', { fontSize: 22, fontWeight: 'bold', align: 'center', textColor: '#111827', paddingTop: 0, paddingBottom: 4 }),
      txt(`Hola, {{nombre}}. Por favor verifica tu direccion de correo haciendo clic en el boton:`, { fontSize: 16, textColor: '#4b5563', align: 'center', paddingTop: 0 }),
      spac(12),
      btn('Verificar Email', '{{enlace_verificar}}', { paddingX: 40, paddingY: 16, fontSize: 16 }),
      spac(16),
      txt('Si no solicitaste esta verificacion, puedes ignorar este mensaje.', { fontSize: 12, textColor: '#9ca3af', align: 'center' }),
      spac(8), div('#e5e7eb'), spac(8),
      soc(defaultNets), spac(8), ftr(), spac(12)]
  ),
  buildTemplate('Restablecer Contrasena', 'cuenta_restablecer_password',
    'Restablece tu contrasena',
    'Solicitud de cambio de contrasena para tu cuenta de Xpand Capital.',
    [hdr(), spac(20),
      txt('Restablecer contrasena', { fontSize: 22, fontWeight: 'bold', align: 'center', textColor: '#111827', paddingTop: 0, paddingBottom: 4 }),
      txt(`Hola, {{nombre}}. Recibimos una solicitud para restablecer la contrasena de tu cuenta. Haz clic para crear una nueva:`, { fontSize: 16, textColor: '#4b5563', align: 'center', paddingTop: 0 }),
      spac(12),
      btn('Restablecer Contrasena', '{{enlace_restablecer}}', { paddingX: 40, paddingY: 16, fontSize: 16 }),
      spac(16),
      txt('Si no solicitaste este cambio, ignora este mensaje. Tu cuenta esta segura.', { fontSize: 12, textColor: '#9ca3af', align: 'center' }),
      spac(8), div('#e5e7eb'), spac(8),
      soc(defaultNets), spac(8), ftr(), spac(12)]
  ),
  buildTemplate('Contrasena Cambiada', 'cuenta_password_cambiada',
    'Tu contrasena ha sido actualizada',
    'Cambio de contrasena exitoso el {{fecha_solicitud}}.',
    [hdr(), spac(20),
      txt('Contrasena actualizada', { fontSize: 22, fontWeight: 'bold', align: 'center', textColor: '#111827', paddingTop: 0, paddingBottom: 4 }),
      txt(`Hola, {{nombre}}. Tu contrasena ha sido cambiada exitosamente.`, { fontSize: 16, textColor: '#4b5563', align: 'center', paddingTop: 0 }),
      spac(8),
      txt(`Detalles del cambio:\n\nFecha: {{fecha_solicitud}}\nDispositivo: {{dispositivo}}\nUbicacion: {{ubicacion}}\nNavegador: {{navegador}}\n\nSi no realizaste este cambio, contacta a soporte inmediatamente.`, { fontSize: 14, textColor: '#6b7280', align: 'center' }),
      spac(12),
      btn('Ir al Dashboard', '{{enlace_acceso}}', { paddingX: 40, paddingY: 16, fontSize: 16 }),
      spac(8), div('#e5e7eb'), spac(8),
      soc(defaultNets), spac(8), ftr(), spac(12)]
  ),
  buildTemplate('Nuevo Dispositivo', 'cuenta_nuevo_dispositivo',
    'Alerta: Nuevo inicio de sesion detectado',
    'Tu cuenta fue accedida desde {{dispositivo}} en {{ubicacion}}.',
    [hdr(), spac(20),
      txt('Nuevo inicio de sesion', { fontSize: 20, fontWeight: 'bold', align: 'center', textColor: '#e11d48', paddingTop: 0, paddingBottom: 4 }),
      txt(`Hola, {{nombre}}. Detectamos un inicio de sesion desde un nuevo dispositivo:`, { fontSize: 16, textColor: '#4b5563', align: 'center', paddingTop: 0 }),
      spac(8),
      txt(`Dispositivo: {{dispositivo}}\nNavegador: {{navegador}}\nUbicacion: {{ubicacion}}\nFecha: {{fecha_solicitud}}`, { fontSize: 14, textColor: '#374151', align: 'center', fontWeight: 'bold' }),
      spac(8),
      txt('Si fuiste tu, puedes ignorar este mensaje. Si no reconoces esta actividad, recomendamos cambiar tu contrasena inmediatamente.', { fontSize: 13, textColor: '#6b7280', align: 'center' }),
      spac(12),
      btn('Revisar Actividad', '{{enlace_acceso}}', { paddingX: 40, paddingY: 16, fontSize: 16 }),
      spac(8), div('#e5e7eb'), spac(8),
      soc(defaultNets), spac(8), ftr(), spac(12)]
  ),
  buildTemplate('Baja de Usuario', 'cuenta_baja_usuario',
    'Confirmacion de baja de cuenta',
    'Hemos recibido tu solicitud de baja el {{fecha_solicitud}}.',
    [hdr(), spac(20),
      txt('Solicitud de baja recibida', { fontSize: 22, fontWeight: 'bold', align: 'center', textColor: '#111827', paddingTop: 0, paddingBottom: 4 }),
      txt(`Hola, {{nombre}}. Hemos recibido tu solicitud para dar de baja tu cuenta.`, { fontSize: 16, textColor: '#4b5563', align: 'center', paddingTop: 0 }),
      spac(8),
      txt(`Fecha de solicitud: {{fecha_solicitud}}\nMotivo: {{motivo_baja}}\n\nTu cuenta sera desactivada en los proximos dias. Si cambias de opinion, tienes {{dias_reactivacion}} dias para reactivarla.`, { fontSize: 14, textColor: '#6b7280', align: 'center' }),
      spac(8),
      txt(`Para reactivar o consultar: {{whatsapp_soporte}}`, { fontSize: 13, textColor: '#9ca3af', align: 'center' }),
      spac(8),
      txt('Gracias por haber sido parte de Xpand Capital.', { fontSize: 14, textColor: '#6b7280', align: 'center' }),
      spac(8), div('#e5e7eb'), spac(8),
      soc(defaultNets), spac(8), ftr(), spac(12)]
  ),
  buildTemplate('Cuenta Desactivada', 'cuenta_desactivada',
    'Tu cuenta ha sido desactivada',
    'Notificacion de desactivacion emitida el {{fecha_solicitud}}.',
    [hdr(), spac(20),
      txt('Cuenta desactivada', { fontSize: 22, fontWeight: 'bold', align: 'center', textColor: '#111827', paddingTop: 0, paddingBottom: 4 }),
      txt(`Hola, {{nombre}}. Tu cuenta ha sido desactivada por la administracion.`, { fontSize: 16, textColor: '#4b5563', align: 'center', paddingTop: 0 }),
      spac(8),
      txt(`Fecha: {{fecha_solicitud}}\nMotivo: {{motivo_baja}}`, { fontSize: 14, textColor: '#6b7280', align: 'center' }),
      spac(8),
      txt(`Si consideras que esto es un error, contactanos al {{whatsapp_soporte}}.`, { fontSize: 13, textColor: '#9ca3af', align: 'center' }),
      spac(8), div('#e5e7eb'), spac(8),
      soc(defaultNets), spac(8), ftr(), spac(12)]
  ),
  buildTemplate('Cuenta Reactivada', 'cuenta_reactivada',
    'Tu cuenta ha sido reactivada',
    'Bienvenido de vuelta a Xpand Capital desde el {{fecha_solicitud}}.',
    [hdr(), spac(20),
      txt('¡Cuenta reactivada!', { fontSize: 24, fontWeight: 'bold', align: 'center', textColor: '#059669', paddingTop: 0, paddingBottom: 4 }),
      txt(`Bienvenido de vuelta, {{nombre}}. Tu cuenta ha sido reactivada exitosamente el {{fecha_solicitud}}.`, { fontSize: 16, textColor: '#4b5563', align: 'center', paddingTop: 0 }),
      spac(12),
      btn('Ir al Dashboard', '{{enlace_acceso}}', { paddingX: 40, paddingY: 16, fontSize: 16 }),
      spac(8),
      txt('Estamos felices de tenerte de vuelta.', { fontSize: 14, textColor: '#6b7280', align: 'center' }),
      spac(8), div('#e5e7eb'), spac(8),
      soc(defaultNets), spac(8), ftr(), spac(12)]
  ),
  buildTemplate('Cuenta Eliminada', 'cuenta_cuenta_eliminada',
    'Tu cuenta ha sido eliminada',
    'Confirmacion de eliminacion permanente emitida el {{fecha_solicitud}}.',
    [hdr(), spac(20),
      txt('Cuenta eliminada', { fontSize: 22, fontWeight: 'bold', align: 'center', textColor: '#111827', paddingTop: 0, paddingBottom: 4 }),
      txt(`Hola, {{nombre}}. Tu cuenta ha sido eliminada permanentemente de nuestra plataforma el {{fecha_solicitud}}.`, { fontSize: 16, textColor: '#4b5563', align: 'center', paddingTop: 0 }),
      spac(12),
      txt('Agradecemos el tiempo que compartiste con nosotros. Las puertas de Xpand Capital estaran siempre abiertas para ti.', { fontSize: 14, textColor: '#6b7280', align: 'center' }),
      spac(8), div('#e5e7eb'), spac(8),
      soc(defaultNets), spac(8), ftr(), spac(12)]
  ),
];

// ─── 3. EMPLEADOS & PERSONAL (10) ──
const empleados = [
  buildTemplate('Bienvenida al Puesto', 'empleado_bienvenida_puesto',
    'Bienvenido a Xpand Capital, {{nombre_empleado}}',
    'Te damos la bienvenida como {{puesto}} en {{departamento}}.',
    [hdr(), spac(20),
      txt('Bienvenido al equipo', { fontSize: 24, fontWeight: 'bold', align: 'center', textColor: '#111827', paddingTop: 0, paddingBottom: 4 }),
      txt(`Estimado/a {{nombre_empleado}} {{apellido_empleado}},\n\nEstamos emocionados de darte la bienvenida como {{puesto}} en el departamento de {{departamento}}.`, { fontSize: 16, textColor: '#4b5563', align: 'center', paddingTop: 0 }),
      spac(8),
      txt(`Fecha de inicio: {{fecha_inicio}}\n\nTu acceso a la plataforma esta listo. Inicia sesion con los siguientes datos:`, { fontSize: 14, textColor: '#6b7280', align: 'center' }),
      spac(12),
      btn('Acceder a la Plataforma', '{{enlace_acceso}}', { paddingX: 40, paddingY: 16, fontSize: 16 }),
      spac(8),
      txt(`Contrasena temporal: {{password_temporal}}\n\nRecomendamos cambiarla al iniciar sesion por primera vez.`, { fontSize: 13, textColor: '#9ca3af', align: 'center' }),
      spac(8), div('#e5e7eb'), spac(8),
      soc(defaultNets), spac(8), ftr(), spac(12)]
  ),
  buildTemplate('Cese de Servicios', 'empleado_cese_servicios',
    'Confirmacion de cese, {{nombre_empleado}}',
    'Documentacion de termino de relacion laboral en {{departamento}}.',
    [hdr(), spac(20),
      txt('Confirmacion de cese de servicios', { fontSize: 20, fontWeight: 'bold', align: 'center', textColor: '#111827', paddingTop: 0, paddingBottom: 4 }),
      txt(`Estimado/a {{nombre_empleado}} {{apellido_empleado}},\n\nPor medio de la presente, confirmamos el termino de tu relacion laboral con Xpand Capital.`, { fontSize: 16, textColor: '#4b5563', align: 'center', paddingTop: 0 }),
      spac(8),
      txt(`Puesto: {{puesto}}\nDepartamento: {{departamento}}\nFecha de cese: {{fecha_cese}}\nMotivo: {{motivo_cese}}\nAnos de servicio: {{anios_servicio}}`, { fontSize: 14, textColor: '#374151', align: 'center', fontWeight: 'bold' }),
      spac(8),
      txt('Agradecemos profundamente tu dedicacion y contribucion durante estos anos. Xpand Capital siempre sera tu casa.', { fontSize: 14, textColor: '#6b7280', align: 'center' }),
      spac(8), div('#e5e7eb'), spac(8),
      soc(defaultNets), spac(8), ftr(), spac(12)]
  ),
  buildTemplate('Cambio de Rol', 'empleado_cambio_rol',
    'Actualizacion de tu rol, {{nombre_empleado}}',
    'Has sido promovido a {{puesto}} en {{departamento}}.',
    [hdr(), spac(20),
      txt('Felicitaciones por tu nuevo rol', { fontSize: 22, fontWeight: 'bold', align: 'center', textColor: '#059669', paddingTop: 0, paddingBottom: 4 }),
      txt(`Estimado/a {{nombre_empleado}} {{apellido_empleado}},\n\nNos complace informarte que has sido asignado/a al puesto de {{puesto}} en el departamento de {{departamento}}.`, { fontSize: 16, textColor: '#4b5563', align: 'center', paddingTop: 0 }),
      spac(8),
      txt(`Efectivo desde: {{fecha_inicio}}\n\nConfiamos en que continuaras contribuyendo al exito de Xpand Capital.`, { fontSize: 14, textColor: '#6b7280', align: 'center' }),
      spac(12),
      btn('Ver Mi Perfil', '{{enlace_acceso}}', { paddingX: 40, paddingY: 16, fontSize: 16 }),
      spac(8), div('#e5e7eb'), spac(8),
      soc(defaultNets), spac(8), ftr(), spac(12)]
  ),
  buildTemplate('Documento Asignado', 'empleado_documento_asignado',
    'Documento pendiente de revision',
    '{{nombre_documento_rrhh}} requiere tu atencion en {{departamento}}.',
    [hdr(), spac(20),
      txt('Documento pendiente de revision', { fontSize: 20, fontWeight: 'bold', align: 'center', textColor: '#e11d48', paddingTop: 0, paddingBottom: 4 }),
      txt(`Hola, {{nombre_empleado}} {{apellido_empleado}}. Tienes un documento pendiente de revision:`, { fontSize: 16, textColor: '#4b5563', align: 'center', paddingTop: 0 }),
      spac(8),
      txt(`Documento: {{nombre_documento_rrhh}}\nDepartamento: {{departamento}}`, { fontSize: 14, textColor: '#374151', align: 'center', fontWeight: 'bold' }),
      spac(12),
      btn('Revisar Documento', '{{enlace_documento_rrhh}}', { paddingX: 40, paddingY: 16, fontSize: 16 }),
      spac(8),
      txt('Por favor revisalo a la brevedad posible.', { fontSize: 13, textColor: '#9ca3af', align: 'center' }),
      spac(8), div('#e5e7eb'), spac(8),
      soc(defaultNets), spac(8), ftr(), spac(12)]
  ),
  buildTemplate('Aniversario Laboral', 'empleado_aniversario_laboral',
    'Feliz aniversario laboral, {{nombre_empleado}}',
    'Hoy celebras {{anios_servicio}} anos en Xpand Capital.',
    [hdr(), spac(20),
      txt('Feliz aniversario laboral', { fontSize: 24, fontWeight: 'bold', align: 'center', textColor: '#059669', paddingTop: 0, paddingBottom: 4 }),
      txt(`Querido/a {{nombre_empleado}} {{apellido_empleado}},\n\nHoy celebramos {{anios_servicio}} anos desde que te uniste a nuestro equipo como {{puesto}} en {{departamento}}.`, { fontSize: 16, textColor: '#4b5563', align: 'center', paddingTop: 0 }),
      spac(8),
      txt('Gracias por tu compromiso, dedicacion y por ser parte fundamental del crecimiento de Xpand Capital. Cada proyecto, cada logro, lleva tu huella.', { fontSize: 14, textColor: '#6b7280', align: 'center', fontStyle: 'italic' }),
      spac(8), div('#e5e7eb'), spac(8),
      soc(defaultNets), spac(8), ftr(), spac(12)]
  ),
  buildTemplate('Vacaciones Aprobadas', 'empleado_vacaciones_aprobadas',
    'Vacaciones aprobadas, {{nombre_empleado}}',
    'Disfruta tus {{dias_vacaciones}} dias de descanso desde el {{fecha_inicio_vacaciones}}.',
    [hdr(), spac(20),
      txt('Vacaciones aprobadas', { fontSize: 24, fontWeight: 'bold', align: 'center', textColor: '#059669', paddingTop: 0, paddingBottom: 4 }),
      txt(`Buenas noticias, {{nombre_empleado}} {{apellido_empleado}}. Tu solicitud de vacaciones ha sido aprobada.`, { fontSize: 16, textColor: '#4b5563', align: 'center', paddingTop: 0 }),
      spac(8),
      txt(`Inicio: {{fecha_inicio_vacaciones}}\nFin: {{fecha_fin_vacaciones}}\nDias: {{dias_vacaciones}}\nDepartamento: {{departamento}}`, { fontSize: 15, textColor: '#374151', align: 'center', fontWeight: 'bold' }),
      spac(8),
      txt('Disfruta tu merecido descanso. ¡Recarga energias!', { fontSize: 14, textColor: '#6b7280', align: 'center' }),
      spac(8), div('#e5e7eb'), spac(8),
      soc(defaultNets), spac(8), ftr(), spac(12)]
  ),
  buildTemplate('Vacaciones Rechazadas', 'empleado_vacaciones_rechazadas',
    'Actualizacion sobre tus vacaciones',
    'Tu solicitud del {{fecha_inicio_vacaciones}} no pudo ser aprobada.',
    [hdr(), spac(20),
      txt('Vacaciones no aprobadas', { fontSize: 20, fontWeight: 'bold', align: 'center', textColor: '#e11d48', paddingTop: 0, paddingBottom: 4 }),
      txt(`Hola, {{nombre_empleado}} {{apellido_empleado}}. Lamentamos informarte que tu solicitud de vacaciones no ha sido aprobada en esta ocasion.`, { fontSize: 16, textColor: '#4b5563', align: 'center', paddingTop: 0 }),
      spac(8),
      txt(`Solicitadas: {{fecha_inicio_vacaciones}} al {{fecha_fin_vacaciones}}\nDepartamento: {{departamento}}`, { fontSize: 14, textColor: '#6b7280', align: 'center' }),
      spac(8),
      txt('Puedes contactar a tu supervisor para mas detalles.', { fontSize: 13, textColor: '#9ca3af', align: 'center' }),
      spac(8), div('#e5e7eb'), spac(8),
      soc(defaultNets), spac(8), ftr(), spac(12)]
  ),
  buildTemplate('Evaluacion Pendiente', 'empleado_evaluacion_pendiente',
    'Evaluacion de desempeno pendiente',
    'Tienes una evaluacion por completar en {{departamento}}.',
    [hdr(), spac(20),
      txt('Evaluacion de desempeno pendiente', { fontSize: 20, fontWeight: 'bold', align: 'center', textColor: '#e11d48', paddingTop: 0, paddingBottom: 4 }),
      txt(`Hola, {{nombre_empleado}} {{apellido_empleado}}. Tienes una evaluacion de desempeno pendiente:`, { fontSize: 16, textColor: '#4b5563', align: 'center', paddingTop: 0 }),
      spac(8),
      txt(`Puesto: {{puesto}}\nDepartamento: {{departamento}}`, { fontSize: 14, textColor: '#374151', align: 'center', fontWeight: 'bold' }),
      spac(12),
      btn('Realizar Evaluacion', '{{enlace_evaluacion}}', { paddingX: 40, paddingY: 16, fontSize: 16 }),
      spac(8),
      txt('Por favor completala antes de la fecha limite.', { fontSize: 13, textColor: '#9ca3af', align: 'center' }),
      spac(8), div('#e5e7eb'), spac(8),
      soc(defaultNets), spac(8), ftr(), spac(12)]
  ),
  buildTemplate('Cumpleanos', 'empleado_cumpleanos',
    'Feliz cumpleanos, {{nombre_empleado}}',
    'Todo el equipo de Xpand Capital te desea un feliz dia.',
    [hdr(), spac(20),
      txt('¡Feliz Cumpleanos!', { fontSize: 28, fontWeight: 'bold', align: 'center', textColor: '#e11d48', paddingTop: 0, paddingBottom: 4 }),
      txt(`Querido/a {{nombre_empleado}} {{apellido_empleado}},\n\nDe parte de todo el equipo de Xpand Capital, te deseamos un dia lleno de alegria, salud y exitos.`, { fontSize: 16, textColor: '#4b5563', align: 'center', paddingTop: 0 }),
      spac(8),
      txt(`{{departamento}} — {{puesto}}`, { fontSize: 13, textColor: '#9ca3af', align: 'center' }),
      spac(8),
      txt('Gracias por ser parte de nuestra familia. ¡Que cumplas muchos mas!', { fontSize: 14, textColor: '#6b7280', align: 'center' }),
      spac(8), div('#e5e7eb'), spac(8),
      soc(defaultNets), spac(8), ftr(), spac(12)]
  ),
  buildTemplate('Bono Asignado', 'empleado_bono_asignado',
    'Bono asignado a {{nombre_empleado}}',
    'Has recibido un bono de {{moneda}} {{monto_bono}} por {{motivo_bono}}.',
    [hdr(), spac(20),
      txt('¡Bono asignado!', { fontSize: 24, fontWeight: 'bold', align: 'center', textColor: '#059669', paddingTop: 0, paddingBottom: 4 }),
      txt(`Felicitaciones, {{nombre_empleado}} {{apellido_empleado}}. Has recibido un bono por tu excelente desempeno.`, { fontSize: 16, textColor: '#4b5563', align: 'center', paddingTop: 0 }),
      spac(8),
      txt(`Monto: {{moneda}} {{monto_bono}}\nMotivo: {{motivo_bono}}\nPuesto: {{puesto}}\nDepartamento: {{departamento}}`, { fontSize: 15, textColor: '#374151', align: 'center', fontWeight: 'bold' }),
      spac(8),
      txt('Tu esfuerzo y dedicacion son reconocidos y valorados. ¡Sigue asi!', { fontSize: 14, textColor: '#6b7280', align: 'center' }),
      spac(8), div('#e5e7eb'), spac(8),
      soc(defaultNets), spac(8), ftr(), spac(12)]
  ),
];


// --- 4-9. CURSOS, LEADS, ADMIN, COMUNICACION, SEGURIDAD, DOCUMENTOS ---
import { getTemplates } from './seed-template-data-v2';

const helpers = { hdr: (w: any, b: any) => hdr(w, b), spac, txt, txtDark, btn, div, soc, ftr, ftrDark, buildTemplate, defaultNets, receipt, receiptPendiente };
const { cursos, leads, admin, comunicacion, seguridad, documentos } = getTemplates(helpers);

// --- EJECUCION ---
const allTemplates = [
  ...transacciones, ...cuenta, ...empleados, ...cursos,
  ...leads, ...admin, ...comunicacion, ...seguridad, ...documentos
];
async function main() {
  console.log(`📧 Creando ${allTemplates.length} plantillas de eventos...\n`);

  let creadas = 0;
  let errores = 0;

  for (const t of allTemplates) {
    // Verificar si ya existe una plantilla para este evento en esta empresa
    const { data: existing } = await supabase
      .from('email_templates')
      .select('id')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .eq('evento', t.evento)
      .maybeSingle();

    if (existing) {
      // Actualizar existente
      const { error } = await supabase
        .from('email_templates')
        .update({ nombre: t.nombre, settings: t.settings, blocks: t.blocks, actualizado_en: new Date().toISOString() })
        .eq('id', existing.id);

      if (error) {
        console.log(`  ❌ ${t.evento}: ${error.message}`);
        errores++;
      } else {
        console.log(`  🔄 ${t.evento} → "${t.nombre}" (actualizado)`);
        creadas++;
      }
    } else {
      // Insertar nuevo
      const { error } = await supabase
        .from('email_templates')
        .insert({ empresa_id: t.empresa_id, nombre: t.nombre, evento: t.evento, settings: t.settings, blocks: t.blocks });

      if (error) {
        console.log(`  ❌ ${t.evento}: ${error.message}`);
        errores++;
      } else {
        console.log(`  ✅ ${t.evento} → "${t.nombre}"`);
        creadas++;
      }
    }
  }

  console.log(`\n📊 Resultado: ${creadas} plantillas procesadas, ${errores} errores.`);

  // Verificación: contar plantillas con evento asignado
  const { count } = await supabase
    .from('email_templates')
    .select('*', { count: 'exact', head: true })
    .eq('empresa_id', DEFAULT_EMPRESA_ID)
    .not('evento', 'is', null)
    .neq('evento', 'ninguno');

  console.log(`📋 Plantillas con evento asignado en BD: ${count}`);
}

main().catch(console.error);



