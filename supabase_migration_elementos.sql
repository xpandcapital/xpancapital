-- Agregar columna para guardar configuración de elementos
ALTER TABLE certificado_plantillas ADD COLUMN IF NOT EXISTS elementos JSONB DEFAULT '[]';

-- Actualizar la función de conversión para usar los elementos guardados
COMMENT ON COLUMN certificado_plantillas.elementos IS 'Array de elementos con posición, tamaño y estilo exactos';