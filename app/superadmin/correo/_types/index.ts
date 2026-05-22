export interface EmailServerConfig {
  id: string
  empresa_id: string
  nombre: string
  dominio: string
  imap_host: string
  imap_port: number
  imap_secure: boolean
  smtp_host: string
  smtp_port: number
  smtp_secure: boolean
  creado_en: string
  actualizado_en: string
}

export interface EmailCuenta {
  id: string
  email: string
  nombre_mostrado: string
  departamento?: string
  avatar_url?: string
  color?: string
  firma?: string
  plantilla_default_id?: string
  last_sync?: string
  creado_en: string
  dominio: string
  servidor_nombre: string
}

export interface EmailFolder {
  path: string
  name: string
  flags: string[]
}

export interface EmailMessageSummary {
  uid: number
  subject: string
  from: string
  fromName: string
  to: string
  date: string
  flags: string[]
  hasAttachments: boolean
  size: number
  isRead: boolean
  isFlagged: boolean
  isAnswered: boolean
}

export interface EmailAttachment {
  filename: string
  mimeType: string
  size: number
  content: string
  contentId?: string
  disposition: string
  inline: boolean
}

export interface EmailMessageFull {
  uid: number
  envelope: {
    date: Date
    subject: string
    from: Array<{ name?: string; address: string }>
    to: Array<{ name?: string; address: string }>
    cc?: Array<{ name?: string; address: string }>
    messageId?: string
    inReplyTo?: string
  }
  flags: string[]
  isRead: boolean
  isFlagged: boolean
  subject: string
  from: string
  fromName: string
  to: string
  cc: string
  date: string
  html: string
  text: string
  messageId: string
  inReplyTo: string
  references: string
  size: number
  attachments: EmailAttachment[]
}

export interface EmailTranslateResult {
  translatedHtml: string
  translatedText: string
  sourceLang: string
  targetLang: string
}

export interface ReplyPayload {
  cuenta_id: string
  folder: string
  template_id?: string
  respuesta_texto: string
  to_email: string
  to_name?: string
  subject: string
  reply_all?: boolean
  cc?: string
}
