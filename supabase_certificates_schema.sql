-- ═══════════════════════════════════════════════════════════════════════════════
-- CERTIFICATE TEMPLATES - Plantillas configurables para certificados
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE certificado_plantillas (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id            UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    nombre                TEXT NOT NULL,
    descripcion          TEXT,
    
    -- Dimensiones del certificado (en mm)
    ancho                 DECIMAL(6,2) DEFAULT 297,  -- A4 landscape width
    alto                  DECIMAL(6,2) DEFAULT 210,  -- A4 landscape height
    
    -- Colores principales
    color_fondo           TEXT DEFAULT '#0a0a0a',
    color_primario        TEXT DEFAULT '#B10D24',
    color_secundario      TEXT DEFAULT '#10B981',
    color_texto           TEXT DEFAULT '#ffffff',
    color_texto_secundario TEXT DEFAULT '#9ca3af',
    
    -- Fuente
    fuente_titulo         TEXT DEFAULT 'Inter',
    fuente_cuerpo         TEXT DEFAULT 'Inter',
    tamano_titulo         INTEGER DEFAULT 48,
    tamano_cuerpo         INTEGER DEFAULT 16,
    
    -- Posiciones (porcentaje del ancho/alto, 0-100)
    posicion_nombre       JSONB DEFAULT '{"x": 50, "y": 45}',        -- Porcentaje
    posicion_curso        JSONB DEFAULT '{"x": 50, "y": 55}',
    posicion_fecha        JSONB DEFAULT '{"x": 30, "y": 80}',
    posicion_codigo       JSONB DEFAULT '{"x": 85, "y": 90}',
    posicion_logo         JSONB DEFAULT '{"x": 50, "y": 15}',
    posicion_firma        JSONB DEFAULT '{"x": 70, "y": 75}',
    
    -- Imágenes (URLs)
    logo_url              TEXT,
    fondo_url              TEXT,
    sello_url              TEXT,
    firma_url              TEXT,
    
    -- Textos configurables
    texto_titulo          TEXT DEFAULT 'CERTIFICADO',
    texto_subtitulo       TEXT DEFAULT 'Se certifica que',
    texto_completado      TEXT DEFAULT 'ha completado satisfactoriamente el curso',
    texto_fecha           TEXT DEFAULT 'Fecha de emisión',
    texto_firma           TEXT DEFAULT 'Director Académico',
    
    activo                BOOLEAN DEFAULT true,
    
    creado_en            TIMESTAMPTZ DEFAULT now(),
    actualizado_en       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_certificado_plantillas_empresa ON certificado_plantillas(empresa_id);

-- Tabla para certificados emitidos con su diseño específico
CREATE TABLE certificados (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id               UUID REFERENCES profiles(id) ON DELETE CASCADE,
    curso_id              UUID REFERENCES cursos(id) ON DELETE SET NULL,
    plantilla_id         UUID REFERENCES certificado_plantillas(id) ON DELETE SET NULL,
    
    nombre                TEXT NOT NULL,
    fecha_emision        TIMESTAMPTZ DEFAULT now(),
    codigo_verificacion   TEXT UNIQUE,
    archivo_url           TEXT,           -- URL del PDF generado
    
    -- Datos del curso al momento de emitir (para historial)
    curso_nombre          TEXT,
    horas                 INTEGER DEFAULT 0,
    
    creado_en            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_certificados_user ON certificados(user_id);
CREATE INDEX idx_certificados_curso ON certificados(curso_id);
CREATE INDEX idx_certificados_codigo ON certificados(codigo_verificacion);

-- Función para generar código de verificación único
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
        IF NOT exists THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar código automáticamente
CREATE OR REPLACE FUNCTION set_certificado_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo_verificacion IS NULL THEN
        NEW.codigo_verificacion := generate_certificado_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_certificado_code
    BEFORE INSERT ON certificados
    FOR EACH ROW EXECUTE FUNCTION set_certificado_code();

-- Insertar plantilla por defecto
INSERT INTO certificado_plantillas (empresa_id, nombre, descripcion)
VALUES (
    '6186f014-c8c7-4027-9f08-8acf2bae3eae',
    'Certificado BLIS Corp - Default',
    'Plantilla por defecto para certificados de BLIS Corp'
);