-- 124: Reparar RLS de profiles (recursión infinita) + FK productos.categoria_id
-- ---------------------------------------------------------------------------
-- PROBLEMA: Las políticas actuales en profiles generan recursión infinita
-- porque referencian profiles dentro de subconsultas sin protección.
-- SOLUCIÓN: SECURITY DEFINER helpers que evitan la recursión.
-- También: agregar FK y grants faltantes para producto_categorias.

-- 1. HELPERS SECURITY DEFINER (sin tocar profiles directamente en políticas)
CREATE OR REPLACE FUNCTION public.mi_empresa_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.mi_rol()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT rol FROM public.profiles WHERE id = auth.uid()
$$;

-- 2. DESACTIVAR + REACTIVAR RLS (fuerza limpiar cache de políticas)
DO $$
DECLARE
  pol RECORD;
BEGIN
  -- Dropear TODAS las políticas existentes sobre profiles
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

-- Re-activar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. NUEVAS POLÍTICAS SEGURAS (sin recursión)
-- Lectura: cada usuario ve su propio perfil (usando función helper)
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

-- Admins pueden ver todos los de su empresa (consulta directa sin recursión via helper)
CREATE POLICY "profiles_select_empresa" ON public.profiles
  FOR SELECT
  USING (
    mi_rol() IN ('superadmin', 'admin')
    AND empresa_id = mi_empresa_id()
  );

-- Inserción: debe ser el mismo usuario
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Actualización: solo el propio perfil
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Superadmin/Admin pueden actualizar perfiles de su empresa
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE
  USING (
    mi_rol() IN ('superadmin', 'admin')
    AND empresa_id = mi_empresa_id()
  )
  WITH CHECK (
    mi_rol() IN ('superadmin', 'admin')
    AND empresa_id = mi_empresa_id()
  );

-- Borrado: solo admins de la misma empresa
CREATE POLICY "profiles_delete_admin" ON public.profiles
  FOR DELETE
  USING (
    mi_rol() IN ('superadmin', 'admin')
    AND empresa_id = mi_empresa_id()
  );

-- 4. FK faltante: productos.categoria_id → producto_categorias
ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS categoria_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_productos_categoria'
      AND conrelid = 'public.productos'::regclass
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
    WHERE c.conrelid = 'public.productos'::regclass
      AND c.contype = 'f'
      AND a.attname = 'categoria_id'
  ) THEN
    ALTER TABLE public.productos
      ADD CONSTRAINT fk_productos_categoria
      FOREIGN KEY (categoria_id) REFERENCES public.producto_categorias(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_productos_categoria_id_fk
  ON public.productos(categoria_id);

-- 5. GRANTS para que anon/authenticated puedan leer producto_categorias
GRANT SELECT ON public.producto_categorias TO anon;
GRANT SELECT ON public.producto_categorias TO authenticated;

ALTER TABLE public.producto_categorias ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública para categorías de productos
DROP POLICY IF EXISTS "producto_categorias_public_read" ON public.producto_categorias;
CREATE POLICY "producto_categorias_public_read" ON public.producto_categorias
  FOR SELECT
  USING (true);

-- 6. Notificar a PostgREST para recargar el cache de esquema
NOTIFY pgrst, 'reload schema';
