-- ============================================
-- BLOQUE 1: Funciones helper (ejecutar primero)
-- ============================================

CREATE OR REPLACE FUNCTION user_sala_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT sala_id FROM chat_miembros WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION user_empresa_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT empresa_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- ============================================
-- BLOQUE 2: Borrar TODAS las políticas antiguas (ejecutar segundo)
-- ============================================
-- Copia y pega ESTE BLOQUE solo (desde DO hasta el final del $$;)

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'chat_salas' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON chat_salas', pol.policyname);
  END LOOP;

  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'chat_miembros' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON chat_miembros', pol.policyname);
  END LOOP;

  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'chat_mensajes' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON chat_mensajes', pol.policyname);
  END LOOP;

  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'chat_presencia' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON chat_presencia', pol.policyname);
  END LOOP;

  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'chat_llamadas' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON chat_llamadas', pol.policyname);
  END LOOP;

  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'chat_visitantes' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON chat_visitantes', pol.policyname);
  END LOOP;

  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'chat_config' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON chat_config', pol.policyname);
  END LOOP;

  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'chat_plantillas' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON chat_plantillas', pol.policyname);
  END LOOP;
END
$$;

-- ============================================
-- BLOQUE 3: Recrear políticas de chat_salas (ejecutar tercero)
-- ============================================

ALTER TABLE chat_salas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_salas_select" ON chat_salas;
CREATE POLICY "chat_salas_select"
  ON chat_salas FOR SELECT
  USING (id IN (SELECT user_sala_ids()));

DROP POLICY IF EXISTS "chat_salas_insert" ON chat_salas;
CREATE POLICY "chat_salas_insert"
  ON chat_salas FOR INSERT
  WITH CHECK (creado_por = auth.uid());

DROP POLICY IF EXISTS "chat_salas_update" ON chat_salas;
CREATE POLICY "chat_salas_update"
  ON chat_salas FOR UPDATE
  USING (id IN (SELECT user_sala_ids()))
  WITH CHECK (id IN (SELECT user_sala_ids()));

-- ============================================
-- BLOQUE 4: Recrear políticas de chat_miembros (ejecutar cuarto)
-- ============================================

ALTER TABLE chat_miembros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_miembros_select" ON chat_miembros;
CREATE POLICY "chat_miembros_select"
  ON chat_miembros FOR SELECT
  USING (user_id = auth.uid() OR sala_id IN (SELECT user_sala_ids()));

DROP POLICY IF EXISTS "chat_miembros_insert" ON chat_miembros;
CREATE POLICY "chat_miembros_insert"
  ON chat_miembros FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "chat_miembros_update" ON chat_miembros;
CREATE POLICY "chat_miembros_update"
  ON chat_miembros FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- BLOQUE 5: Recrear políticas de chat_mensajes (ejecutar quinto)
-- ============================================

ALTER TABLE chat_mensajes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_mensajes_select" ON chat_mensajes;
CREATE POLICY "chat_mensajes_select"
  ON chat_mensajes FOR SELECT
  USING (sala_id IN (SELECT user_sala_ids()));

DROP POLICY IF EXISTS "chat_mensajes_insert" ON chat_mensajes;
CREATE POLICY "chat_mensajes_insert"
  ON chat_mensajes FOR INSERT
  WITH CHECK (user_id = auth.uid() AND sala_id IN (SELECT user_sala_ids()));

DROP POLICY IF EXISTS "chat_mensajes_update" ON chat_mensajes;
CREATE POLICY "chat_mensajes_update"
  ON chat_mensajes FOR UPDATE
  USING (
    (user_id = auth.uid() AND sala_id IN (SELECT user_sala_ids()))
    OR sala_id IN (SELECT user_sala_ids())
  )
  WITH CHECK (
    (user_id = auth.uid() AND sala_id IN (SELECT user_sala_ids()))
    OR sala_id IN (SELECT user_sala_ids())
  );

-- ============================================
-- BLOQUE 6: Recrear políticas de chat_presencia (ejecutar sexto)
-- ============================================

ALTER TABLE chat_presencia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_presencia_select" ON chat_presencia;
CREATE POLICY "chat_presencia_select"
  ON chat_presencia FOR SELECT
  USING (user_id = auth.uid() OR empresa_id = user_empresa_id());

DROP POLICY IF EXISTS "chat_presencia_insert" ON chat_presencia;
CREATE POLICY "chat_presencia_insert"
  ON chat_presencia FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "chat_presencia_update" ON chat_presencia;
CREATE POLICY "chat_presencia_update"
  ON chat_presencia FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "chat_presencia_delete" ON chat_presencia;
CREATE POLICY "chat_presencia_delete"
  ON chat_presencia FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- BLOQUE 7: Recrear políticas restantes (ejecutar séptimo)
-- ============================================

ALTER TABLE chat_llamadas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_llamadas_select" ON chat_llamadas;
CREATE POLICY "chat_llamadas_select"
  ON chat_llamadas FOR SELECT
  USING (iniciada_por = auth.uid() OR recibida_por = auth.uid());

DROP POLICY IF EXISTS "chat_llamadas_insert" ON chat_llamadas;
CREATE POLICY "chat_llamadas_insert"
  ON chat_llamadas FOR INSERT
  WITH CHECK (iniciada_por = auth.uid());

DROP POLICY IF EXISTS "chat_llamadas_update" ON chat_llamadas;
CREATE POLICY "chat_llamadas_update"
  ON chat_llamadas FOR UPDATE
  USING (iniciada_por = auth.uid() OR recibida_por = auth.uid())
  WITH CHECK (iniciada_por = auth.uid() OR recibida_por = auth.uid());

ALTER TABLE chat_visitantes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_visitantes_select" ON chat_visitantes;
CREATE POLICY "chat_visitantes_select"
  ON chat_visitantes FOR SELECT
  USING (empresa_id = user_empresa_id());

DROP POLICY IF EXISTS "chat_visitantes_update" ON chat_visitantes;
CREATE POLICY "chat_visitantes_update"
  ON chat_visitantes FOR UPDATE
  USING (empresa_id = user_empresa_id())
  WITH CHECK (empresa_id = user_empresa_id());

ALTER TABLE chat_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_config_select" ON chat_config;
CREATE POLICY "chat_config_select"
  ON chat_config FOR SELECT
  USING (empresa_id = user_empresa_id());

DROP POLICY IF EXISTS "chat_config_update" ON chat_config;
CREATE POLICY "chat_config_update"
  ON chat_config FOR UPDATE
  USING (empresa_id = user_empresa_id())
  WITH CHECK (empresa_id = user_empresa_id());

ALTER TABLE chat_plantillas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_plantillas_select" ON chat_plantillas;
CREATE POLICY "chat_plantillas_select"
  ON chat_plantillas FOR SELECT
  USING (empresa_id = user_empresa_id());

DROP POLICY IF EXISTS "chat_plantillas_insert" ON chat_plantillas;
CREATE POLICY "chat_plantillas_insert"
  ON chat_plantillas FOR INSERT
  WITH CHECK (empresa_id = user_empresa_id());

DROP POLICY IF EXISTS "chat_plantillas_update" ON chat_plantillas;
CREATE POLICY "chat_plantillas_update"
  ON chat_plantillas FOR UPDATE
  USING (empresa_id = user_empresa_id())
  WITH CHECK (empresa_id = user_empresa_id());

-- ============================================
-- BLOQUE 8: Función helper y trigger (ejecutar octavo)
-- ============================================

CREATE OR REPLACE FUNCTION array_append_unique(arr uuid[], elem uuid)
RETURNS uuid[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT array_agg(DISTINCT x)
  FROM unnest(array_append(arr, elem)) AS x
  WHERE x IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION update_sala_ultima_actividad()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE chat_salas
  SET ultima_actividad = NEW.creado_en,
      ultimo_mensaje = jsonb_build_object(
        'id', NEW.id,
        'contenido', NEW.contenido,
        'tipo', NEW.tipo,
        'user_id', NEW.user_id,
        'creado_en', NEW.creado_en
      )
  WHERE id = NEW.sala_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_chat_mensajes_ultima_actividad ON chat_mensajes;
CREATE TRIGGER trg_chat_mensajes_ultima_actividad
  AFTER INSERT ON chat_mensajes
  FOR EACH ROW
  EXECUTE FUNCTION update_sala_ultima_actividad();

ALTER PUBLICATION supabase_realtime ADD TABLE chat_salas;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_miembros;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_mensajes;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_presencia;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_llamadas;

SELECT 'RLS fix completado' AS status;
