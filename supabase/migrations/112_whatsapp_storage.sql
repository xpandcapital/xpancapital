-- Migración: 112_whatsapp_storage.sql
-- Bucket de Supabase Storage para imágenes/media de campañas WhatsApp

-- Crear bucket (debe ejecutarse desde el dashboard de Supabase si no existe)
-- En SQL Editor de Supabase:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('whatsapp-media', 'whatsapp-media', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir lectura pública
DROP POLICY IF EXISTS "WhatsApp Media Public Read" ON storage.objects;
CREATE POLICY "WhatsApp Media Public Read" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'whatsapp-media');

-- Política para permitir inserción por usuarios autenticados
DROP POLICY IF EXISTS "WhatsApp Media Auth Insert" ON storage.objects;
CREATE POLICY "WhatsApp Media Auth Insert" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'whatsapp-media' AND auth.role() = 'authenticated');

-- Política para permitir eliminación por el creador
DROP POLICY IF EXISTS "WhatsApp Media Owner Delete" ON storage.objects;
CREATE POLICY "WhatsApp Media Owner Delete" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'whatsapp-media' AND owner = auth.uid());
