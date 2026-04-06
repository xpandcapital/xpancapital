-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Agregar tabla certificado_plantillas
-- ═══════════════════════════════════════════════════════════════════════════════

-- Crear tabla de plantillas (si no existe)
CREATE TABLE IF NOT EXISTS certificado_plantillas (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id            UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    nombre                TEXT NOT NULL,
    descripcion          TEXT,
    
    ancho                 DECIMAL(6,2) DEFAULT 297,
    alto                  DECIMAL(6,2) DEFAULT 210,
    
    color_fondo           TEXT DEFAULT '#0a0a0a',
    color_primario        TEXT DEFAULT '#B10D24',
    color_secundario      TEXT DEFAULT '#10B981',
    color_texto           TEXT DEFAULT '#ffffff',
    color_texto_secundario TEXT DEFAULT '#9ca3af',
    
    fuente_titulo         TEXT DEFAULT 'Inter',
    fuente_cuerpo         TEXT DEFAULT 'Inter',
    tamano_titulo         INTEGER DEFAULT 48,
    tamano_cuerpo         INTEGER DEFAULT 16,
    
    posicion_nombre       JSONB DEFAULT '{"x": 50, "y": 45}',
    posicion_curso        JSONB DEFAULT '{"x": 50, "y": 55}',
    posicion_fecha        JSONB DEFAULT '{"x": 30, "y": 80}',
    posicion_codigo       JSONB DEFAULT '{"x": 85, "y": 90}',
    posicion_logo         JSONB DEFAULT '{"x": 50, "y": 15}',
    posicion_firma        JSONB DEFAULT '{"x": 70, "y": 75}',
    
    logo_url              TEXT,
    fondo_url             TEXT,
    sello_url             TEXT,
    firma_url             TEXT,
    
    texto_titulo          TEXT DEFAULT 'CERTIFICADO',
    texto_subtitulo       TEXT DEFAULT 'Se certifica que',
    texto_completado      TEXT DEFAULT 'ha completado satisfactoriamente el curso',
    texto_fecha           TEXT DEFAULT 'Fecha de emisión',
    texto_firma           TEXT DEFAULT 'Director Académico',
    
    activo                BOOLEAN DEFAULT true,
    
    creado_en            TIMESTAMPTZ DEFAULT now(),
    actualizado_en       TIMESTAMPTZ DEFAULT now()
);

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_certificado_plantillas_empresa ON certificado_plantillas(empresa_id);

-- Agregar columna plantilla_id a certificados (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'certificados' AND column_name = 'plantilla_id'
    ) THEN
        ALTER TABLE certificados ADD COLUMN plantilla_id UUID REFERENCES certificado_plantillas(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Agregar columnas faltantes a certificados (si no existen)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'certificados' AND column_name = 'curso_nombre'
    ) THEN
        ALTER TABLE certificados ADD COLUMN curso_nombre TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'certificados' AND column_name = 'horas'
    ) THEN
        ALTER TABLE certificados ADD COLUMN horas INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'certificados' AND column_name = 'archivo_url'
    ) THEN
        ALTER TABLE certificados ADD COLUMN archivo_url TEXT;
    END IF;
END $$;

-- Crear índices en certificados (si no existen)
CREATE INDEX IF NOT EXISTS idx_certificados_user ON certificados(user_id);
CREATE INDEX IF NOT EXISTS idx_certificados_curso ON certificados(curso_id);
CREATE INDEX IF NOT EXISTS idx_certificados_codigo ON certificados(codigo_verificacion);

-- Función para generar código único (crear o reemplazar)
CREATE OR REPLACE FUNCTION generate_certificado_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        code := 'CERT-' || upper(substring(md5(random()::text) from 1 for 4)) || '-' || 
                upper(substring(md5(random()::text) from 1 for 4)) || '-' ||
                upper(substring(md5(random()::text) from 1 for 4));
        
        SELECT EXISTS(SELECT 1 FROM certificados WHERE codigo_verificacion = code) INTO exists;
        IF NOT exists THEN RETURN code; END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger para código automático (crear o reemplazar)
CREATE OR REPLACE FUNCTION set_certificado_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo_verificacion IS NULL THEN
        NEW.codigo_verificacion := generate_certificado_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_certificado_code'
    ) THEN
        CREATE TRIGGER trigger_certificado_code
            BEFORE INSERT ON certificados
            FOR EACH ROW EXECUTE FUNCTION set_certificado_code();
    END IF;
END $$;

-- Habilitar RLS en plantillas
ALTER TABLE certificado_plantillas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para plantillas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy WHERE polname = 'Plantillas visibles para todos'
    ) THEN
        CREATE POLICY "Plantillas visibles para todos" ON certificado_plantillas
            FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy WHERE polname = 'Admins pueden gestionar plantillas'
    ) THEN
        CREATE POLICY "Admins pueden gestionar plantillas" ON certificado_plantillas
            FOR ALL USING (
                EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin', 'superadmin'))
            );
    END IF;
END $$;

-- Insertar plantilla por defecto (si no existe)
INSERT INTO certificado_plantillas (empresa_id, nombre, descripcion)
SELECT '6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Certificado BLIS Corp - Default', 'Plantilla por defecto'
WHERE NOT EXISTS (
    SELECT 1 FROM certificado_plantillas WHERE nombre = 'Certificado BLIS Corp - Default'
);

-- Mensaje de éxito
SELECT 'Migración completada exitosamente' as status;