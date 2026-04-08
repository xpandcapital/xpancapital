-- Verificar qué columnas existen actualmente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'productos' 
ORDER BY ordinal_position;

-- Agregar columnas faltantes si no existen
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS descuento_porcentaje DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS descuento_hasta DATE,
ADD COLUMN IF NOT EXISTS tipo_descuento VARCHAR(20) DEFAULT 'porcentaje',
ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'borrador',
ADD COLUMN IF NOT EXISTS precio_comparacion DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS stock_bajo_nivel INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS es_perecedero BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS fecha_compra DATE,
ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE,
ADD COLUMN IF NOT EXISTS manejo_perecedero VARCHAR(50),
ADD COLUMN IF NOT EXISTS lote_uid VARCHAR(100),
ADD COLUMN IF NOT EXISTS sku VARCHAR(100),
ADD COLUMN IF NOT EXISTS sku_prefix VARCHAR(10),
ADD COLUMN IF NOT EXISTS is_auto_sku BOOLEAN DEFAULT true;

-- Verificar que todas las columnas se agregaron
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'productos' 
ORDER BY ordinal_position;
