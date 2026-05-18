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
const getUniqueId = (type: string) => `${type}-evt-${Date.now()}-${Math.floor(Math.random() * 99999)}`;

// ─── Plantilla Base (Light Palette) ──
function buildTemplate(nombre: string, evento: string, subject: string, previewText: string, blocks: any[]) {
  const settings = {
    bodyBg: '#F3F4F6', containerBg: '#FFFFFF', width: 600, fontFamily: 'Verdana, Geneva, sans-serif',
    sectionGap: 0, activePaletteId: 'bliscorp-light',
    palettes: [
      { id: 'bliscorp-dark', name: 'BlisCorp Oscuro', bodyBg: '#181818', containerBg: '#181818', text: '#e5e7eb', primary: '#e11d48' },
      { id: 'bliscorp-light', name: 'BlisCorp Claro', bodyBg: '#F3F4F6', containerBg: '#FFFFFF', text: '#333333', primary: '#e11d48' }
    ],
    subject, previewText, evento
  };
  return { empresa_id: DEFAULT_EMPRESA_ID, nombre, evento, settings, blocks };
}

function hdr(logoWidth = 580) {
  return { id: getUniqueId('header'), type: 'header', content: { logoUrl: 'https://cloud.blis-corp.com/d/ucnxd3PrBf1kMBJNb7sE09KUO8Nh6Y/MTMxfHBhZGRpbg.png', bgColor: '#181818', padding: 0, align: 'center', logoWidth } };
}
function spac(h = 0) {
  return { id: getUniqueId('spacer'), type: 'spacer', content: { height: h, bgColor: 'transparent' } };
}
function txt(texto: string, opts: any = {}) {
  return { id: getUniqueId('text'), type: 'text', content: { text: texto, textColor: opts.textColor || '#333333', fontSize: opts.fontSize || 16, fontWeight: opts.fontWeight || 'normal', align: opts.align || 'left', bgColor: 'transparent', padding: opts.padding ?? 16, paddingTop: null, paddingRight: null, paddingBottom: null, paddingLeft: null, lineHeight: 1.6, fontFamily: 'Verdana, Geneva, sans-serif' } };
}
function btn(texto: string, url: string, opts: any = {}) {
  return { id: getUniqueId('button'), type: 'button', content: { text: texto, url, buttonBgColor: opts.bg || '#e11d48', containerBgColor: 'transparent', textColor: '#ffffff', align: 'center', paddingY: opts.paddingY || 14, paddingX: opts.paddingX || 32, borderRadius: 8, fontSize: 16, fontWeight: 'bold', fontFamily: 'Verdana, Geneva, sans-serif', width: 'auto', borderStyle: 'none', borderWidth: 0, borderColor: '#e11d48', padding: opts.containerPadding ?? 0 } };
}
function div(color = '#e5e7eb', h = 1) {
  return { id: getUniqueId('divider'), type: 'divider', content: { color, height: h, borderStyle: 'solid', bgColor: 'transparent', padding: 0 } };
}
function soc(networks: any[]) {
  return { id: getUniqueId('social'), type: 'social', content: { align: 'center', bgColor: 'transparent', padding: 0, iconSize: 28, borderRadius: 8, networks } };
}
function ftr() {
  return { id: getUniqueId('footer'), type: 'footer', content: { text: '© 2026 BLIS Corp. Todos los derechos reservados.\nDesarrollo inmobiliario de alta precisión y rentabilidad.', bgColor: 'transparent', textColor: '#9ca3af', padding: 0, fontSize: 12, fontFamily: 'Verdana, Geneva, sans-serif', align: 'center' } };
}

const defaultNets = [
  { id: getUniqueId('net'), network: 'facebook', url: 'https://www.facebook.com/BlisCorp', iconColor: '#ffffff', bgColor: '#181818' },
  { id: getUniqueId('net'), network: 'instagram', url: 'https://www.instagram.com/kevinvaldezdelacruz/', iconColor: '#ffffff', bgColor: '#e11d48' },
  { id: getUniqueId('net'), network: 'twitter', url: 'https://x.com/kevinVdlc/', iconColor: '#ffffff', bgColor: '#000000' },
  { id: getUniqueId('net'), network: 'whatsapp', url: 'https://wa.me/51934111007', iconColor: '#ffffff', bgColor: '#e11d48' },
  { id: getUniqueId('net'), network: 'youtube', url: 'https://www.youtube.com/c/BlisCorp', iconColor: '#ffffff', bgColor: '#181818' }
];

// ─── 1. TRANSACCIONES & PAGOS (10) ──
const transacciones = [
  buildTemplate('Compra Completada (Logueado)', 'transaccion_compra_completada_logueado',
    '¡Gracias por tu compra, {{nombre}}!',
    'Tu pedido #{{comprobante_id}} ha sido confirmado.',
    [hdr(), spac(),
      txt(`¡Hola, {{nombre}}!\n\nTu compra ha sido procesada exitosamente. Aquí están los detalles de tu pedido:\n\n📦 Productos:\n{{productos}}\n\n💰 Total: {{moneda}} {{total}}\n💳 Método de pago: {{metodo_pago}}\n📅 Fecha: {{fecha_compra}}\n🆔 Comprobante: {{comprobante_id}}`, { fontSize: 16, fontWeight: 'normal' }),
      spac(),
      btn('Ver mi Factura', '{{enlace_factura}}'),
      spac(),
      txt(`Tienes {{dias_garantia}} días de garantía. Si necesitas ayuda, contáctanos al {{whatsapp_soporte}}.`, { fontSize: 13, textColor: '#6b7280', align: 'center' }),
      spac(), div(),
      txt(`Subtotal: {{moneda}} {{subtotal}}  |  Descuento: {{moneda}} {{descuento}}`, { fontSize: 12, textColor: '#9ca3af', align: 'center', padding: 0 }),
      spac(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Compra Completada (Invitado)', 'transaccion_compra_completada_invitado',
    '¡Gracias por tu compra en BLIS Corp!',
    'Tu pedido #{{comprobante_id}} ha sido confirmado. Crea tu cuenta.',
    [hdr(), spac(),
      txt(`¡Hola!\n\nGracias por confiar en BLIS Corp. Tu compra ha sido confirmada:\n\n📦 {{productos}}\n💰 Total: {{moneda}} {{total}}\n📅 {{fecha_compra}}`, { fontSize: 16 }),
      spac(), btn('Crear mi Cuenta', '{{enlace_crear_cuenta}}'),
      spac(),
      txt(`Hemos generado una cuenta para ti:\n🔑 Contraseña temporal: {{password_temporal}}\n\nTu garantía es de {{dias_garantia}} días.`, { fontSize: 14 }),
      spac(), div(),
      txt(`Factura disponible en: {{enlace_factura}}`, { fontSize: 12, textColor: '#9ca3af', align: 'center', padding: 0 }),
      spac(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Compra Pendiente (Logueado)', 'transaccion_compra_pendiente_logueado',
    'Tu pedido #{{comprobante_id}} está pendiente de pago',
    'Estamos esperando tu {{metodo_pago}} para confirmar.',
    [hdr(), spac(),
      txt(`¡Hola, {{nombre}}!\n\nHemos recibido tu pedido pero tu pago está pendiente de confirmación.\n\n📦 {{productos}}\n💰 Total a pagar: {{moneda}} {{total}}\n💳 Método: {{metodo_pago}}`, { fontSize: 16 }),
      spac(), btn('Ver Instrucciones de Pago', '{{enlace_seguimiento}}'),
      spac(),
      txt(`Tu pedido #{{comprobante_id}} será confirmado una vez recibamos tu pago. ¿Dudas? Escríbenos al {{whatsapp_soporte}}.`, { fontSize: 13, textColor: '#6b7280' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Compra Pendiente (Invitado)', 'transaccion_compra_pendiente_invitado',
    'Tu pedido #{{comprobante_id}} está pendiente de pago',
    'Completa tu {{metodo_pago}} para confirmar tu compra.',
    [hdr(), spac(),
      txt(`¡Hola!\n\nHemos registrado tu pedido, pero necesitamos que completes el pago para procesarlo.\n\n📦 {{productos}}\n💰 Total: {{moneda}} {{total}}\n💳 {{metodo_pago}}`, { fontSize: 16 }),
      spac(), btn('Completar Pago', '{{enlace_seguimiento}}'),
      spac(),
      txt(`Una vez confirmado el pago, recibirás acceso inmediato. También puedes crear tu cuenta: {{enlace_crear_cuenta}}`, { fontSize: 13, textColor: '#6b7280' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Compra Aprobada', 'transaccion_compra_aprobada',
    '¡Tu compra ha sido aprobada, {{nombre}}!',
    'Tu pedido #{{comprobante_id}} ya está confirmado.',
    [hdr(), spac(),
      txt(`¡Excelentes noticias, {{nombre}}!\n\nTu compra ha sido aprobada y ya tienes acceso a tus productos.\n\n📦 {{productos}}\n💰 {{moneda}} {{total}}\n📅 {{fecha_aprobacion}}`, { fontSize: 16 }),
      spac(), btn('Ir a mi Dashboard', '{{enlace_acceso}}'),
      spac(),
      txt(`Descarga tu factura aquí: {{enlace_factura}}\n\nGarantía: {{dias_garantia}} días.`, { fontSize: 13, textColor: '#6b7280', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Compra Rechazada', 'transaccion_compra_rechazada',
    'Actualización sobre tu pedido #{{comprobante_id}}',
    'Lamentamos informarte que tu compra no pudo ser procesada.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nLamentamos informarte que tu compra no ha podido ser aprobada.\n\n📦 {{productos}}\n💰 {{moneda}} {{total}}\n❌ Motivo: {{motivo_rechazo}}`, { fontSize: 16 }),
      spac(),
      txt(`Si crees que hubo un error, contáctanos al {{whatsapp_soporte}} y con gusto te ayudaremos.`, { fontSize: 13, textColor: '#6b7280' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Pago de Mensualidad', 'transaccion_pago_mensualidad',
    'Tu membresía ha sido renovada, {{nombre}}',
    'Mensualidad {{periodo}} procesada exitosamente.',
    [hdr(), spac(),
      txt(`¡Hola, {{nombre}}!\n\nTu membresía ha sido renovada exitosamente.\n\n📅 Periodo: {{periodo}}\n💰 Monto: {{moneda}} {{total}}\n💳 {{metodo_pago}}\n🆔 {{comprobante_id}}`, { fontSize: 16 }),
      spac(), btn('Ir al Dashboard', '{{enlace_acceso}}'),
      spac(),
      txt(`Factura disponible: {{enlace_factura}}`, { fontSize: 12, textColor: '#9ca3af', align: 'center', padding: 0 }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Mensualidad Vencida', 'transaccion_pago_vencido',
    'Tu membresía necesita atención, {{nombre}}',
    'Tu suscripción venció hace {{dias_vencidos}} días.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nQueremos recordarte que tu membresía ha vencido.\n\n📅 Vencimiento: {{fecha_vencimiento}}\n⏰ Días vencidos: {{dias_vencidos}}\n💰 Monto pendiente: {{moneda}} {{total}}`, { fontSize: 16 }),
      spac(), btn('Renovar Ahora', '{{enlace_pago}}'),
      spac(),
      txt(`¿Necesitas ayuda? Contáctanos al {{whatsapp_soporte}}.`, { fontSize: 13, textColor: '#6b7280', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Factura Emitida', 'transaccion_factura_emitida',
    'Tu {{tipo_documento}} #{{comprobante_id}} está lista',
    'Documento fiscal generado para tu compra del {{fecha_compra}}.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nTu {{tipo_documento}} ha sido generada:\n\n🆔 N° {{comprobante_id}}\n📅 Fecha: {{fecha_compra}}\n💰 Total: {{moneda}} {{total}}\n📦 Subtotal: {{moneda}} {{subtotal}}\n🏷️ Descuento: {{moneda}} {{descuento}}`, { fontSize: 16 }),
      spac(), btn('Descargar Factura', '{{enlace_factura}}'),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Reembolso Procesado', 'transaccion_reembolso_procesado',
    'Reembolso procesado, {{nombre}}',
    'Tu reembolso por {{moneda}} {{total}} ha sido ejecutado.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nTu reembolso ha sido procesado:\n\n💰 Monto: {{moneda}} {{total}}\n📅 Fecha: {{fecha_reembolso}}\n📝 Motivo: {{motivo_reembolso}}\n🆔 Referencia: {{comprobante_id}}`, { fontSize: 16 }),
      spac(),
      txt(`Si tienes preguntas, escríbenos al {{whatsapp_soporte}}.`, { fontSize: 13, textColor: '#6b7280', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
];

// ─── 2. CUENTA & ACCESO (10) ──
const cuenta = [
  buildTemplate('Bienvenida', 'cuenta_bienvenida',
    '¡Bienvenido a BLIS Corp, {{nombre}}!',
    'Tu cuenta ha sido creada exitosamente.',
    [hdr(), spac(),
      txt(`¡Bienvenido a bordo, {{nombre}}!\n\nTu cuenta ha sido creada exitosamente. Estamos felices de tenerte en la plataforma líder en desarrollo inmobiliario y formación profesional.\n\nAccede a tu dashboard para comenzar:`, { fontSize: 16 }),
      spac(), btn('Ir al Dashboard', '{{enlace_acceso}}'),
      spac(),
      txt(`Si necesitas ayuda, nuestro equipo está disponible al {{whatsapp_soporte}}.`, { fontSize: 13, textColor: '#6b7280', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Invitación Crear Cuenta', 'cuenta_invitacion_crear_cuenta',
    'Completa tu registro en BLIS Corp',
    'Crea tu cuenta y accede a todos los beneficios.',
    [hdr(), spac(),
      txt(`¡Hola!\n\nGracias por tu compra en BLIS Corp. Para acceder a tus productos y beneficios, completa tu registro:\n\n🔗 {{enlace_crear_cuenta}}\n\n🔑 Usa esta contraseña temporal: {{password_temporal}}`, { fontSize: 16 }),
      spac(), btn('Crear Mi Cuenta', '{{enlace_crear_cuenta}}'),
      spac(),
      txt(`¿Dudas? {{whatsapp_soporte}}`, { fontSize: 13, textColor: '#6b7280', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Verificar Email', 'cuenta_verificar_email',
    'Verifica tu correo electrónico, {{nombre}}',
    'Confirma tu email para activar todas las funciones.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nPor favor verifica tu dirección de correo electrónico haciendo clic en el botón de abajo:`, { fontSize: 16, align: 'center' }),
      spac(), btn('Verificar Email', '{{enlace_verificar}}'),
      spac(),
      txt(`Si no solicitaste esta verificación, puedes ignorar este mensaje.`, { fontSize: 12, textColor: '#9ca3af', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Restablecer Contraseña', 'cuenta_restablecer_password',
    'Restablece tu contraseña, {{nombre}}',
    'Solicitud de cambio de contraseña para tu cuenta.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nRecibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón para crear una nueva:`, { fontSize: 16, align: 'center' }),
      spac(), btn('Restablecer Contraseña', '{{enlace_restablecer}}'),
      spac(),
      txt(`Si no solicitaste este cambio, ignora este mensaje. Tu cuenta está segura.`, { fontSize: 12, textColor: '#9ca3af', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Contraseña Cambiada', 'cuenta_password_cambiada',
    'Tu contraseña ha sido actualizada, {{nombre}}',
    'Cambio de contraseña exitoso en tu cuenta.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nTu contraseña ha sido cambiada exitosamente.\n\n📅 Fecha: {{fecha_solicitud}}\n💻 Dispositivo: {{dispositivo}}\n📍 Ubicación: {{ubicacion}}\n🌐 Navegador: {{navegador}}\n\nSi no realizaste este cambio, contacta a soporte inmediatamente.`, { fontSize: 16 }),
      spac(), btn('Ir al Dashboard', '{{enlace_acceso}}'),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Nuevo Dispositivo', 'cuenta_nuevo_dispositivo',
    'Nuevo inicio de sesión detectado, {{nombre}}',
    'Tu cuenta fue accedida desde un nuevo dispositivo.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nDetectamos un inicio de sesión desde un nuevo dispositivo:\n\n💻 Dispositivo: {{dispositivo}}\n🌐 Navegador: {{navegador}}\n📍 Ubicación: {{ubicacion}}\n📅 Fecha: {{fecha_solicitud}}\n\nSi fuiste tú, puedes ignorar este mensaje. Si no, cambia tu contraseña de inmediato.`, { fontSize: 16 }),
      spac(), btn('Revisar Actividad', '{{enlace_acceso}}'),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Baja de Usuario', 'cuenta_baja_usuario',
    'Confirmación de baja de cuenta, {{nombre}}',
    'Hemos recibido tu solicitud de baja.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nHemos recibido tu solicitud para dar de baja tu cuenta.\n\n📅 Fecha: {{fecha_solicitud}}\n📝 Motivo: {{motivo_baja}}\n\nTu cuenta será desactivada. Si cambias de opinión, tienes {{dias_reactivacion}} días para reactivarla contactándonos al {{whatsapp_soporte}}.`, { fontSize: 16 }),
      spac(),
      txt(`Gracias por haber sido parte de BLIS Corp.`, { fontSize: 14, textColor: '#6b7280', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Cuenta Desactivada', 'cuenta_desactivada',
    'Tu cuenta ha sido desactivada, {{nombre}}',
    'Notificación de desactivación de cuenta.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nTu cuenta ha sido desactivada por la administración.\n\n📅 Fecha: {{fecha_solicitud}}\n📝 Motivo: {{motivo_baja}}\n\nSi consideras que esto es un error, contáctanos al {{whatsapp_soporte}}.`, { fontSize: 16 }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Cuenta Reactivada', 'cuenta_reactivada',
    '¡Tu cuenta ha sido reactivada, {{nombre}}!',
    'Bienvenido de vuelta a BLIS Corp.',
    [hdr(), spac(),
      txt(`¡Bienvenido de vuelta, {{nombre}}!\n\nTu cuenta ha sido reactivada exitosamente.\n\n📅 Fecha: {{fecha_solicitud}}`, { fontSize: 16 }),
      spac(), btn('Ir al Dashboard', '{{enlace_acceso}}'),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Cuenta Eliminada', 'cuenta_cuenta_eliminada',
    'Tu cuenta ha sido eliminada, {{nombre}}',
    'Confirmación de eliminación permanente de cuenta.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nTu cuenta ha sido eliminada permanentemente de nuestra plataforma.\n\n📅 Fecha: {{fecha_solicitud}}\n\nAgradecemos el tiempo que compartiste con nosotros.`, { fontSize: 16 }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
];

// ─── 3. EMPLEADOS & PERSONAL (10) ──
const empleados = [
  buildTemplate('Bienvenida al Puesto', 'empleado_bienvenida_puesto',
    '¡{{nombre_empleado}}, bienvenido a BLIS Corp!',
    'Te damos la bienvenida como {{puesto}} en {{departamento}}.',
    [hdr(), spac(),
      txt(`¡Bienvenido al equipo, {{nombre_empleado}} {{apellido_empleado}}!\n\nEstamos emocionados de tenerte como {{puesto}} en el departamento de {{departamento}}.\n\n📅 Fecha de inicio: {{fecha_inicio}}\n\nAccede a la plataforma con los siguientes datos:`, { fontSize: 16 }),
      spac(), btn('Acceder a la Plataforma', '{{enlace_acceso}}'),
      spac(),
      txt(`🔑 Contraseña temporal: {{password_temporal}}\n\nCámbiala al iniciar sesión por primera vez.`, { fontSize: 13, textColor: '#6b7280' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Cese de Servicios', 'empleado_cese_servicios',
    'Confirmación de cese, {{nombre_empleado}}',
    'Documentación de término de relación laboral.',
    [hdr(), spac(),
      txt(`Estimado/a {{nombre_empleado}} {{apellido_empleado}}.\n\nPor medio de la presente, confirmamos el término de tu relación laboral con BLIS Corp.\n\n📋 Puesto: {{puesto}}\n🏢 Departamento: {{departamento}}\n📅 Fecha de cese: {{fecha_cese}}\n📝 Motivo: {{motivo_cese}}\n⏳ Años de servicio: {{anios_servicio}}\n\nAgradecemos profundamente tu dedicación y contribución durante estos años.`, { fontSize: 16 }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Cambio de Rol', 'empleado_cambio_rol',
    'Actualización de tu rol, {{nombre_empleado}}',
    'Has sido promovido a {{puesto}} en {{departamento}}.',
    [hdr(), spac(),
      txt(`¡Felicidades, {{nombre_empleado}} {{apellido_empleado}}!\n\nNos complace informarte que has sido asignado al puesto de {{puesto}} en el departamento de {{departamento}}.\n\n📅 Efectivo desde: {{fecha_inicio}}\n\nConfiamos en que seguirás contribuyendo al éxito de BLIS Corp.`, { fontSize: 16 }),
      spac(), btn('Ver Mi Perfil', '{{enlace_acceso}}'),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Documento Asignado', 'empleado_documento_asignado',
    'Documento pendiente de revisión, {{nombre_empleado}}',
    '{{nombre_documento_rrhh}} requiere tu atención.',
    [hdr(), spac(),
      txt(`Hola, {{nombre_empleado}} {{apellido_empleado}}.\n\nTienes un documento pendiente de revisión:\n\n📄 {{nombre_documento_rrhh}}\n🏢 {{departamento}}`, { fontSize: 16 }),
      spac(), btn('Revisar Documento', '{{enlace_documento_rrhh}}'),
      spac(),
      txt(`Por favor revísalo a la brevedad posible.`, { fontSize: 13, textColor: '#6b7280', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Aniversario Laboral', 'empleado_aniversario_laboral',
    '¡Feliz aniversario, {{nombre_empleado}}!',
    'Hoy celebras {{anios_servicio}} años en BLIS Corp.',
    [hdr(), spac(),
      txt(`¡Feliz aniversario laboral, {{nombre_empleado}} {{apellido_empleado}}!\n\nHoy celebramos {{anios_servicio}} años desde que te uniste a nuestro equipo como {{puesto}} en {{departamento}}.\n\nGracias por tu compromiso, dedicación y por ser parte fundamental del crecimiento de BLIS Corp.`, { fontSize: 16, align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Vacaciones Aprobadas', 'empleado_vacaciones_aprobadas',
    'Vacaciones aprobadas, {{nombre_empleado}}',
    'Disfruta tus {{dias_vacaciones}} días de descanso.',
    [hdr(), spac(),
      txt(`¡Buenas noticias, {{nombre_empleado}} {{apellido_empleado}}!\n\nTu solicitud de vacaciones ha sido aprobada:\n\n📅 Inicio: {{fecha_inicio_vacaciones}}\n📅 Fin: {{fecha_fin_vacaciones}}\n🏖️ Días: {{dias_vacaciones}}\n🏢 {{departamento}}`, { fontSize: 16 }),
      spac(),
      txt(`¡Disfruta tu merecido descanso!`, { fontSize: 14, textColor: '#6b7280', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Vacaciones Rechazadas', 'empleado_vacaciones_rechazadas',
    'Actualización sobre tus vacaciones, {{nombre_empleado}}',
    'Tu solicitud de vacaciones no pudo ser aprobada.',
    [hdr(), spac(),
      txt(`Hola, {{nombre_empleado}} {{apellido_empleado}}.\n\nLamentamos informarte que tu solicitud de vacaciones no ha sido aprobada en esta ocasión.\n\n📅 Solicitadas: {{fecha_inicio_vacaciones}} al {{fecha_fin_vacaciones}}\n🏢 {{departamento}}\n\nPuedes contactar a tu supervisor para más detalles.`, { fontSize: 16 }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Evaluación Pendiente', 'empleado_evaluacion_pendiente',
    'Evaluación de desempeño pendiente, {{nombre_empleado}}',
    'Tienes una evaluación por completar en {{departamento}}.',
    [hdr(), spac(),
      txt(`Hola, {{nombre_empleado}} {{apellido_empleado}}.\n\nTienes una evaluación de desempeño pendiente:\n\n📋 Puesto: {{puesto}}\n🏢 Departamento: {{departamento}}`, { fontSize: 16 }),
      spac(), btn('Realizar Evaluación', '{{enlace_evaluacion}}'),
      spac(),
      txt(`Por favor complétala antes de la fecha límite.`, { fontSize: 13, textColor: '#6b7280', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Cumpleaños', 'empleado_cumpleanos',
    '¡Feliz cumpleaños, {{nombre_empleado}}!',
    'BLIS Corp te desea un feliz día.',
    [hdr(), spac(),
      txt(`¡Feliz cumpleaños, {{nombre_empleado}} {{apellido_empleado}}!\n\nDe parte de todo el equipo de BLIS Corp, te deseamos un día lleno de alegría y éxitos.\n\n🏢 {{departamento}} — {{puesto}}\n\nGracias por ser parte de nuestra familia.`, { fontSize: 16, align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Bono Asignado', 'empleado_bono_asignado',
    '¡Bono asignado, {{nombre_empleado}}!',
    'Has recibido un bono de {{moneda}} {{monto_bono}}.',
    [hdr(), spac(),
      txt(`¡Felicitaciones, {{nombre_empleado}} {{apellido_empleado}}!\n\nHas recibido un bono por tu excelente desempeño:\n\n💰 Monto: {{moneda}} {{monto_bono}}\n📝 Motivo: {{motivo_bono}}\n📋 Puesto: {{puesto}}\n🏢 {{departamento}}`, { fontSize: 16 }),
      spac(),
      txt(`Tu esfuerzo y dedicación son reconocidos. ¡Sigue así!`, { fontSize: 14, textColor: '#6b7280', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
];

// ─── 4. CURSOS & CAPACITACIÓN (10) ──
const cursos = [
  buildTemplate('Inscripción a Curso', 'curso_inscripcion_exitosa',
    '¡Inscrito en {{nombre_curso}}, {{nombre}}!',
    'Tu acceso al curso ya está disponible.',
    [hdr(), spac(),
      txt(`¡Enhorabuena, {{nombre}}!\n\nTe has inscrito exitosamente en:\n\n📚 {{nombre_curso}}\n👨‍🏫 Instructor: {{instructor}}\n🛡️ Garantía: {{dias_garantia}} días\n\nAccede ahora y comienza tu aprendizaje:`, { fontSize: 16 }),
      spac(), btn('Ir al Curso', '{{enlace_curso}}'),
      spac(),
      txt(`¿Dudas? {{whatsapp_soporte}}`, { fontSize: 13, textColor: '#6b7280', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Módulo Liberado', 'curso_modulo_liberado',
    'Nuevo módulo disponible: {{nombre_modulo}}',
    'Un nuevo módulo de {{nombre_curso}} te espera.',
    [hdr(), spac(),
      txt(`¡Hola, {{nombre}}!\n\nUn nuevo módulo ha sido desbloqueado en tu curso:\n\n📚 {{nombre_curso}}\n📖 {{nombre_modulo}}\n📊 Avance: {{porcentaje_avance}}%`, { fontSize: 16 }),
      spac(), btn('Ver Módulo', '{{enlace_curso}}'),
      spac(),
      txt(`¡Sigue avanzando! Cada módulo te acerca más a tu certificado.`, { fontSize: 13, textColor: '#6b7280', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Recordatorio de Avance', 'curso_recordatorio_avance',
    'Aún tienes {{porcentaje_avance}}% de {{nombre_curso}}',
    'No dejes pasar más tiempo. ¡Retoma tu curso!',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nNotamos que no has avanzado en tu curso recientemente:\n\n📚 {{nombre_curso}}\n📊 Progreso: {{porcentaje_avance}}%\n⏰ Días restantes: {{dias_restantes}}\n📅 Expira: {{fecha_expiracion_curso}}`, { fontSize: 16 }),
      spac(), btn('Continuar Curso', '{{enlace_curso}}'),
      spac(),
      txt(`¡No pierdas tu inversión! Completa el curso y obtén tu certificado.`, { fontSize: 13, textColor: '#6b7280', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Curso Completado', 'curso_completado',
    '¡Felicitaciones, {{nombre}}! Completaste {{nombre_curso}}',
    'Has finalizado el curso al 100%. ¡Descarga tu certificado!',
    [hdr(), spac(),
      txt(`¡Felicitaciones, {{nombre}}!\n\nHas completado exitosamente:\n\n📚 {{nombre_curso}}\n📊 Progreso: {{porcentaje_avance}}%\n👨‍🏫 Instructor: {{instructor}}\n\nEstamos orgullosos de tu dedicación y compromiso.`, { fontSize: 16, align: 'center' }),
      spac(), btn('Descargar Certificado', '{{enlace_certificado}}'),
      spac(),
      txt(`También puedes revisar otros cursos en: {{enlace_curso}}`, { fontSize: 13, textColor: '#6b7280', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Certificado Emitido', 'curso_certificado_emitido',
    'Tu certificado de {{nombre_curso}} está listo',
    'Descarga tu certificado oficial avalado por BLIS Corp.',
    [hdr(), spac(),
      txt(`¡Hola, {{nombre}}!\n\nTu certificado oficial ha sido generado:\n\n📜 {{nombre_curso}}\n👨‍🏫 {{instructor}}\n📅 {{fecha_actual}}\n\nEste certificado acredita tu formación y está disponible para descarga inmediata:`, { fontSize: 16, align: 'center' }),
      spac(), btn('Ver Certificado', '{{enlace_certificado}}'),
      spac(),
      txt(`Comparte tu logro en redes sociales y etiqueta a @BlisCorp.`, { fontSize: 13, textColor: '#6b7280', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Sesión en Vivo', 'curso_sesion_en_vivo',
    'Sesión en vivo: {{nombre_curso}}',
    '{{fecha_sesion}} a las {{hora_sesion}} con {{instructor}}.',
    [hdr(), spac(),
      txt(`¡Hola, {{nombre}}!\n\nTe recordamos que tienes una sesión en vivo programada:\n\n📚 {{nombre_curso}}\n📅 {{fecha_sesion}}\n🕐 {{hora_sesion}}\n👨‍🏫 {{instructor}}`, { fontSize: 16 }),
      spac(), btn('Unirme a la Sesión', '{{enlace_sesion}}'),
      spac(),
      txt(`Te recomendamos conectarte 5 minutos antes. ¡Te esperamos!`, { fontSize: 13, textColor: '#6b7280', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Evaluación Disponible', 'curso_evaluacion_disponible',
    'Evaluación disponible: {{nombre_curso}}',
    'Tu examen de {{nombre_curso}} ya está habilitado.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nLa evaluación de tu curso ya está disponible:\n\n📚 {{nombre_curso}}\n⏰ Disponible hasta: {{fecha_expiracion_curso}}\n\nAsegúrate de completarla antes de la fecha límite.`, { fontSize: 16 }),
      spac(), btn('Tomar Evaluación', '{{enlace_curso}}'),
      spac(),
      txt(`¡Mucho éxito!`, { fontSize: 13, textColor: '#6b7280', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Evaluación Calificada', 'curso_evaluacion_calificada',
    'Tu nota de {{nombre_curso}}: {{nota_evaluacion}}/{{nota_maxima}}',
    'Resultados de tu evaluación ya disponibles.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nTu evaluación ha sido calificada:\n\n📚 {{nombre_curso}}\n📝 Nota: {{nota_evaluacion}} / {{nota_maxima}}\n👨‍🏫 {{instructor}}`, { fontSize: 16, align: 'center' }),
      spac(), btn('Ver Resultados', '{{enlace_curso}}'),
      spac(),
      txt(`Revisa tus resultados y áreas de mejora en la plataforma.`, { fontSize: 13, textColor: '#6b7280', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Acceso por Expirar', 'curso_acceso_por_expirar',
    'Tu acceso a {{nombre_curso}} expira en {{dias_restantes}} días',
    'Aprovecha tu curso antes que expire.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nTu acceso al curso está por vencer:\n\n📚 {{nombre_curso}}\n⏰ Días restantes: {{dias_restantes}}\n📅 Fecha de expiración: {{fecha_expiracion_curso}}\n\n¡No dejes pasar la oportunidad de completarlo!`, { fontSize: 16 }),
      spac(), btn('Ir al Curso', '{{enlace_curso}}'),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Acceso Expirado', 'curso_acceso_expirado',
    'Tu acceso a {{nombre_curso}} ha expirado',
    'El periodo de acceso al curso ha finalizado.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nTu periodo de acceso al curso ha finalizado:\n\n📚 {{nombre_curso}}\n📅 Expiró: {{fecha_expiracion_curso}}\n\nSi deseas renovar tu acceso o explorar otros cursos, contáctanos al {{whatsapp_soporte}}.`, { fontSize: 16 }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
];

// ─── 5. LEADS & CRM (7) ──
const leads = [
  buildTemplate('Lead Nuevo', 'lead_nuevo_registrado',
    '¡Gracias por tu interés, {{nombre_lead}}!',
    'Hemos recibido tu solicitud desde {{nombre_campana}}.',
    [hdr(), spac(),
      txt(`¡Hola, {{nombre_lead}} {{apellido_lead}}!\n\nGracias por contactarnos. Hemos recibido tu información y pronto nos comunicaremos contigo.\n\n📧 {{email_lead}}\n📱 {{telefono_lead}}\n📊 Campaña: {{nombre_campana}}`, { fontSize: 16 }),
      spac(),
      txt(`Mientras tanto, puedes conocer más sobre nosotros en nuestra web.`, { fontSize: 13, textColor: '#6b7280' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Lead Asignado a Asesor', 'lead_asignado_asesor',
    '{{nombre_lead}}, {{nombre_asesor}} será tu asesor',
    'Tu caso ha sido asignado a un asesor especializado.',
    [hdr(), spac(),
      txt(`Hola, {{nombre_lead}} {{apellido_lead}}.\n\nTu solicitud ha sido asignada a un asesor que te atenderá de forma personalizada:\n\n👤 {{nombre_asesor}}\n📧 {{email_asesor}}\n💬 {{whatsapp_asesor}}\n📊 Campaña: {{nombre_campana}}`, { fontSize: 16 }),
      spac(),
      txt(`{{nombre_asesor}} se pondrá en contacto contigo próximamente.`, { fontSize: 13, textColor: '#6b7280' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Lead Contactado', 'lead_contactado',
    '{{nombre_lead}}, gracias por tu tiempo',
    'Fue un placer conversar contigo.',
    [hdr(), spac(),
      txt(`Hola, {{nombre_lead}} {{apellido_lead}}.\n\nGracias por tu tiempo en nuestra conversación del {{fecha_contacto}}.\n\n👤 Tu asesor: {{nombre_asesor}}\n\nSi tienes preguntas adicionales, no dudes en contactarnos.`, { fontSize: 16 }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Lead Calificado', 'lead_calificado',
    'Avanzamos contigo, {{nombre_lead}}',
    'Tu perfil ha sido calificado. Pronto te contactaremos.',
    [hdr(), spac(),
      txt(`Hola, {{nombre_lead}} {{apellido_lead}}.\n\nHemos avanzado en el proceso y tu perfil ha sido calificado.\n\n👤 Asesor: {{nombre_asesor}}\n📧 {{email_asesor}}\n💬 {{whatsapp_asesor}}`, { fontSize: 16 }),
      spac(),
      txt(`Pronto recibirás más información.`, { fontSize: 13, textColor: '#6b7280' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Lead Convertido', 'lead_convertido_cliente',
    '¡Bienvenido a la familia BLIS Corp, {{nombre_lead}}!',
    'Tu proceso de vinculación ha sido exitoso.',
    [hdr(), spac(),
      txt(`¡Bienvenido, {{nombre_lead}} {{apellido_lead}}!\n\nEstamos felices de darte la bienvenida como nuevo cliente de BLIS Corp.\n\n👤 Tu asesor fue: {{nombre_asesor}}\n📧 {{email_asesor}}\n\nAccede a tu panel personal:`, { fontSize: 16 }),
      spac(), btn('Ir al Dashboard', '{{enlace_acceso}}'),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Recordatorio Seguimiento', 'lead_recordatorio_seguimiento',
    '{{nombre_lead}}, ¿seguimos conversando?',
    'Hace {{dias_inactivo}} días que no sabemos de ti.',
    [hdr(), spac(),
      txt(`Hola, {{nombre_lead}} {{apellido_lead}}.\n\nHan pasado {{dias_inactivo}} días desde nuestro último contacto y queremos saber cómo vas.\n\n👤 Tu asesor, {{nombre_asesor}}, está disponible para ti:\n💬 {{whatsapp_asesor}}`, { fontSize: 16 }),
      spac(),
      txt(`¿Hay algo en lo que podamos ayudarte?`, { fontSize: 14, textColor: '#6b7280', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Lead Perdido', 'lead_perdido',
    'Gracias por tu interés, {{nombre_lead}}',
    'Lamentamos que no hayamos podido concretar.',
    [hdr(), spac(),
      txt(`Hola, {{nombre_lead}} {{apellido_lead}}.\n\nLamentamos que no hayamos podido concretar una vinculación en esta ocasión.\n\n👤 {{nombre_asesor}}\n📅 {{fecha_contacto}}\n📊 {{nombre_campana}}\n\nSi en el futuro cambias de opinión, estaremos encantados de recibirte.`, { fontSize: 16 }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
];

// ─── 6. ADMINISTRATIVO (8) ──
const admin = [
  buildTemplate('Nueva Compra a Revisar', 'admin_nueva_compra_revisar',
    'Compra pendiente de aprobación: {{nombre_comprador}} {{apellido_comprador}}',
    '{{moneda}} {{total_compra}} vía {{metodo_pago_compra}}.',
    [hdr(), spac(),
      txt(`Hay una nueva compra que requiere tu revisión:\n\n👤 Comprador: {{nombre_comprador}} {{apellido_comprador}}\n📧 {{email_comprador}}\n💰 Monto: {{moneda}} {{total_compra}}\n💳 Método: {{metodo_pago_compra}}\n📅 {{fecha_compra}}\n\nRevisa los detalles y aprueba o rechaza la transacción.`, { fontSize: 16 }),
      spac(), btn('Revisar Compra', '{{enlace_acceso}}'),
      spac(), div(), ftr(), spac()]
  ),
  buildTemplate('Usuario Solicitó Baja', 'admin_usuario_solicito_baja',
    'Baja de usuario: {{nombre}} {{apellido}}',
    '{{email}} solicitó la baja de su cuenta.',
    [hdr(), spac(),
      txt(`Un usuario ha solicitado la baja de su cuenta:\n\n👤 {{nombre}} {{apellido}}\n📧 {{email}}\n📝 Motivo: {{motivo_baja}}\n📅 {{fecha_solicitud}}\n\nRevisa esta solicitud en el panel de administración.`, { fontSize: 16 }),
      spac(), btn('Panel de Administración', '{{enlace_acceso}}'),
      spac(), div(), ftr(), spac()]
  ),
  buildTemplate('Error Crítico del Sistema', 'admin_error_critico',
    '⚠️ Error crítico detectado',
    '{{descripcion_error}}',
    [hdr(), spac(),
      txt(`⚠️ Se ha detectado un error crítico en el sistema:\n\n📝 {{descripcion_error}}\n📅 {{fecha_actual}}\n\nPor favor revisa los logs y toma acción inmediata.`, { fontSize: 16, textColor: '#dc2626' }),
      spac(), btn('Ver Logs', '{{enlace_acceso}}'),
      spac(), div(), ftr(), spac()]
  ),
  buildTemplate('Límite de Usuarios', 'admin_limite_usuarios',
    'Aviso: capacidad de usuarios al {{porcentaje_uso}}%',
    'El plan está cerca de su límite.',
    [hdr(), spac(),
      txt(`El uso de capacidad de usuarios está llegando al límite:\n\n📊 Uso actual: {{porcentaje_uso}}%\n📅 {{fecha_actual}}\n\nConsidera ampliar tu plan para evitar interrupciones.`, { fontSize: 16 }),
      spac(), btn('Administrar Plan', '{{enlace_acceso}}'),
      spac(), div(), ftr(), spac()]
  ),
  buildTemplate('Límite de Almacenamiento', 'admin_limite_almacenamiento',
    'Aviso: almacenamiento al {{porcentaje_uso}}%',
    'El espacio de almacenamiento está casi lleno.',
    [hdr(), spac(),
      txt(`El almacenamiento está llegando a su capacidad máxima:\n\n💾 Uso: {{porcentaje_uso}}%\n📅 {{fecha_actual}}\n\nLibera espacio o amplía tu plan.`, { fontSize: 16 }),
      spac(), btn('Gestionar Almacenamiento', '{{enlace_acceso}}'),
      spac(), div(), ftr(), spac()]
  ),
  buildTemplate('Actividad Sospechosa', 'admin_actividad_sospechosa',
    '⚠️ Actividad sospechosa detectada: {{nombre}} {{apellido}}',
    'Intento de acceso desde {{ubicacion_sospechosa}}.',
    [hdr(), spac(),
      txt(`Se ha detectado actividad sospechosa:\n\n👤 {{nombre}} {{apellido}}\n📧 {{email}}\n💻 {{dispositivo_sospechoso}}\n📍 {{ubicacion_sospechosa}}\n🕐 {{hora_intento}}\n📅 {{fecha_actual}}`, { fontSize: 16, textColor: '#dc2626' }),
      spac(), btn('Investigar', '{{enlace_acceso}}'),
      spac(), div(), ftr(), spac()]
  ),
  buildTemplate('Reporte Mensual', 'admin_reporte_mensual',
    'Reporte mensual disponible: {{fecha_reporte}}',
    'El reporte de {{empresa}} ya está listo.',
    [hdr(), spac(),
      txt(`El reporte mensual ha sido generado:\n\n📊 {{fecha_reporte}}\n🏢 {{empresa}}`, { fontSize: 16 }),
      spac(), btn('Ver Reporte', '{{enlace_reporte}}'),
      spac(), div(), ftr(), spac()]
  ),
  buildTemplate('Nueva Empresa Registrada', 'admin_nuevo_registro_empresa',
    'Nueva empresa: {{nombre_empresa_nueva}}',
    'Se ha registrado una nueva empresa en la plataforma.',
    [hdr(), spac(),
      txt(`Una nueva empresa se ha registrado:\n\n🏢 {{nombre_empresa_nueva}}\n📧 {{email}}\n📅 {{fecha_actual}}\n\nRevisa los detalles en el panel de superadmin.`, { fontSize: 16 }),
      spac(), btn('Panel Superadmin', '{{enlace_acceso}}'),
      spac(), div(), ftr(), spac()]
  ),
];

// ─── 7. COMUNICACIÓN MASIVA (7) ──
const comunicacion = [
  buildTemplate('Boletín / Newsletter', 'comunicacion_boletin',
    '{{titulo_boletin}}',
    'Boletín informativo de BLIS Corp — {{fecha_actual}}.',
    [hdr(), spac(),
      txt(`¡Hola, {{nombre}}!\n\nTe presentamos nuestro boletín: {{titulo_boletin}}\n\n[Contenido del boletín — personaliza esta sección]\n\n📅 {{fecha_actual}}`, { fontSize: 16 }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Promoción', 'comunicacion_promocion',
    '🔥 {{nombre_promocion}}',
    '{{porcentaje_descuento}}% de descuento. Código: {{codigo_descuento}}.',
    [hdr(), spac(),
      txt(`¡Hola, {{nombre}}!\n\nTenemos una oferta especial para ti:\n\n🎁 {{nombre_promocion}}\n🏷️ {{porcentaje_descuento}}% de descuento\n🔑 Código: {{codigo_descuento}}\n⏰ Válido hasta: {{fecha_expiracion}}\n\n¡No dejes pasar esta oportunidad!`, { fontSize: 16 }),
      spac(), btn('Aprovechar Oferta', '{{enlace_acceso}}'),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Anuncio Importante', 'comunicacion_anuncio_importante',
    'Anuncio importante de {{empresa}}',
    'Comunicado oficial — {{fecha_actual}}.',
    [hdr(), spac(),
      txt(`Estimado/a {{nombre}}:\n\n{{empresa}} tiene un anuncio importante que compartir contigo.\n\n[Contenido del anuncio — personaliza esta sección]\n\n📅 {{fecha_actual}}`, { fontSize: 16 }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Evento Próximo', 'comunicacion_evento_proximo',
    '📅 {{nombre_evento}} — {{fecha_evento}}',
    'Te invitamos a nuestro próximo evento.',
    [hdr(), spac(),
      txt(`¡Hola, {{nombre}}!\n\nTe invitamos a nuestro próximo evento:\n\n📅 {{nombre_evento}}\n🗓️ {{fecha_evento}}\n🕐 {{hora_evento}}\n\nReserva tu lugar ahora:`, { fontSize: 16 }),
      spac(), btn('Registrarme', '{{enlace_evento}}'),
      spac(),
      txt(`¡Cupos limitados!`, { fontSize: 13, textColor: '#e11d48', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Encuesta', 'comunicacion_encuesta',
    'Ayúdanos a mejorar, {{nombre}}',
    'Tu opinión es muy importante para {{empresa}}.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nEn {{empresa}} valoramos tu opinión. ¿Nos ayudas respondiendo una breve encuesta?\n\n⏱️ Toma menos de 2 minutos.\n📅 {{fecha_actual}}`, { fontSize: 16 }),
      spac(), btn('Responder Encuesta', '{{enlace_encuesta}}'),
      spac(),
      txt(`¡Gracias por tu tiempo!`, { fontSize: 13, textColor: '#6b7280', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Recordatorio de Cita', 'comunicacion_recordatorio_cita',
    'Recordatorio: cita del {{fecha_cita}} a las {{hora_cita}}',
    'No olvides tu cita programada.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nTe recordamos tu cita programada:\n\n📅 {{fecha_cita}}\n🕐 {{hora_cita}}`, { fontSize: 16 }),
      spac(), btn('Ver Detalles', '{{enlace_evento}}'),
      spac(),
      txt(`Si necesitas reagendar, contáctanos con anticipación.`, { fontSize: 13, textColor: '#6b7280', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Invitación a Plataforma', 'comunicacion_invitacion_plataforma',
    '{{nombre}}, te han invitado a {{empresa}}',
    'Únete a la plataforma de {{empresa}}.',
    [hdr(), spac(),
      txt(`¡Hola!\n\nHas sido invitado a unirte a {{empresa}}, la plataforma líder en desarrollo inmobiliario y formación profesional.\n\nÚnete ahora:`, { fontSize: 16 }),
      spac(), btn('Unirme Ahora', '{{enlace_invitacion}}'),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
];

// ─── 8. SEGURIDAD (5) ──
const seguridad = [
  buildTemplate('2FA Activado', 'seguridad_2fa_activado',
    'Autenticación en dos pasos activada, {{nombre}}',
    'Tu cuenta ahora es más segura.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nLa autenticación en dos pasos (2FA) ha sido activada exitosamente en tu cuenta.\n\n📅 {{fecha_actividad}}\n💻 {{dispositivo}}\n\nTu cuenta ahora está protegida con una capa adicional de seguridad.`, { fontSize: 16 }),
      spac(), btn('Ir al Dashboard', '{{enlace_acceso}}'),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('2FA Desactivado', 'seguridad_2fa_desactivado',
    '2FA desactivado en tu cuenta, {{nombre}}',
    'La autenticación en dos pasos ha sido removida.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nLa autenticación en dos pasos (2FA) ha sido desactivada de tu cuenta.\n\n📅 {{fecha_actividad}}\n💻 {{dispositivo}}\n\nSi no realizaste este cambio, contacta a soporte inmediatamente.`, { fontSize: 16 }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Sesiones Cerradas', 'seguridad_sesiones_cerradas',
    'Todas tus sesiones han sido cerradas, {{nombre}}',
    'Medida de seguridad aplicada a tu cuenta.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nPor seguridad, todas las sesiones activas de tu cuenta han sido cerradas.\n\n📅 {{fecha_actividad}}\n💻 {{dispositivo}}\n\nDeberás iniciar sesión nuevamente en todos tus dispositivos.`, { fontSize: 16 }),
      spac(), btn('Iniciar Sesión', '{{enlace_acceso}}'),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Cambio de Email', 'seguridad_cambio_email',
    'Confirma tu nuevo correo, {{nombre}}',
    'Has solicitado cambiar tu dirección de email.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nHas solicitado cambiar tu dirección de correo electrónico. Para confirmar el cambio, haz clic en el botón:\n\n📅 {{fecha_actividad}}`, { fontSize: 16, align: 'center' }),
      spac(), btn('Confirmar Cambio', '{{enlace_confirmar}}'),
      spac(),
      txt(`Si no realizaste esta solicitud, ignora este mensaje.`, { fontSize: 12, textColor: '#9ca3af', align: 'center' }),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Intento Sospechoso', 'seguridad_intento_sospechoso',
    '⚠️ Intento de acceso bloqueado, {{nombre}}',
    'Actividad sospechosa detectada en tu cuenta.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nBloqueamos un intento de acceso sospechoso a tu cuenta:\n\n💻 {{dispositivo_sospechoso}}\n📍 {{ubicacion_sospechosa}}\n🕐 {{hora_intento}}\n📅 {{fecha_actividad}}\n\nSi no fuiste tú, te recomendamos cambiar tu contraseña.`, { fontSize: 16 }),
      spac(), btn('Cambiar Contraseña', '{{enlace_acceso}}'),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
];

// ─── 9. DOCUMENTOS & LEGAL (4) ──
const documentos = [
  buildTemplate('Contrato Pendiente de Firma', 'documento_contrato_firmar',
    '{{nombre}}, tienes un contrato pendiente de firma',
    '{{nombre_documento}} — {{tipo_contrato}}.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nTienes un documento pendiente de firma:\n\n📄 {{nombre_documento}}\n📋 Tipo: {{tipo_contrato}}\n📅 {{fecha_actual}}\n\nPor favor revísalo y fírmalo a la brevedad:`, { fontSize: 16 }),
      spac(), btn('Firmar Documento', '{{enlace_documento}}'),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Contrato Firmado', 'documento_contrato_firmado',
    '{{nombre}} {{apellido}} ha firmado {{nombre_documento}}',
    'Documento completado — {{fecha_firma}}.',
    [hdr(), spac(),
      txt(`El siguiente documento ha sido firmado:\n\n👤 {{nombre}} {{apellido}}\n📧 {{email}}\n📄 {{nombre_documento}}\n📋 {{tipo_contrato}}\n📅 {{fecha_firma}}\n\nEl documento está disponible en el sistema.`, { fontSize: 16 }),
      spac(), btn('Ver Documento', '{{enlace_documento}}'),
      spac(), div(), ftr(), spac()]
  ),
  buildTemplate('Contrato Vencido', 'documento_contrato_vencido',
    '{{nombre}}, tu {{tipo_contrato}} está por vencer',
    '{{nombre_documento}} — {{dias_para_vencer}} días restantes.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nTu documento está próximo a vencer:\n\n📄 {{nombre_documento}}\n📋 {{tipo_contrato}}\n📅 Vencimiento: {{fecha_vencimiento_contrato}}\n⏰ Días restantes: {{dias_para_vencer}}\n\nPor favor toma acción antes de la fecha límite.`, { fontSize: 16 }),
      spac(), btn('Renovar / Revisar', '{{enlace_documento}}'),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
  buildTemplate('Documento Compartido', 'documento_compartido',
    '{{nombre}}, un documento ha sido compartido contigo',
    '{{nombre_documento}} está disponible para ti.',
    [hdr(), spac(),
      txt(`Hola, {{nombre}}.\n\nUn documento ha sido compartido contigo:\n\n📄 {{nombre_documento}}\n📅 {{fecha_actual}}\n\nAccede para revisarlo:`, { fontSize: 16 }),
      spac(), btn('Ver Documento', '{{enlace_documento}}'),
      spac(), div(), soc(defaultNets), spac(), ftr(), spac()]
  ),
];

// ─── EJECUCIÓN ──
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
