-- Agregar columna para desactivar recompensa de coins por lectura

ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS sin_recompensa BOOLEAN DEFAULT false;
