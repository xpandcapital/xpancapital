-- Migración: 106_comunidad_media_audio.sql
-- Agrega 'audio' al check constraint de comunidad_post_media.tipo

ALTER TABLE comunidad_post_media DROP CONSTRAINT IF EXISTS comunidad_post_media_tipo_check;
ALTER TABLE comunidad_post_media ADD CONSTRAINT comunidad_post_media_tipo_check CHECK (tipo IN ('imagen','video','audio','archivo'));
