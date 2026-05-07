-- Fix: Allow any company employee to join visitor/support rooms
-- This fixes the issue where admins couldn't open visitor chats

-- Add policy to allow employees to join visitor/support rooms
DROP POLICY IF EXISTS "chat_miembros_join_visitor" ON chat_miembros;
CREATE POLICY "chat_miembros_join_visitor"
  ON chat_miembros FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM chat_salas cs
      WHERE cs.id = chat_miembros.sala_id
        AND cs.tipo IN ('visitante', 'soporte', 'ventas')
        AND cs.empresa_id = user_empresa_id()
    )
  );

-- Also allow employees to read visitor room members
DROP POLICY IF EXISTS "chat_miembros_read_empresa" ON chat_miembros;
CREATE POLICY "chat_miembros_read_empresa"
  ON chat_miembros FOR SELECT
  USING (
    user_id = auth.uid()
    OR sala_id IN (SELECT user_sala_ids())
    OR EXISTS (
      SELECT 1 FROM chat_salas cs
      WHERE cs.id = chat_miembros.sala_id
        AND cs.empresa_id = user_empresa_id()
    )
  );

SELECT 'Visitor chat policies fixed' AS status;
