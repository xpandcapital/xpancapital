-- Tabla de enlaces cortos

CREATE TABLE IF NOT EXISTS short_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  url_destino TEXT NOT NULL,
  creado_en TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_short_links_codigo ON short_links(codigo);

ALTER TABLE short_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "short_links_select" ON short_links FOR SELECT USING (true);
CREATE POLICY "short_links_insert" ON short_links FOR INSERT WITH CHECK (true);
