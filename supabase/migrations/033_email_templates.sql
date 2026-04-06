-- Tabla para plantillas de correo
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  settings JSONB DEFAULT '{}',
  blocks JSONB DEFAULT '[]',
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- Tabla para paletas de color por empresa
CREATE TABLE IF NOT EXISTS email_palettes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  body_bg TEXT DEFAULT '#F3F4F6',
  container_bg TEXT DEFAULT '#FFFFFF',
 text TEXT DEFAULT '#333333',
  primary_color TEXT DEFAULT '#e11d48',
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_email_templates_empresa ON email_templates(empresa_id);
CREATE INDEX IF NOT EXISTS idx_email_palettes_empresa ON email_palettes(empresa_id);

-- Datos iniciales de paletas por defecto
INSERT INTO email_palettes (empresa_id, nombre, body_bg, container_bg, text, primary_color)
SELECT 
  id,
  'BlisCorp Oscuro',
  '#181818',
  '#181818',
  '#e5e7eb',
  '#e11d48'
FROM empresas
WHERE NOT EXISTS (
  SELECT 1 FROM email_palettes WHERE nombre = 'BlisCorp Oscuro'
);

INSERT INTO email_palettes (empresa_id, nombre, body_bg, container_bg, text, primary_color)
SELECT 
  id,
  'BlisCorp Claro',
  '#F3F4F6',
  '#FFFFFF',
  '#333333',
  '#e11d48'
FROM empresas
WHERE NOT EXISTS (
  SELECT 1 FROM email_palettes WHERE nombre = 'BlisCorp Claro'
);