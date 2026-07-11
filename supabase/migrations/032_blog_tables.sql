-- Blog tables for WordPress import

CREATE TABLE IF NOT EXISTS blog_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id),
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE,
  descripcion TEXT,
  creado_en TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id),
  titulo TEXT NOT NULL,
  slug TEXT UNIQUE,
  contenido TEXT,
  extracto TEXT,
  imagen_destacada TEXT,
  categoria TEXT,
  tags TEXT[],
  autor TEXT,
  estado TEXT DEFAULT 'borrador',
  publicado_en TIMESTAMPTZ,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now(),
  wp_id INTEGER
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_empresa ON blog_posts(empresa_id);
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_blog_posts_categoria ON blog_posts(categoria); EXCEPTION WHEN OTHERS THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_blog_posts_estado ON blog_posts(estado);
CREATE INDEX IF NOT EXISTS idx_blog_posts_publicado ON blog_posts(publicado_en DESC);
CREATE INDEX IF NOT EXISTS idx_blog_categorias_empresa ON blog_categorias(empresa_id);

-- RLS Policies
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_posts_select" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "blog_posts_insert" ON blog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "blog_posts_update" ON blog_posts FOR UPDATE USING (true);
CREATE POLICY "blog_posts_delete" ON blog_posts FOR DELETE USING (true);

CREATE POLICY "blog_categorias_select" ON blog_categorias FOR SELECT USING (true);
CREATE POLICY "blog_categorias_insert" ON blog_categorias FOR INSERT WITH CHECK (true);
CREATE POLICY "blog_categorias_update" ON blog_categorias FOR UPDATE USING (true);
CREATE POLICY "blog_categorias_delete" ON blog_categorias FOR DELETE USING (true);