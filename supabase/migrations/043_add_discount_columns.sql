-- Agregar columnas faltantes para descuentos en productos
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS descuento_hasta DATE,
ADD COLUMN IF NOT EXISTS tipo_descuento VARCHAR(20) DEFAULT 'porcentaje' CHECK (tipo_descuento IN ('porcentaje', 'monto_fijo'));

-- Verificar columnas existentes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'productos'
AND column_name IN ('descuento_porcentaje', 'descuento_hasta', 'tipo_descuento', 'precio_comparacion', 'estado')
ORDER BY ordinal_position;

-- Actualizar productos existentes para tener estado por defecto
UPDATE productos SET estado = 'activo' WHERE estado IS NULL;
