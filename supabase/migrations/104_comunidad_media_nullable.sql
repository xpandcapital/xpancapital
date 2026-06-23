-- Migración: 104_comunidad_media_nullable.sql
-- Permite que comunidad_post_media se cree sin post_id (post aún no existe al subir)
ALTER TABLE comunidad_post_media ALTER COLUMN post_id DROP NOT NULL;
