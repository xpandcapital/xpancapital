export const UNIVERSAL_VARIABLES = [
  { var: '{{nombre}}', desc: 'Nombre de pila del destinatario' },
  { var: '{{apellido}}', desc: 'Apellido(s) del destinatario' },
  { var: '{{nombre_completo}}', desc: 'Nombre completo (nombre + apellido)' },
  { var: '{{email}}', desc: 'Correo electronico del destinatario' },
  { var: '{{telefono}}', desc: 'Telefono del destinatario' },
  { var: '{{empresa}}', desc: 'Nombre de la empresa' },
  { var: '{{fecha_actual}}', desc: 'Fecha y hora actual' },
  { var: '{{whatsapp_soporte}}', desc: 'WhatsApp de soporte' },
  { var: '{{enlace_acceso}}', desc: 'Link de acceso al dashboard' },
  { var: '{{logo_url}}', desc: 'URL del logo de la empresa' },
  { var: '{{nombre_plataforma}}', desc: 'Nombre de la plataforma' },
];

export const EVENT_GROUPS = [
  {
    id: 'transacciones',
    label: 'Transacciones y Pagos',
    icon: 'ShoppingCart',
    events: [
      {
        value: 'transaccion_compra_completada_logueado',
        label: 'Compra completada (logueado)',
        desc: 'Usuario con cuenta completa una compra exitosa',
        vars: ['productos', 'total', 'subtotal', 'descuento', 'cupon', 'moneda', 'metodo_pago', 'fecha_compra', 'comprobante_id', 'enlace_factura', 'dias_garantia', 'whatsapp_soporte', 'enlace_acceso',
          'producto_1_nombre', 'producto_1_categoria', 'producto_1_precio', 'producto_1_imagen',
          'producto_2_nombre', 'producto_2_categoria', 'producto_2_precio', 'producto_2_imagen',
          'producto_3_nombre', 'producto_3_categoria', 'producto_3_precio', 'producto_3_imagen']
      },
      {
        value: 'transaccion_compra_completada_invitado',
        label: 'Compra completada (invitado)',
        desc: 'Invitado sin cuenta completa una compra exitosa',
        vars: ['productos', 'total', 'subtotal', 'descuento', 'cupon', 'moneda', 'metodo_pago', 'fecha_compra', 'comprobante_id', 'enlace_factura', 'enlace_crear_cuenta', 'password_temporal', 'dias_garantia',
          'producto_1_nombre', 'producto_1_categoria', 'producto_1_precio', 'producto_1_imagen',
          'producto_2_nombre', 'producto_2_categoria', 'producto_2_precio', 'producto_2_imagen',
          'producto_3_nombre', 'producto_3_categoria', 'producto_3_precio', 'producto_3_imagen']
      },
      {
        value: 'transaccion_compra_pendiente_logueado',
        label: 'Compra pendiente (logueado)',
        desc: 'Pago por transferencia/crypto pendiente de aprobacion',
        vars: ['productos', 'total', 'moneda', 'metodo_pago', 'fecha_compra', 'comprobante_id', 'enlace_seguimiento', 'whatsapp_soporte',
          'producto_1_nombre', 'producto_1_categoria', 'producto_1_precio',
          'producto_2_nombre', 'producto_2_categoria', 'producto_2_precio',
          'producto_3_nombre', 'producto_3_categoria', 'producto_3_precio']
      },
      {
        value: 'transaccion_compra_pendiente_invitado',
        label: 'Compra pendiente (invitado)',
        desc: 'Pago pendiente de invitado — espera aprobacion',
        vars: ['productos', 'total', 'moneda', 'metodo_pago', 'fecha_compra', 'comprobante_id', 'enlace_seguimiento', 'whatsapp_soporte', 'enlace_crear_cuenta',
          'producto_1_nombre', 'producto_1_categoria', 'producto_1_precio',
          'producto_2_nombre', 'producto_2_categoria', 'producto_2_precio',
          'producto_3_nombre', 'producto_3_categoria', 'producto_3_precio']
      },
      {
        value: 'transaccion_compra_aprobada',
        label: 'Compra aprobada',
        desc: 'Admin aprobo la compra pendiente',
        vars: ['productos', 'total', 'moneda', 'metodo_pago', 'fecha_aprobacion', 'comprobante_id', 'enlace_factura', 'enlace_acceso', 'dias_garantia',
          'producto_1_nombre', 'producto_1_categoria', 'producto_1_precio',
          'producto_2_nombre', 'producto_2_categoria', 'producto_2_precio',
          'producto_3_nombre', 'producto_3_categoria', 'producto_3_precio']
      },
      {
        value: 'transaccion_compra_rechazada',
        label: 'Compra rechazada',
        desc: 'Admin rechazo la compra pendiente',
        vars: ['productos', 'total', 'moneda', 'metodo_pago', 'motivo_rechazo', 'fecha_rechazo', 'whatsapp_soporte',
          'producto_1_nombre', 'producto_1_categoria', 'producto_1_precio',
          'producto_2_nombre', 'producto_2_categoria', 'producto_2_precio',
          'producto_3_nombre', 'producto_3_categoria', 'producto_3_precio']
      },
      {
        value: 'transaccion_pago_mensualidad',
        label: 'Pago de mensualidad',
        desc: 'Membresia/mensualidad renovada exitosamente',
        vars: ['total', 'moneda', 'metodo_pago', 'fecha_compra', 'periodo', 'comprobante_id', 'enlace_factura', 'enlace_acceso']
      },
      {
        value: 'transaccion_pago_vencido',
        label: 'Mensualidad vencida',
        desc: 'Membresia o mensualidad por vencer o vencida',
        vars: ['total', 'moneda', 'fecha_vencimiento', 'dias_vencidos', 'enlace_pago', 'whatsapp_soporte']
      },
      {
        value: 'transaccion_factura_emitida',
        label: 'Factura emitida',
        desc: 'Factura o boleta generada',
        vars: ['total', 'subtotal', 'descuento', 'moneda', 'fecha_compra', 'comprobante_id', 'enlace_factura', 'tipo_documento']
      },
      {
        value: 'transaccion_reembolso_procesado',
        label: 'Reembolso procesado',
        desc: 'Reembolso ejecutado al cliente',
        vars: ['total', 'moneda', 'fecha_reembolso', 'comprobante_id', 'motivo_reembolso', 'whatsapp_soporte']
      }
    ]
  },
  {
    id: 'cuenta',
    label: 'Cuenta y Acceso',
    icon: 'User',
    events: [
      {
        value: 'cuenta_bienvenida',
        label: 'Bienvenida',
        desc: 'Usuario nuevo se registra en la plataforma',
        vars: ['enlace_acceso', 'password_temporal', 'whatsapp_soporte']
      },
      {
        value: 'cuenta_invitacion_crear_cuenta',
        label: 'Invitacion crear cuenta',
        desc: 'Invitado compro — invitacion a crear cuenta',
        vars: ['enlace_crear_cuenta', 'password_temporal', 'whatsapp_soporte']
      },
      {
        value: 'cuenta_verificar_email',
        label: 'Verificar email',
        desc: 'Solicitud de verificacion de correo',
        vars: ['enlace_verificar']
      },
      {
        value: 'cuenta_restablecer_password',
        label: 'Restablecer password',
        desc: 'Solicitud de restablecer contrasena',
        vars: ['enlace_restablecer']
      },
      {
        value: 'cuenta_password_cambiada',
        label: 'Password cambiada',
        desc: 'Contrasena cambiada exitosamente',
        vars: ['fecha_solicitud', 'dispositivo', 'ubicacion', 'navegador']
      },
      {
        value: 'cuenta_nuevo_dispositivo',
        label: 'Nuevo dispositivo',
        desc: 'Inicio de sesion desde dispositivo o ubicacion nueva',
        vars: ['dispositivo', 'ubicacion', 'navegador', 'fecha_solicitud']
      },
      {
        value: 'cuenta_baja_usuario',
        label: 'Baja de usuario',
        desc: 'Usuario solicita darse de baja',
        vars: ['motivo_baja', 'fecha_solicitud', 'dias_reactivacion', 'whatsapp_soporte']
      },
      {
        value: 'cuenta_desactivada',
        label: 'Cuenta desactivada',
        desc: 'Admin desactiva la cuenta del usuario',
        vars: ['fecha_solicitud', 'motivo_baja', 'whatsapp_soporte']
      },
      {
        value: 'cuenta_reactivada',
        label: 'Cuenta reactivada',
        desc: 'Admin reactiva la cuenta del usuario',
        vars: ['fecha_solicitud', 'enlace_acceso']
      },
      {
        value: 'cuenta_cuenta_eliminada',
        label: 'Cuenta eliminada',
        desc: 'Cuenta permanentemente eliminada',
        vars: ['fecha_solicitud', 'motivo_baja']
      }
    ]
  },
  {
    id: 'empleados',
    label: 'Empleados y Personal',
    icon: 'Briefcase',
    events: [
      {
        value: 'empleado_bienvenida_puesto',
        label: 'Bienvenida al puesto',
        desc: 'Empleado asignado a nuevo puesto/rol',
        vars: ['nombre_empleado', 'apellido_empleado', 'puesto', 'departamento', 'fecha_inicio', 'enlace_acceso', 'password_temporal']
      },
      {
        value: 'empleado_cese_servicios',
        label: 'Cese de servicios',
        desc: 'Terminacion de relacion laboral',
        vars: ['nombre_empleado', 'apellido_empleado', 'puesto', 'departamento', 'fecha_cese', 'motivo_cese', 'anios_servicio']
      },
      {
        value: 'empleado_cambio_rol',
        label: 'Cambio de rol',
        desc: 'Cambio de rol o promocion',
        vars: ['nombre_empleado', 'apellido_empleado', 'puesto', 'departamento', 'fecha_inicio']
      },
      {
        value: 'empleado_documento_asignado',
        label: 'Documento asignado',
        desc: 'Documento RRHH pendiente de revision/firma',
        vars: ['nombre_empleado', 'apellido_empleado', 'nombre_documento_rrhh', 'enlace_documento_rrhh', 'departamento']
      },
      {
        value: 'empleado_aniversario_laboral',
        label: 'Aniversario laboral',
        desc: 'Aniversario de ingreso a la empresa',
        vars: ['nombre_empleado', 'apellido_empleado', 'anios_servicio', 'puesto', 'departamento']
      },
      {
        value: 'empleado_vacaciones_aprobadas',
        label: 'Vacaciones aprobadas',
        desc: 'Solicitud de vacaciones aprobada',
        vars: ['nombre_empleado', 'apellido_empleado', 'fecha_inicio_vacaciones', 'fecha_fin_vacaciones', 'dias_vacaciones', 'departamento']
      },
      {
        value: 'empleado_vacaciones_rechazadas',
        label: 'Vacaciones rechazadas',
        desc: 'Solicitud de vacaciones denegada',
        vars: ['nombre_empleado', 'apellido_empleado', 'fecha_inicio_vacaciones', 'fecha_fin_vacaciones', 'departamento']
      },
      {
        value: 'empleado_evaluacion_pendiente',
        label: 'Evaluacion pendiente',
        desc: 'Evaluacion de desempeno pendiente',
        vars: ['nombre_empleado', 'apellido_empleado', 'puesto', 'departamento', 'enlace_evaluacion']
      },
      {
        value: 'empleado_cumpleanos',
        label: 'Cumpleanos',
        desc: 'Felicitacion de cumpleanos',
        vars: ['nombre_empleado', 'apellido_empleado', 'puesto', 'departamento']
      },
      {
        value: 'empleado_bono_asignado',
        label: 'Bono asignado',
        desc: 'Bono o comision otorgada al empleado',
        vars: ['nombre_empleado', 'apellido_empleado', 'monto_bono', 'motivo_bono', 'puesto', 'departamento', 'moneda']
      }
    ]
  },
  {
    id: 'cursos',
    label: 'Cursos y Capacitacion',
    icon: 'GraduationCap',
    events: [
      {
        value: 'curso_inscripcion_exitosa',
        label: 'Inscripcion a curso',
        desc: 'Usuario se inscribe a un curso exitosamente',
        vars: ['nombre_curso', 'instructor', 'enlace_curso', 'dias_garantia', 'whatsapp_soporte']
      },
      {
        value: 'curso_modulo_liberado',
        label: 'Modulo liberado',
        desc: 'Nuevo modulo desbloqueado en el curso',
        vars: ['nombre_curso', 'nombre_modulo', 'porcentaje_avance', 'enlace_curso']
      },
      {
        value: 'curso_recordatorio_avance',
        label: 'Recordatorio de avance',
        desc: 'Recordatorio de curso incompleto',
        vars: ['nombre_curso', 'porcentaje_avance', 'dias_restantes', 'fecha_expiracion_curso', 'enlace_curso']
      },
      {
        value: 'curso_completado',
        label: 'Curso completado',
        desc: 'Curso finalizado al 100%',
        vars: ['nombre_curso', 'porcentaje_avance', 'instructor', 'enlace_certificado', 'enlace_curso']
      },
      {
        value: 'curso_certificado_emitido',
        label: 'Certificado emitido',
        desc: 'Certificado generado y disponible',
        vars: ['nombre_curso', 'enlace_certificado', 'instructor', 'fecha_actual']
      },
      {
        value: 'curso_sesion_en_vivo',
        label: 'Sesion en vivo',
        desc: 'Aviso de sesion en vivo proxima',
        vars: ['nombre_curso', 'fecha_sesion', 'hora_sesion', 'enlace_sesion', 'instructor']
      },
      {
        value: 'curso_evaluacion_disponible',
        label: 'Evaluacion disponible',
        desc: 'Examen o evaluacion disponible',
        vars: ['nombre_curso', 'enlace_curso', 'fecha_expiracion_curso']
      },
      {
        value: 'curso_evaluacion_calificada',
        label: 'Evaluacion calificada',
        desc: 'Nota de evaluacion publicada',
        vars: ['nombre_curso', 'nota_evaluacion', 'nota_maxima', 'enlace_curso', 'instructor']
      },
      {
        value: 'curso_acceso_por_expirar',
        label: 'Acceso por expirar',
        desc: 'Acceso al curso por vencer',
        vars: ['nombre_curso', 'dias_restantes', 'fecha_expiracion_curso', 'enlace_curso']
      },
      {
        value: 'curso_acceso_expirado',
        label: 'Acceso expirado',
        desc: 'Acceso al curso expiro',
        vars: ['nombre_curso', 'fecha_expiracion_curso', 'whatsapp_soporte']
      }
    ]
  },
  {
    id: 'leads',
    label: 'Leads y CRM',
    icon: 'Users',
    events: [
      {
        value: 'lead_nuevo_registrado',
        label: 'Lead nuevo',
        desc: 'Nuevo lead capturado del formulario',
        vars: ['nombre_lead', 'apellido_lead', 'email_lead', 'telefono_lead', 'nombre_campana']
      },
      {
        value: 'lead_asignado_asesor',
        label: 'Lead asignado a asesor',
        desc: 'Lead asignado a un asesor',
        vars: ['nombre_lead', 'apellido_lead', 'nombre_asesor', 'email_asesor', 'whatsapp_asesor', 'nombre_campana']
      },
      {
        value: 'lead_contactado',
        label: 'Lead contactado',
        desc: 'Lead cambia a estado contactado',
        vars: ['nombre_lead', 'apellido_lead', 'nombre_asesor', 'fecha_contacto']
      },
      {
        value: 'lead_calificado',
        label: 'Lead calificado',
        desc: 'Lead cambia a estado calificado',
        vars: ['nombre_lead', 'apellido_lead', 'nombre_asesor', 'email_asesor', 'whatsapp_asesor']
      },
      {
        value: 'lead_convertido_cliente',
        label: 'Lead convertido',
        desc: 'Lead se convierte en cliente',
        vars: ['nombre_lead', 'apellido_lead', 'nombre_asesor', 'email_asesor', 'enlace_acceso']
      },
      {
        value: 'lead_recordatorio_seguimiento',
        label: 'Recordatorio seguimiento',
        desc: 'Recordatorio de seguimiento por inactividad',
        vars: ['nombre_lead', 'apellido_lead', 'nombre_asesor', 'dias_inactivo', 'whatsapp_asesor']
      },
      {
        value: 'lead_perdido',
        label: 'Lead perdido',
        desc: 'Lead marcado como perdido',
        vars: ['nombre_lead', 'apellido_lead', 'nombre_asesor', 'nombre_campana', 'fecha_contacto']
      }
    ]
  },
  {
    id: 'admin',
    label: 'Administrativo',
    icon: 'Shield',
    events: [
      {
        value: 'admin_nueva_compra_revisar',
        label: 'Nueva compra a revisar',
        desc: 'Compra pendiente necesita aprobacion del admin',
        vars: ['nombre_comprador', 'apellido_comprador', 'email_comprador', 'total_compra', 'metodo_pago_compra', 'moneda', 'fecha_compra']
      },
      {
        value: 'admin_usuario_solicito_baja',
        label: 'Usuario solicito baja',
        desc: 'Usuario solicita eliminar su cuenta',
        vars: ['nombre', 'apellido', 'email', 'motivo_baja', 'fecha_solicitud']
      },
      {
        value: 'admin_error_critico',
        label: 'Error critico',
        desc: 'Error critico del sistema',
        vars: ['descripcion_error', 'fecha_actual']
      },
      {
        value: 'admin_limite_usuarios',
        label: 'Limite de usuarios',
        desc: 'Limite de usuarios del plan接近',
        vars: ['porcentaje_uso', 'fecha_actual']
      },
      {
        value: 'admin_limite_almacenamiento',
        label: 'Limite de almacenamiento',
        desc: 'Limite de almacenamiento接近',
        vars: ['porcentaje_uso', 'fecha_actual']
      },
      {
        value: 'admin_actividad_sospechosa',
        label: 'Actividad sospechosa',
        desc: 'Actividad de login sospechosa detectada',
        vars: ['nombre', 'apellido', 'email', 'dispositivo_sospechoso', 'ubicacion_sospechosa', 'hora_intento', 'fecha_actual']
      },
      {
        value: 'admin_reporte_mensual',
        label: 'Reporte mensual',
        desc: 'Reporte mensual generado y disponible',
        vars: ['fecha_reporte', 'enlace_reporte', 'empresa']
      },
      {
        value: 'admin_nuevo_registro_empresa',
        label: 'Nueva empresa registrada',
        desc: 'Nueva empresa registrada (multi-tenant)',
        vars: ['nombre_empresa_nueva', 'email', 'fecha_actual']
      }
    ]
  },
  {
    id: 'comunicacion',
    label: 'Comunicacion Masiva',
    icon: 'Megaphone',
    events: [
      {
        value: 'comunicacion_boletin',
        label: 'Boletin / Newsletter',
        desc: 'Envio masivo de boletin programado',
        vars: ['titulo_boletin', 'fecha_actual']
      },
      {
        value: 'comunicacion_promocion',
        label: 'Promocion',
        desc: 'Campana promocional u oferta',
        vars: ['nombre_promocion', 'codigo_descuento', 'porcentaje_descuento', 'fecha_expiracion']
      },
      {
        value: 'comunicacion_anuncio_importante',
        label: 'Anuncio importante',
        desc: 'Anuncio general de la plataforma',
        vars: ['fecha_actual', 'empresa']
      },
      {
        value: 'comunicacion_evento_proximo',
        label: 'Evento proximo',
        desc: 'Evento proximo (webinar, taller)',
        vars: ['nombre_evento', 'fecha_evento', 'hora_evento', 'enlace_evento']
      },
      {
        value: 'comunicacion_encuesta',
        label: 'Encuesta',
        desc: 'Encuesta de satisfaccion o NPS',
        vars: ['enlace_encuesta', 'fecha_actual', 'empresa']
      },
      {
        value: 'comunicacion_recordatorio_cita',
        label: 'Recordatorio de cita',
        desc: 'Recordatorio de cita o reunion',
        vars: ['fecha_cita', 'hora_cita', 'enlace_evento']
      },
      {
        value: 'comunicacion_invitacion_plataforma',
        label: 'Invitacion a plataforma',
        desc: 'Invitar a alguien a unirse a la plataforma',
        vars: ['enlace_invitacion', 'empresa']
      }
    ]
  },
  {
    id: 'seguridad',
    label: 'Seguridad',
    icon: 'Lock',
    events: [
      {
        value: 'seguridad_2fa_activado',
        label: '2FA activado',
        desc: 'Autenticacion de dos factores activada',
        vars: ['fecha_actividad', 'dispositivo']
      },
      {
        value: 'seguridad_2fa_desactivado',
        label: '2FA desactivado',
        desc: 'Autenticacion de dos factores desactivada',
        vars: ['fecha_actividad', 'dispositivo']
      },
      {
        value: 'seguridad_sesiones_cerradas',
        label: 'Sesiones cerradas',
        desc: 'Todas las sesiones forzadas a cerrar',
        vars: ['fecha_actividad', 'dispositivo']
      },
      {
        value: 'seguridad_cambio_email',
        label: 'Cambio de email',
        desc: 'Solicitud de cambio de email (verificacion)',
        vars: ['enlace_confirmar', 'fecha_actividad']
      },
      {
        value: 'seguridad_intento_sospechoso',
        label: 'Intento sospechoso',
        desc: 'Intento de acceso bloqueado por seguridad',
        vars: ['dispositivo_sospechoso', 'ubicacion_sospechosa', 'hora_intento', 'fecha_actividad']
      }
    ]
  },
  {
    id: 'documentos',
    label: 'Documentos y Legal',
    icon: 'FileText',
    events: [
      {
        value: 'documento_contrato_firmar',
        label: 'Contrato pendiente de firma',
        desc: 'Contrato pendiente de firma por el cliente',
        vars: ['nombre_documento', 'enlace_documento', 'tipo_contrato', 'fecha_actual']
      },
      {
        value: 'documento_contrato_firmado',
        label: 'Contrato firmado',
        desc: 'Contrato firmado — notifica al admin',
        vars: ['nombre', 'apellido', 'email', 'nombre_documento', 'fecha_firma', 'tipo_contrato']
      },
      {
        value: 'documento_contrato_vencido',
        label: 'Contrato vencido',
        desc: 'Contrato por vencer o vencido',
        vars: ['nombre_documento', 'fecha_vencimiento_contrato', 'dias_para_vencer', 'tipo_contrato']
      },
      {
        value: 'documento_compartido',
        label: 'Documento compartido',
        desc: 'Documento compartido con el usuario',
        vars: ['nombre_documento', 'enlace_documento', 'fecha_actual']
      }
    ]
  }
];

export const ALL_VARIABLE_DEFS = {};
EVENT_GROUPS.forEach(g => {
  g.events.forEach(e => {
    e.vars.forEach(v => {
      if (!ALL_VARIABLE_DEFS[v]) ALL_VARIABLE_DEFS[v] = [];
      ALL_VARIABLE_DEFS[v].push(e.label);
    });
  });
});
