-- Recrear el trigger de notificación de leads para asegurar que funcione
-- (El trigger original se creó en migration 031, este lo recrea con la lógica actualizada)

CREATE OR REPLACE FUNCTION trigger_nuevo_lead()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM pg_notify('nuevo_lead', json_build_object(
      'id', NEW.id,
      'nombre', NEW.nombre,
      'email', NEW.email,
      'telefono', NEW.telefono,
      'campana_id', NEW.campana_id,
      'asesor_id', NEW.asesor_id,
      'empresa_id', NEW.empresa_id
    )::text);
    
    PERFORM notificar_nuevo_lead(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Asegurar que el trigger existe
DROP TRIGGER IF EXISTS trigger_lead_notificacion ON leads;

CREATE TRIGGER trigger_lead_notificacion
AFTER INSERT ON leads
FOR EACH ROW
EXECUTE FUNCTION trigger_nuevo_lead();
