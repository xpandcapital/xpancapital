-- ============================================================
-- HOTFIX 2: Realtime mensajes - empleados pueden leer salas de visitantes
-- Arregla: mensajes de visitante no llegan al admin
-- ============================================================

-- 1) Permitir que empleados lean mensajes de salas de visitante/soporte/ventas de su empresa
-- (incluso si aún no son miembros, para poder decidir atender)
DROP POLICY IF EXISTS "chat_mensajes_select" ON chat_mensajes;
CREATE POLICY "chat_mensajes_select"
  ON chat_mensajes FOR SELECT
  USING (
    sala_id IN (SELECT user_sala_ids())
    OR EXISTS (
      SELECT 1 FROM chat_salas cs
      WHERE cs.id = chat_mensajes.sala_id
        AND cs.tipo IN ('visitante', 'soporte', 'ventas')
        AND cs.empresa_id = user_empresa_id()
    )
  );

-- 2) Permitir que empleados vean salas de visitante/soporte/ventas de su empresa
DROP POLICY IF EXISTS "chat_salas_select" ON chat_salas;
CREATE POLICY "chat_salas_select"
  ON chat_salas FOR SELECT
  USING (
    empresa_id = user_empresa_id()
  );

-- 3) Permitir que empleados se unan a salas de visitante/soporte/ventas
DROP POLICY IF EXISTS "chat_miembros_insert" ON chat_miembros;
CREATE POLICY "chat_miembros_insert"
  ON chat_miembros FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM chat_salas cs
      WHERE cs.id = chat_miembros.sala_id
        AND cs.empresa_id = user_empresa_id()
    )
  );

-- 4) Asegurar que chat_presencia funcione para todos los empleados
DROP POLICY IF EXISTS "chat_presencia_select" ON chat_presencia;
CREATE POLICY "chat_presencia_select"
  ON chat_presencia FOR SELECT
  USING (user_id = auth.uid() OR empresa_id = user_empresa_id());

SELECT 'Realtime hotfix aplicado' AS status;
