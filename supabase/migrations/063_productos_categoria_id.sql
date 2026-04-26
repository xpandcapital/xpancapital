-- ============================================================================
-- MIGRACIÓN: AGREGAR categoria_id A productos
-- ============================================================================

-- Agregar columna categoria_id a productos si no existe
ALTER TABLE productos ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES producto_categorias(id);

-- Crear índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'productos' AND column_name = 'categoria_id';
