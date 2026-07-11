-- Tabla de medios/imágenes de la empresa
CREATE TABLE IF NOT EXISTS email_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  url TEXT NOT NULL,
  tipo TEXT DEFAULT 'image', -- image, gif, video, icon
  categoria TEXT DEFAULT 'general', -- logo, producto, equipo, banner, icon, etc.
  tamano INTEGER, -- bytes
  ancho INTEGER,
  alto INTEGER,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_email_media_empresa ON email_media(empresa_id);
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_email_media_categoria ON email_media(categoria); EXCEPTION WHEN OTHERS THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_email_media_tipo ON email_media(tipo);

-- Row Level Security
ALTER TABLE email_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus medios" ON email_media
  FOR SELECT USING (empresa_id::text = current_setting('request.jwt.claims->>empresa_id', true));

CREATE POLICY "Usuarios pueden crear medios" ON email_media
  FOR INSERT WITH CHECK (empresa_id::text = current_setting('request.jwt.claims->>empresa_id', true));

CREATE POLICY "Usuarios pueden actualizar sus medios" ON email_media
  FOR UPDATE USING (empresa_id::text = current_setting('request.jwt.claims->>empresa_id', true));

CREATE POLICY "Usuarios pueden eliminar sus medios" ON email_media
  FOR DELETE USING (empresa_id::text = current_setting('request.jwt.claims->>empresa_id', true));