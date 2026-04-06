-- ═══════════════════════════════════════════════════════════════════════════════
-- BLIS CORP - TABLA producto_categorias
-- ═══════════════════════════════════════════════════════════════════════════════

-- Crear tabla producto_categorias
CREATE TABLE IF NOT EXISTS producto_categorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    color VARCHAR(20) DEFAULT '#71717a',
    sku_prefix VARCHAR(10) DEFAULT 'SKU',
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(empresa_id, slug)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_producto_categorias_empresa ON producto_categorias(empresa_id);
CREATE INDEX IF NOT EXISTS idx_producto_categorias_orden ON producto_categorias(empresa_id, orden);

-- Insertar categorías por defecto
INSERT INTO producto_categorias (empresa_id, nombre, slug, sku_prefix, orden) VALUES
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Capacitaciones', 'capacitaciones', 'CAP', 0),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Ebooks', 'ebooks', 'EBK', 1),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Cursos', 'cursos', 'CUR', 2),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Membresías', 'membresias', 'MEM', 3),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Plantillas', 'plantillas', 'PLT', 4)
ON CONFLICT (empresa_id, slug) DO NOTHING;

-- RLS
ALTER TABLE producto_categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica producto_categorias" ON producto_categorias FOR SELECT USING (true);
CREATE POLICY "Escritura autenticada producto_categorias" ON producto_categorias FOR ALL USING (auth.role() = 'authenticated');

-- Trigger para actualizar actualizado_en
CREATE OR REPLACE FUNCTION update_producto_categorias_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trig_producto_categorias_timestamp ON producto_categorias;
CREATE TRIGGER trig_producto_categorias_timestamp
    BEFORE UPDATE ON producto_categorias
    FOR EACH ROW
    EXECUTE FUNCTION update_producto_categorias_timestamp();