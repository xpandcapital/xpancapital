-- ============================================================
-- EMERGENCY: Drop problematic constraint on notificaciones
-- This is the root cause of all visitor sending failures
-- ============================================================

-- Just drop the constraint, no questions asked
ALTER TABLE notificaciones DROP CONSTRAINT IF EXISTS notificaciones_tipo_check;

-- Recreate with ALL possible values
ALTER TABLE notificaciones ADD CONSTRAINT notificaciones_tipo_check
  CHECK (tipo IN ('sistema', 'chat', 'lead', 'venta', 'alerta', 'recordatorio', 'info', 'warning', 'success', 'error'));

-- Drop and recreate any trigger that might be causing issues
DROP TRIGGER IF EXISTS trg_chat_mensajes_ultima_actividad ON chat_mensajes;

-- Recreate the trigger (now safer)
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

SELECT 'EMERGENCY FIX APPLIED' AS status;
