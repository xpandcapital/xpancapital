-- ═══════════════════════════════════════════════════════════════════════════════
-- XPAND CORP - TABLAS PARA CONTEXTOS
-- Ejecutar BLOQUE POR BLOQUE en Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

-- BLOQUE 1: producto_estados
CREATE TABLE IF NOT EXISTS producto_estados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    color VARCHAR(20) DEFAULT '#71717a',
    icono VARCHAR(50),
    descripcion TEXT,
    orden INTEGER DEFAULT 0,
    es_default BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(empresa_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_producto_estados_empresa ON producto_estados(empresa_id);
CREATE INDEX IF NOT EXISTS idx_producto_estados_orden ON producto_estados(empresa_id, orden);

INSERT INTO producto_estados (empresa_id, nombre, slug, color, orden, es_default) VALUES
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Disponible', 'disponible', '#10b981', 0, true),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Bajo Stock', 'bajo-stock', '#f59e0b', 1, false),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Agotado', 'agotado', '#ef4444', 2, false),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Ilimitado', 'ilimitado', '#06b6d4', 3, false),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Pre-venta', 'pre-venta', '#3b82f6', 4, false)
ON CONFLICT (empresa_id, slug) DO NOTHING;

-- BLOQUE 2: unidades_medida
CREATE TABLE IF NOT EXISTS unidades_medida (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(50) NOT NULL,
    abreviatura VARCHAR(10) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('weight', 'volume', 'quantity', 'distance', 'other')),
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(empresa_id, abreviatura)
);

CREATE INDEX IF NOT EXISTS idx_unidades_medida_empresa ON unidades_medida(empresa_id);
CREATE INDEX IF NOT EXISTS idx_unidades_medida_orden ON unidades_medida(empresa_id, orden);

INSERT INTO unidades_medida (empresa_id, nombre, abreviatura, tipo, orden) VALUES
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Unidades', 'un.', 'quantity', 0),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Kilogramos', 'kg', 'weight', 1),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Gramos', 'g', 'weight', 2),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Litros', 'L', 'volume', 3),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Mililitros', 'ml', 'volume', 4),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Metros', 'm', 'distance', 5)
ON CONFLICT (empresa_id, abreviatura) DO NOTHING;

-- BLOQUE 3: sku_patrones
CREATE TABLE IF NOT EXISTS sku_patrones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    prefijo VARCHAR(10) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(empresa_id, prefijo)
);

CREATE INDEX IF NOT EXISTS idx_sku_patrones_empresa ON sku_patrones(empresa_id);

INSERT INTO sku_patrones (empresa_id, nombre, prefijo, orden) VALUES
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Promocion Especial', 'PRO', 0),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Liquidacion', 'LIQ', 1),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Exclusivo', 'EXC', 2)
ON CONFLICT (empresa_id, prefijo) DO NOTHING;

-- BLOQUE 4: empresa_config extension
ALTER TABLE empresa_config ADD COLUMN IF NOT EXISTS enable_perishables BOOLEAN DEFAULT true;
ALTER TABLE empresa_config ADD COLUMN IF NOT EXISTS enable_serialization BOOLEAN DEFAULT true;
ALTER TABLE empresa_config ADD COLUMN IF NOT EXISTS enable_shipping BOOLEAN DEFAULT true;
ALTER TABLE empresa_config ADD COLUMN IF NOT EXISTS business_type VARCHAR(20) DEFAULT 'physical';

-- BLOQUE 5: envio_zonas
CREATE TABLE IF NOT EXISTS envio_zonas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    regiones TEXT[] NOT NULL,
    precio_base DECIMAL(10, 2) NOT NULL DEFAULT 0,
    precio_por_gramo DECIMAL(10, 4) DEFAULT 0.002,
    dias_estimados VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_envio_zonas_empresa ON envio_zonas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_envio_zonas_orden ON envio_zonas(empresa_id, orden);

INSERT INTO envio_zonas (empresa_id, nombre, regiones, precio_base, precio_por_gramo, dias_estimados, orden) VALUES
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Local (Urbano)', ARRAY['Local'], 8, 0.002, '1-2', 0),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Nacional (Standard)', ARRAY['Nacional'], 15, 0.005, '2-4', 1),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Selva / Extremo', ARRAY['Selva', 'Extremo'], 25, 0.009, '5-8', 2)
ON CONFLICT DO NOTHING;

-- BLOQUE 6: monedas_config
CREATE TABLE IF NOT EXISTS monedas_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    moneda_base VARCHAR(10) NOT NULL DEFAULT 'USD',
    monedas_activas TEXT[] DEFAULT ARRAY['USD', 'PEN', 'MXN', 'EUR'],
    margen_seguridad DECIMAL(4, 4) DEFAULT 0.02,
    actualizar_automaticamente BOOLEAN DEFAULT true,
    ultima_actualizacion TIMESTAMPTZ,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(empresa_id)
);

CREATE TABLE IF NOT EXISTS tasas_cambio (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    moneda_origen VARCHAR(10) NOT NULL,
    moneda_destino VARCHAR(10) NOT NULL,
    tasa DECIMAL(20, 10) NOT NULL,
    fuente VARCHAR(50) DEFAULT 'manual',
    actualizado_en TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(empresa_id, moneda_origen, moneda_destino)
);

CREATE INDEX IF NOT EXISTS idx_monedas_config_empresa ON monedas_config(empresa_id);
CREATE INDEX IF NOT EXISTS idx_tasas_cambio_empresa ON tasas_cambio(empresa_id);

INSERT INTO monedas_config (empresa_id, moneda_base, monedas_activas) VALUES
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'USD', ARRAY['USD', 'PEN', 'MXN', 'EUR'])
ON CONFLICT (empresa_id) DO NOTHING;

-- BLOQUE 7: carritos
CREATE TABLE IF NOT EXISTS carritos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    items JSONB NOT NULL DEFAULT '[]',
    total DECIMAL(12, 2) DEFAULT 0,
    subtotal DECIMAL(12, 2) DEFAULT 0,
    impuesto DECIMAL(12, 2) DEFAULT 0,
    descuento_global DECIMAL(12, 2) DEFAULT 0,
    tipo_descuento VARCHAR(20) DEFAULT 'fixed' CHECK (tipo_descuento IN ('fixed', 'percent')),
    codigo_cupon VARCHAR(50),
    costo_envio DECIMAL(12, 2) DEFAULT 0,
    cliente_data JSONB,
    tipo_transaccion VARCHAR(20) DEFAULT 'venta' CHECK (tipo_transaccion IN ('venta', 'cotizacion')),
    tipo_documento VARCHAR(20) DEFAULT 'ticket' CHECK (tipo_documento IN ('ticket', 'boleta', 'factura')),
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(empresa_id, user_id)
);

CREATE TABLE IF NOT EXISTS carrito_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    carrito_id UUID NOT NULL REFERENCES carritos(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(12, 2) NOT NULL,
    descuento DECIMAL(12, 2) DEFAULT 0,
    tipo_descuento VARCHAR(20) DEFAULT 'fixed' CHECK (tipo_descuento IN ('fixed', 'percent')),
    metadata JSONB,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carritos_usuario ON carritos(user_id);
CREATE INDEX IF NOT EXISTS idx_carritos_empresa ON carritos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_carrito_items_carrito ON carrito_items(carrito_id);

-- BLOQUE 8: landing_secciones y usuario_preferencias
CREATE TABLE IF NOT EXISTS landing_secciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    seccion VARCHAR(50) NOT NULL,
    contenido JSONB NOT NULL DEFAULT '{}',
    actualizado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_por UUID REFERENCES profiles(id),
    UNIQUE(empresa_id, seccion)
);

CREATE TABLE IF NOT EXISTS usuario_preferencias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    tema VARCHAR(20) DEFAULT 'dark',
    idioma VARCHAR(10) DEFAULT 'es',
    moneda_preferida VARCHAR(10) DEFAULT 'USD',
    notificaciones_email BOOLEAN DEFAULT true,
    notificaciones_push BOOLEAN DEFAULT true,
    configuracion_etiquetas JSONB DEFAULT '{}',
    configuracion_pos JSONB DEFAULT '{}',
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_landing_secciones_empresa ON landing_secciones(empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuario_preferencias_usuario ON usuario_preferencias(user_id);

-- BLOQUE 9: historial_ventas_pos
CREATE TABLE IF NOT EXISTS historial_ventas_pos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'venta' CHECK (tipo IN ('venta', 'cotizacion')),
    tipo_documento VARCHAR(20) DEFAULT 'ticket' CHECK (tipo_documento IN ('ticket', 'boleta', 'factura')),
    cliente_data JSONB,
    items JSONB NOT NULL DEFAULT '[]',
    subtotal DECIMAL(12, 2) NOT NULL,
    impuesto DECIMAL(12, 2) DEFAULT 0,
    descuento DECIMAL(12, 2) DEFAULT 0,
    total DECIMAL(12, 2) NOT NULL,
    metodo_pago VARCHAR(20) DEFAULT 'cash' CHECK (metodo_pago IN ('cash', 'card', 'bliscoins', 'transfer')),
    estado VARCHAR(20) DEFAULT 'completada' CHECK (estado IN ('pendiente', 'completada', 'cancelada')),
    notas TEXT,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historial_ventas_empresa ON historial_ventas_pos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_historial_ventas_usuario ON historial_ventas_pos(user_id);
CREATE INDEX IF NOT EXISTS idx_historial_ventas_fecha ON historial_ventas_pos(creado_en DESC);

-- BLOQUE 10: RLS Policies
ALTER TABLE producto_estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades_medida ENABLE ROW LEVEL SECURITY;
ALTER TABLE sku_patrones ENABLE ROW LEVEL SECURITY;
ALTER TABLE envio_zonas ENABLE ROW LEVEL SECURITY;
ALTER TABLE monedas_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasas_cambio ENABLE ROW LEVEL SECURITY;
ALTER TABLE carritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrito_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_secciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario_preferencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_ventas_pos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica producto_estados" ON producto_estados FOR SELECT USING (true);
CREATE POLICY "Lectura publica unidades_medida" ON unidades_medida FOR SELECT USING (true);
CREATE POLICY "Lectura publica sku_patrones" ON sku_patrones FOR SELECT USING (true);
CREATE POLICY "Lectura publica envio_zonas" ON envio_zonas FOR SELECT USING (true);
CREATE POLICY "Lectura publica monedas_config" ON monedas_config FOR SELECT USING (true);
CREATE POLICY "Lectura publica tasas_cambio" ON tasas_cambio FOR SELECT USING (true);
CREATE POLICY "Lectura publica landing_secciones" ON landing_secciones FOR SELECT USING (true);

CREATE POLICY "Usuarios ven su carrito" ON carritos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios modifican su carrito" ON carritos FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuarios ven sus preferencias" ON usuario_preferencias FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios modifican sus preferencias" ON usuario_preferencias FOR ALL USING (auth.uid() = user_id);
