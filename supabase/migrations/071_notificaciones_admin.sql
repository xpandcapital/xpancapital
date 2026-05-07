-- Agregar campos para notificaciones enviadas por admin

ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS enviado_por UUID REFERENCES profiles(id);
ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS destinatario_tipo TEXT CHECK (destinatario_tipo IN ('todos', 'por_rol', 'miembro', 'grupo'));
ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS destinatario_ids TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_notif_admin ON notificaciones(enviado_por, creado_en DESC);

-- Mejorar la función notificar_nuevo_lead para insertar en la tabla notificaciones
CREATE OR REPLACE FUNCTION notificar_nuevo_lead(
  p_lead_id UUID
)
RETURNS void AS $$
DECLARE
  v_lead leads%ROWTYPE;
  v_campana campanas%ROWTYPE;
  v_asesor asesores%ROWTYPE;
  v_titulo TEXT;
  v_mensaje TEXT;
BEGIN
  SELECT * INTO v_lead FROM leads WHERE id = p_lead_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  IF v_lead.campana_id IS NOT NULL THEN
    SELECT * INTO v_campana FROM campanas WHERE id = v_lead.campana_id;
    
    IF v_campana.asesor_id IS NOT NULL THEN
      SELECT * INTO v_asesor FROM asesores WHERE id = v_campana.asesor_id;
    END IF;
  END IF;
  
  UPDATE leads SET actualizado_en = now() WHERE id = p_lead_id;
  
  -- Construir mensaje de notificación
  v_titulo := 'Nuevo Lead: ' || v_lead.nombre;
  v_mensaje := 'Se ha recibido un nuevo lead de ' || v_lead.nombre;
  
  IF v_lead.email IS NOT NULL THEN
    v_mensaje := v_mensaje || ' (' || v_lead.email || ')';
  END IF;
  
  IF v_campana.id IS NOT NULL THEN
    v_mensaje := v_mensaje || ' desde la campaña ' || v_campana.nombre;
  END IF;
  
  -- Insertar notificación para administradores de la empresa
  INSERT INTO notificaciones (empresa_id, tipo, titulo, mensaje, link, enviado_por, destinatario_tipo, destinatario_ids)
  VALUES (
    v_lead.empresa_id,
    'sistema',
    v_titulo,
    v_mensaje,
    '/superadmin/leads',
    NULL,
    'por_rol',
    ARRAY['admin', 'editor']
  );
END;
$$ LANGUAGE plpgsql;
