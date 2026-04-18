-- Migration 048: Add certificado_template_id to cursos, create certificado_plantillas table
-- These are required for the course editor certificate template feature

-- 1. Create certificado_plantillas table
CREATE TABLE IF NOT EXISTS certificado_plantillas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  fondo_url TEXT,
  fuente_titulo TEXT DEFAULT 'Montserrat',
  fuente_cuerpo TEXT DEFAULT 'Montserrat',
  color_titulo TEXT DEFAULT '#ffffff',
  color_cuerpo TEXT DEFAULT '#ffffff',
  tamano_titulo INTEGER DEFAULT 48,
  tamano_cuerpo INTEGER DEFAULT 20,
  orientacion TEXT DEFAULT 'landscape' CHECK (orientacion IN ('landscape', 'portrait')),
  posicion_x DECIMAL(5,2) DEFAULT 50,
  posicion_y DECIMAL(5,2) DEFAULT 50,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- 2. Add certificado_template_id to cursos
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS certificado_template_id UUID REFERENCES certificado_plantillas(id) ON DELETE SET NULL;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_certificado_plantillas_empresa ON certificado_plantillas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_cursos_certificado_template ON cursos(certificado_template_id);