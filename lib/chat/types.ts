export interface ChatSala {
  id: string;
  empresa_id: string;
  tipo: 'directo' | 'grupal' | 'soporte' | 'ventas' | 'ia' | 'visitante';
  nombre: string | null;
  descripcion: string | null;
  creado_por: string | null;
  asignado_a: string | null;
  estado: 'activo' | 'archivado' | 'bloqueado';
  metadata: Record<string, any>;
  ultimo_mensaje: Record<string, any>;
  ultima_actividad: string;
  creado_en: string;
}

export interface ChatMensaje {
  id: string;
  sala_id: string;
  user_id: string | null;
  tipo: 'texto' | 'imagen' | 'video' | 'audio' | 'archivo' | 'sistema' | 'ia';
  contenido: string | null;
  archivo_url: string | null;
  archivo_nombre: string | null;
  archivo_size: number | null;
  archivo_mime: string | null;
  archivo_eliminado: boolean;
  reply_to: string | null;
  fijado: boolean;
  editado: boolean;
  eliminado: boolean;
  leido_por: string[];
  programado_para: string | null;
  enviado: boolean;
  metadata: Record<string, any>;
  creado_en: string;
  user?: {
    id: string;
    nombre: string;
    avatar_url: string | null;
    rol: string;
  } | null;
}

export interface ChatMiembro {
  id: string;
  sala_id: string;
  user_id: string;
  rol_sala: 'admin' | 'miembro' | 'observador';
  ultima_lectura: string | null;
  silenciado: boolean;
  bloqueado_por: string | null;
  notificaciones: boolean;
  agregado_en: string;
  user?: {
    id: string;
    nombre: string;
    avatar_url: string | null;
    rol: string;
    estado_chat: string;
  };
}

export interface ChatConfig {
  id: string;
  empresa_id: string;
  widget_activo: boolean;
  widget_color: string;
  widget_posicion: string;
  widget_mensaje_bienvenida: string;
  widget_mensaje_fuera_horario: string;
  horario_atencion: Record<string, any>;
  ia_activa: boolean;
  ia_modelo: string;
  ia_prompt_sistema: string;
  ia_max_tokens: number;
  derivacion_automatica: boolean;
  derivacion_despues_mensajes: number;
  palabras_clave_derivacion: string[];
  notificar_email: boolean;
  notificar_push: boolean;
  sonido_nuevo_mensaje: boolean;
  permitir_archivos: boolean;
  max_file_size_mb: number;
  tipos_archivo_permitidos: string[];
  paginas_widget: string[];
}

export interface ChatPlantilla {
  id: string;
  empresa_id: string;
  departamento: string;
  titulo: string;
  contenido: string;
  atajo: string | null;
  activo: boolean;
}

export interface ChatPresencia {
  user_id: string;
  empresa_id: string;
  estado: 'online' | 'ausente' | 'ocupado' | 'offline';
  ultimo_ping: string;
  esta_escribiendo_en: string | null;
  dispositivo: string;
}

export type ChatEstado = 'online' | 'ausente' | 'ocupado' | 'offline';

export interface ChatVisitante {
  id: string;
  session_id: string;
  nombre: string;
  email?: string;
  empresa_id: string;
  sala_id: string;
  pagina_origen?: string;
  estado: 'activo' | 'resuelto' | 'abandonado';
  ultima_actividad: string;
  creado_en: string;
}
