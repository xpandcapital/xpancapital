-- ============================================================
-- HOTFIX: Optimización crítica de chat - evita timeouts
-- Ejecutar todo de una vez en Supabase SQL Editor
-- ============================================================

-- 1) Índices críticos faltantes (la mayor causa de timeout)
CREATE INDEX IF NOT EXISTS idx_profiles_empresa_estado ON profiles(empresa_id, estado_chat);
CREATE INDEX IF NOT EXISTS idx_profiles_empresa_rol ON profiles(empresa_id, rol);
CREATE INDEX IF NOT EXISTS idx_chat_salas_empresa_tipo_estado ON chat_salas(empresa_id, tipo, estado);
CREATE INDEX IF NOT EXISTS idx_chat_visitantes_estado_empresa ON chat_visitantes(estado, empresa_id);

-- 2) Función helper más eficiente (cached per query, not per row)
-- Reemplazar user_empresa_id por una versión estable
CREATE OR REPLACE FUNCTION user_empresa_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT empresa_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION user_sala_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT sala_id FROM chat_miembros WHERE user_id = auth.uid();
$$;

-- 3) Simplificar políticas de chat_salas (sin subqueries anidados)
DROP POLICY IF EXISTS "chat_salas_select" ON chat_salas;
CREATE POLICY "chat_salas_select"
  ON chat_salas FOR SELECT
  USING (empresa_id = user_empresa_id());

DROP POLICY IF EXISTS "chat_salas_insert" ON chat_salas;
CREATE POLICY "chat_salas_insert"
  ON chat_salas FOR INSERT
  WITH CHECK (creado_por = auth.uid());

DROP POLICY IF EXISTS "chat_salas_update" ON chat_salas;
CREATE POLICY "chat_salas_update"
  ON chat_salas FOR UPDATE
  USING (empresa_id = user_empresa_id())
  WITH CHECK (empresa_id = user_empresa_id());

-- 4) Simplificar chat_miembros (la más lenta)
DROP POLICY IF EXISTS "chat_miembros_select" ON chat_miembros;
CREATE POLICY "chat_miembros_select"
  ON chat_miembros FOR SELECT
  USING (
    user_id = auth.uid()
    OR sala_id IN (SELECT user_sala_ids())
  );

DROP POLICY IF EXISTS "chat_miembros_insert" ON chat_miembros;
CREATE POLICY "chat_miembros_insert"
  ON chat_miembros FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "chat_miembros_update" ON chat_miembros;
CREATE POLICY "chat_miembros_update"
  ON chat_miembros FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 5) Simplificar chat_mensajes (más rápida)
DROP POLICY IF EXISTS "chat_mensajes_select" ON chat_mensajes;
CREATE POLICY "chat_mensajes_select"
  ON chat_mensajes FOR SELECT
  USING (sala_id IN (SELECT user_sala_ids()));

DROP POLICY IF EXISTS "chat_mensajes_insert" ON chat_mensajes;
CREATE POLICY "chat_mensajes_insert"
  ON chat_mensajes FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "chat_mensajes_update" ON chat_mensajes;
CREATE POLICY "chat_mensajes_update"
  ON chat_mensajes FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 6) Política eficiente para profiles (la que causa timeout)
DROP POLICY IF EXISTS "profiles_select_same_empresa" ON profiles;
CREATE POLICY "profiles_select_same_empresa"
  ON profiles FOR SELECT
  USING (empresa_id = user_empresa_id());

DROP POLICY IF EXISTS "profiles_update_own_estado_chat" ON profiles;
CREATE POLICY "profiles_update_own_estado_chat"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 7) Limpiar políticas viejas/duplicadas que causan conflictos
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies 
    WHERE tablename = 'chat_salas' 
    AND policyname NOT IN ('chat_salas_select','chat_salas_insert','chat_salas_update')
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON chat_salas', pol.policyname); END LOOP;

  FOR pol IN SELECT policyname FROM pg_policies 
    WHERE tablename = 'chat_miembros' 
    AND policyname NOT IN ('chat_miembros_select','chat_miembros_insert','chat_miembros_update')
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON chat_miembros', pol.policyname); END LOOP;

  FOR pol IN SELECT policyname FROM pg_policies 
    WHERE tablename = 'chat_mensajes' 
    AND policyname NOT IN ('chat_mensajes_select','chat_mensajes_insert','chat_mensajes_update')
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON chat_mensajes', pol.policyname); END LOOP;
END
$$;

-- 8) Asegurar que realtime esté activo en las tablas
ALTER PUBLICATION supabase_realtime ADD TABLE chat_salas;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_miembros;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_mensajes;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_presencia;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_llamadas;

SELECT 'Hotfix de optimización aplicado correctamente' AS status;
