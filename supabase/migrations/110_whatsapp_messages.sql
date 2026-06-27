-- Migración: 110_whatsapp_messages.sql
-- Tabla para almacenar mensajes entrantes/salientes del webhook de WhatsApp

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  instance_id TEXT,
  event_type TEXT NOT NULL,        -- 'message', 'sent', 'delivered', 'read', 'connected', 'disconnected', 'battery'
  from_number TEXT,                -- Número que envió el mensaje
  to_number TEXT,                  -- Número de la instancia
  message_type TEXT,               -- 'text', 'image', 'video', 'document', 'audio', 'location', 'button', 'reaction'
  body TEXT,                       -- Contenido del mensaje (texto)
  caption TEXT,                    -- Leyenda de media
  media_url TEXT,                  -- URL del archivo multimedia
  media_mime TEXT,                 -- MIME type del media
  raw_payload JSONB DEFAULT '{}',  -- Payload completo de Planifyx
  processed BOOLEAN DEFAULT false, -- Si ya fue procesado por chatbot/auto-responder
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_from ON whatsapp_messages(from_number, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_event ON whatsapp_messages(event_type, created_at DESC);
