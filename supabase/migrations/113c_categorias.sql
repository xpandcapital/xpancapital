-- Migración: 113c_categorias.sql
ALTER TABLE whatsapp_campaigns ADD COLUMN IF NOT EXISTS categoria TEXT;
ALTER TABLE whatsapp_variable_templates ADD COLUMN IF NOT EXISTS categoria TEXT;
ALTER TABLE whatsapp_message_templates ADD COLUMN IF NOT EXISTS categoria TEXT;
ALTER TABLE whatsapp_phone_lists ADD COLUMN IF NOT EXISTS categoria TEXT;
