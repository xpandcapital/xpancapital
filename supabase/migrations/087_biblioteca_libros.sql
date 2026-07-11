-- 087: Tabla de libros para la biblioteca digital
CREATE TABLE IF NOT EXISTS biblioteca_libros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid DEFAULT '6186f014-c8c7-4027-9f08-8acf2bae3eae',
  titulo text NOT NULL,
  autor text DEFAULT 'Blis Editorial',
  categoria text DEFAULT 'General',
  portada_url text,
  descripcion text,
  download_link text,
  is_featured boolean DEFAULT false,
  activo boolean DEFAULT true,
  orden int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_biblioteca_libros_empresa ON biblioteca_libros(empresa_id);
CREATE INDEX IF NOT EXISTS idx_biblioteca_libros_activo ON biblioteca_libros(activo);
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_biblioteca_libros_categoria ON biblioteca_libros(categoria); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- RLS — público puede leer, solo admin puede modificar
ALTER TABLE biblioteca_libros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "biblioteca_libros_select_public" ON biblioteca_libros;
CREATE POLICY "biblioteca_libros_select_public"
  ON biblioteca_libros FOR SELECT
  USING (activo = true);

DROP POLICY IF EXISTS "biblioteca_libros_admin_all" ON biblioteca_libros;
CREATE POLICY "biblioteca_libros_admin_all"
  ON biblioteca_libros FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.rol IN ('admin', 'superadmin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.rol IN ('admin', 'superadmin', 'editor')
    )
  );

-- Función RPC para admin obtener todos (incluyendo inactivos)
CREATE OR REPLACE FUNCTION get_biblioteca_libros_admin()
RETURNS SETOF biblioteca_libros
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT * FROM biblioteca_libros ORDER BY orden ASC, created_at DESC;
$$;
