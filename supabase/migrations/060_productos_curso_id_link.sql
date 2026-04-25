-- Migration: 060_productos_curso_id_link.sql
-- Objetivo: Vincular productos de tipo 'servicio' (cursos) con su registro en la tabla cursos
-- Esto permite que el checkout auto-asigne correctamente los cursos comprados por BLIS Coins

-- 1. Agregar columna curso_id a productos
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS curso_id UUID REFERENCES cursos(id) ON DELETE SET NULL;

-- 2. Agregar índice para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_productos_curso_id ON productos(curso_id) WHERE curso_id IS NOT NULL;

-- 3. Comentario para documentación
COMMENT ON COLUMN productos.curso_id IS 'FK a cursos.id - Usado en checkout para auto-asignar cursos comprados';

-- 4. Actualizar productos existentes que sean cursos para vincularlos
-- Esto busca productos cuyo nombre coincida con un curso y los vincula automáticamente
UPDATE productos p
SET curso_id = c.id
FROM cursos c
WHERE p.tipo = 'servicio'
  AND p.curso_id IS NULL
  AND (
    -- Coincidencia por slug
    p.slug = c.slug
    -- O coincidencia por nombre (case insensitive)
    OR LOWER(TRIM(p.nombre)) = LOWER(TRIM(c.nombre))
  );
