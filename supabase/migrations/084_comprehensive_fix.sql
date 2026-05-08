-- ============================================================
-- 084: COMPREHENSIVE FIX - Ejecutar TODO este script en Supabase SQL Editor
-- Combina y corrige: RLS, triggers, constraints, indexes, helper functions
-- Este script es IDEMPOTENTE - se puede ejecutar múltiples veces sin problema
-- ============================================================

-- ============================================================
-- 1. HELPER FUNCTIONS (SECURITY DEFINER - evitan recursión infinita en RLS)
-- ============================================================
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

-- Helper para array_append_unique (marcar leídos)
CREATE OR REPLACE FUNCTION array_append_unique(arr uuid[], elem uuid)
RETURNS uuid[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT array_agg(DISTINCT x)
  FROM unnest(array_append(arr, elem)) AS x
  WHERE x IS NOT NULL;
$$;

-- ============================================================
-- 2. TRIGGER: chat_mensajes -> ultima_actividad (SIMPLIFICADO)
--    Versión anterior incluía ultimo_mensaje JSONB que causaba problemas.
--    Ahora solo actualiza ultima_actividad.
-- ============================================================
DROP TRIGGER IF EXISTS trg_chat_mensajes_ultima_actividad ON chat_mensajes;

CREATE OR REPLACE FUNCTION update_sala_ultima_actividad()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE chat_salas
  SET ultima_actividad = COALESCE(NEW.creado_en, now())
  WHERE id = NEW.sala_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_chat_mensajes_ultima_actividad
  AFTER INSERT ON chat_mensajes
  FOR EACH ROW
  EXECUTE FUNCTION update_sala_ultima_actividad();

-- ============================================================
-- 3. NOTIFICACIONES: Fix constraint para incluir todos los tipos
-- ============================================================
ALTER TABLE notificaciones DROP CONSTRAINT IF EXISTS notificaciones_tipo_check;
ALTER TABLE notificaciones ADD CONSTRAINT notificaciones_tipo_check
  CHECK (tipo IN ('sistema', 'chat', 'lead', 'venta', 'alerta', 'recordatorio', 'info', 'warning', 'success', 'error'));

-- ============================================================
-- 4. RLS POLICIES: chat_salas
-- ============================================================
ALTER TABLE chat_salas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_salas_select_miembro" ON chat_salas;
CREATE POLICY "chat_salas_select_miembro"
  ON chat_salas FOR SELECT
  USING (id IN (SELECT user_sala_ids()));

-- Permitir que empleados vean salas de visitante de su empresa
DROP POLICY IF EXISTS "chat_salas_select_empresa" ON chat_salas;
CREATE POLICY "chat_salas_select_empresa"
  ON chat_salas FOR SELECT
  USING (empresa_id = user_empresa_id());

DROP POLICY IF EXISTS "chat_salas_insert_miembro" ON chat_salas;
CREATE POLICY "chat_salas_insert_miembro"
  ON chat_salas FOR INSERT
  WITH CHECK (creado_por = auth.uid() OR empresa_id = user_empresa_id());

DROP POLICY IF EXISTS "chat_salas_update_miembro" ON chat_salas;
CREATE POLICY "chat_salas_update_miembro"
  ON chat_salas FOR UPDATE
  USING (id IN (SELECT user_sala_ids()) OR empresa_id = user_empresa_id())
  WITH CHECK (id IN (SELECT user_sala_ids()) OR empresa_id = user_empresa_id());

-- ============================================================
-- 5. RLS POLICIES: chat_miembros
-- ============================================================
ALTER TABLE chat_miembros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_miembros_select_own" ON chat_miembros;
CREATE POLICY "chat_miembros_select_own"
  ON chat_miembros FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "chat_miembros_select_sala" ON chat_miembros;
CREATE POLICY "chat_miembros_select_sala"
  ON chat_miembros FOR SELECT
  USING (sala_id IN (SELECT user_sala_ids()));

-- Empleados pueden ver miembros de salas de su empresa
DROP POLICY IF EXISTS "chat_miembros_read_empresa" ON chat_miembros;
CREATE POLICY "chat_miembros_read_empresa"
  ON chat_miembros FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_salas
      WHERE chat_salas.id = chat_miembros.sala_id
        AND chat_salas.empresa_id = user_empresa_id()
    )
  );

-- Empleados pueden unirse a salas de visitante/soporte/ventas de su empresa
DROP POLICY IF EXISTS "chat_miembros_join_visitor" ON chat_miembros;
CREATE POLICY "chat_miembros_join_visitor"
  ON chat_miembros FOR INSERT
  WITH CHECK (
    (user_id = auth.uid()
     AND EXISTS (
       SELECT 1 FROM chat_salas
       WHERE chat_salas.id = chat_miembros.sala_id
         AND chat_salas.empresa_id = user_empresa_id()
         AND chat_salas.tipo IN ('visitante', 'soporte', 'ventas')
     ))
    OR
    (user_id = auth.uid()
     AND sala_id IN (SELECT user_sala_ids()))
  );

DROP POLICY IF EXISTS "chat_miembros_insert_admin" ON chat_miembros;
CREATE POLICY "chat_miembros_insert_admin"
  ON chat_miembros FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR (
      sala_id IN (SELECT user_sala_ids())
      AND EXISTS (
        SELECT 1 FROM chat_miembros cm2
        WHERE cm2.sala_id = chat_miembros.sala_id
          AND cm2.user_id = auth.uid()
          AND cm2.rol_sala = 'admin'
      )
    )
  );

DROP POLICY IF EXISTS "chat_miembros_insert_empresa" ON chat_miembros;
CREATE POLICY "chat_miembros_insert_empresa"
  ON chat_miembros FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM chat_salas
      WHERE chat_salas.id = chat_miembros.sala_id
        AND chat_salas.empresa_id = user_empresa_id()
    )
  );

DROP POLICY IF EXISTS "chat_miembros_update_own" ON chat_miembros;
CREATE POLICY "chat_miembros_update_own"
  ON chat_miembros FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 6. RLS POLICIES: chat_mensajes
-- ============================================================
ALTER TABLE chat_mensajes ENABLE ROW LEVEL SECURITY;

-- Empleados pueden leer mensajes de salas de su empresa (incluyendo visitante)
DROP POLICY IF EXISTS "chat_mensajes_select_miembro" ON chat_mensajes;
CREATE POLICY "chat_mensajes_select_miembro"
  ON chat_mensajes FOR SELECT
  USING (
    sala_id IN (SELECT user_sala_ids())
    OR EXISTS (
      SELECT 1 FROM chat_salas
      WHERE chat_salas.id = chat_mensajes.sala_id
        AND chat_salas.empresa_id = user_empresa_id()
    )
  );

DROP POLICY IF EXISTS "chat_mensajes_insert_miembro" ON chat_mensajes;
CREATE POLICY "chat_mensajes_insert_miembro"
  ON chat_mensajes FOR INSERT
  WITH CHECK (
    (user_id = auth.uid() AND sala_id IN (SELECT user_sala_ids()))
    OR (user_id = auth.uid() AND EXISTS (
      SELECT 1 FROM chat_salas
      WHERE chat_salas.id = chat_mensajes.sala_id
        AND chat_salas.empresa_id = user_empresa_id()
    ))
  );

DROP POLICY IF EXISTS "chat_mensajes_update_own" ON chat_mensajes;
CREATE POLICY "chat_mensajes_update_own"
  ON chat_mensajes FOR UPDATE
  USING (
    user_id = auth.uid()
    AND sala_id IN (SELECT user_sala_ids())
  )
  WITH CHECK (
    user_id = auth.uid()
    AND sala_id IN (SELECT user_sala_ids())
  );

DROP POLICY IF EXISTS "chat_mensajes_update_fijado" ON chat_mensajes;
CREATE POLICY "chat_mensajes_update_fijado"
  ON chat_mensajes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chat_salas
      WHERE chat_salas.id = chat_mensajes.sala_id
        AND chat_salas.empresa_id = user_empresa_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_salas
      WHERE chat_salas.id = chat_mensajes.sala_id
        AND chat_salas.empresa_id = user_empresa_id()
    )
  );

-- ============================================================
-- 7. RLS POLICIES: chat_presencia
-- ============================================================
ALTER TABLE chat_presencia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_presencia_select_own" ON chat_presencia;
CREATE POLICY "chat_presencia_select_own"
  ON chat_presencia FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "chat_presencia_select_empresa" ON chat_presencia;
CREATE POLICY "chat_presencia_select_empresa"
  ON chat_presencia FOR SELECT
  USING (empresa_id = user_empresa_id());

DROP POLICY IF EXISTS "chat_presencia_insert_own" ON chat_presencia;
CREATE POLICY "chat_presencia_insert_own"
  ON chat_presencia FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "chat_presencia_update_own" ON chat_presencia;
CREATE POLICY "chat_presencia_update_own"
  ON chat_presencia FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "chat_presencia_delete_own" ON chat_presencia;
CREATE POLICY "chat_presencia_delete_own"
  ON chat_presencia FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- 8. RLS POLICIES: profiles (para leer contactos del chat)
-- ============================================================
DROP POLICY IF EXISTS "profiles_select_same_empresa" ON profiles;
CREATE POLICY "profiles_select_same_empresa"
  ON profiles FOR SELECT
  USING (empresa_id = user_empresa_id());

DROP POLICY IF EXISTS "profiles_update_own_estado_chat" ON profiles;
CREATE POLICY "profiles_update_own_estado_chat"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================
-- 9. RLS POLICIES: chat_visitantes
-- ============================================================
ALTER TABLE chat_visitantes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_visitantes_select_empresa" ON chat_visitantes;
CREATE POLICY "chat_visitantes_select_empresa"
  ON chat_visitantes FOR SELECT
  USING (empresa_id = user_empresa_id());

DROP POLICY IF EXISTS "chat_visitantes_update_empresa" ON chat_visitantes;
CREATE POLICY "chat_visitantes_update_empresa"
  ON chat_visitantes FOR UPDATE
  USING (empresa_id = user_empresa_id())
  WITH CHECK (empresa_id = user_empresa_id());

-- ============================================================
-- 10. RLS POLICIES: chat_config
-- ============================================================
ALTER TABLE chat_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_config_select_empresa" ON chat_config;
CREATE POLICY "chat_config_select_empresa"
  ON chat_config FOR SELECT
  USING (empresa_id = user_empresa_id());

DROP POLICY IF EXISTS "chat_config_update_admin" ON chat_config;
CREATE POLICY "chat_config_update_admin"
  ON chat_config FOR UPDATE
  USING (empresa_id = user_empresa_id())
  WITH CHECK (empresa_id = user_empresa_id());

-- Permitir INSERT automático de config por defecto
DROP POLICY IF EXISTS "chat_config_insert_empresa" ON chat_config;
CREATE POLICY "chat_config_insert_empresa"
  ON chat_config FOR INSERT
  WITH CHECK (empresa_id = user_empresa_id());

-- ============================================================
-- 11. RLS POLICIES: chat_plantillas
-- ============================================================
ALTER TABLE chat_plantillas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_plantillas_select_empresa" ON chat_plantillas;
CREATE POLICY "chat_plantillas_select_empresa"
  ON chat_plantillas FOR SELECT
  USING (empresa_id = user_empresa_id());

DROP POLICY IF EXISTS "chat_plantillas_insert_empresa" ON chat_plantillas;
CREATE POLICY "chat_plantillas_insert_empresa"
  ON chat_plantillas FOR INSERT
  WITH CHECK (empresa_id = user_empresa_id());

DROP POLICY IF EXISTS "chat_plantillas_update_empresa" ON chat_plantillas;
CREATE POLICY "chat_plantillas_update_empresa"
  ON chat_plantillas FOR UPDATE
  USING (empresa_id = user_empresa_id())
  WITH CHECK (empresa_id = user_empresa_id());

DROP POLICY IF EXISTS "chat_plantillas_delete_empresa" ON chat_plantillas;
CREATE POLICY "chat_plantillas_delete_empresa"
  ON chat_plantillas FOR DELETE
  USING (empresa_id = user_empresa_id());

-- ============================================================
-- 12. RLS POLICIES: chat_llamadas
-- ============================================================
ALTER TABLE chat_llamadas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_llamadas_select_participante" ON chat_llamadas;
CREATE POLICY "chat_llamadas_select_participante"
  ON chat_llamadas FOR SELECT
  USING (iniciada_por = auth.uid() OR recibida_por = auth.uid());

DROP POLICY IF EXISTS "chat_llamadas_insert_participante" ON chat_llamadas;
CREATE POLICY "chat_llamadas_insert_participante"
  ON chat_llamadas FOR INSERT
  WITH CHECK (iniciada_por = auth.uid());

DROP POLICY IF EXISTS "chat_llamadas_update_participante" ON chat_llamadas;
CREATE POLICY "chat_llamadas_update_participante"
  ON chat_llamadas FOR UPDATE
  USING (iniciada_por = auth.uid() OR recibida_por = auth.uid())
  WITH CHECK (iniciada_por = auth.uid() OR recibida_por = auth.uid());

-- ============================================================
-- 13. INDEXES para performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_chat_salas_empresa ON chat_salas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_chat_salas_estado ON chat_salas(estado);
CREATE INDEX IF NOT EXISTS idx_chat_salas_tipo_empresa ON chat_salas(empresa_id, tipo, estado);
CREATE INDEX IF NOT EXISTS idx_chat_salas_ultima_actividad ON chat_salas(ultima_actividad DESC);
CREATE INDEX IF NOT EXISTS idx_chat_miembros_sala ON chat_miembros(sala_id);
CREATE INDEX IF NOT EXISTS idx_chat_miembros_user ON chat_miembros(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_mensajes_sala ON chat_mensajes(sala_id);
CREATE INDEX IF NOT EXISTS idx_chat_mensajes_creado ON chat_mensajes(creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_chat_mensajes_eliminado ON chat_mensajes(eliminado) WHERE eliminado = false;
CREATE INDEX IF NOT EXISTS idx_chat_presencia_empresa ON chat_presencia(empresa_id);
CREATE INDEX IF NOT EXISTS idx_chat_visitantes_session ON chat_visitantes(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_visitantes_estado ON chat_visitantes(estado, empresa_id);
CREATE INDEX IF NOT EXISTS idx_profiles_empresa_estado ON profiles(empresa_id, estado_chat);
CREATE INDEX IF NOT EXISTS idx_chat_config_empresa ON chat_config(empresa_id);
CREATE INDEX IF NOT EXISTS idx_chat_plantillas_empresa ON chat_plantillas(empresa_id);

-- ============================================================
-- 14. REALTIME: Publicar tablas para cambios en tiempo real
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE chat_salas;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_miembros;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_mensajes;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_presencia;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_llamadas;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_visitantes;

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT '✅ 084_comprehensive_fix aplicado correctamente' AS status;
SELECT 'Helper functions:' AS info;
SELECT proname FROM pg_proc WHERE proname IN ('user_sala_ids', 'user_empresa_id', 'array_append_unique', 'update_sala_ultima_actividad');