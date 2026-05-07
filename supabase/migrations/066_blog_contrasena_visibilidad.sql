-- Agregar columnas de contraseña y visibilidad a blog_posts

ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS contrasena TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS visibilidad TEXT DEFAULT 'publico';
