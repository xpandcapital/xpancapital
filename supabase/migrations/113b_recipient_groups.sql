-- Agregar columnas para soportar multi-mensaje por recipiente
ALTER TABLE whatsapp_campaign_recipients ADD COLUMN IF NOT EXISTS group_index INTEGER DEFAULT 0;
ALTER TABLE whatsapp_campaign_recipients ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE whatsapp_campaign_recipients ADD COLUMN IF NOT EXISTS filename TEXT;
