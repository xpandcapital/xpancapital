-- ============================================================================
-- MIGRACIÓN COMPLETA: TODAS LAS COLUMNAS FALTANTES EN TABLA PRODUCTOS
-- ============================================================================

-- Agregar TODAS las columnas faltantes en una sola migración
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS sku VARCHAR(100),
ADD COLUMN IF NOT EXISTS sku_prefix VARCHAR(10) DEFAULT 'SKU',
ADD COLUMN IF NOT EXISTS is_auto_sku BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS precio_comparacion DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS descuento_porcentaje DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS descuento_hasta DATE,
ADD COLUMN IF NOT EXISTS tipo_descuento VARCHAR(20) DEFAULT 'porcentaje' CHECK (tipo_descuento IN ('porcentaje', 'monto_fijo')),
ADD COLUMN IF NOT EXISTS stock_bajo_nivel INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS es_perecedero BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS fecha_compra DATE,
ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE,
ADD COLUMN IF NOT EXISTS manejo_perecedero VARCHAR(50),
ADD COLUMN IF NOT EXISTS lote_uid VARCHAR(100),
ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'activo', 'pausado', 'archivado'));

-- ============================================================================
-- VERIFICACIÓN: Mostrar todas las columnas de la tabla
-- ============================================================================
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'productos' 
ORDER BY ordinal_position;

-- ============================================================================
-- DATOS DE PRUEBA: Verificar que todo funciona
-- ============================================================================
-- Insertar un producto de prueba con todos los campos
INSERT INTO productos (
    empresa_id,
    nombre,
    slug,
    descripcion,
    precio_usd,
    precio_coins,
    tipo,
    stock,
    stock_ilimitado,
    activo,
    destacado,
    sku,
    sku_prefix,
    is_auto_sku,
    precio_comparacion,
    descuento_porcentaje,
    descuento_hasta,
    tipo_descuento,
    stock_bajo_nivel,
    es_perecedero,
    estado
) VALUES (
    '6186f014-c8c7-4027-9f08-8acf2bae3eae',
    'Producto de Prueba',
    'producto-prueba-migracion',
    'Producto creado para verificar la migración',
    100.00,
    500,
    'digital',
    10,
    false,
    false,
    false,
    'TEST-001',
    'TEST',
    true,
    120.00,
    20.00,
    '2026-12-31',
    'porcentaje',
    5,
    false,
    'borrador'
) ON CONFLICT DO NOTHING;

-- Verificar el producto de prueba
SELECT id, nombre, sku, estado, descuento_porcentaje, tipo_descuento 
FROM productos 
WHERE slug = 'producto-prueba-migracion';

-- Borrar el producto de prueba
DELETE FROM productos WHERE slug = 'producto-prueba-migracion';
