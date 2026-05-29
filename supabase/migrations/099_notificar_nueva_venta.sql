-- 099_notificar_nueva_venta.sql
-- Trigger que notifica a admins cuando hay una nueva venta (pendiente o completada)

CREATE OR REPLACE FUNCTION notificar_nueva_venta()
RETURNS TRIGGER AS $$
DECLARE
  v_titulo TEXT;
  v_mensaje TEXT;
  v_productos TEXT;
  v_estado_label TEXT;
BEGIN
  -- Obtener nombres de productos desde metadata
  v_productos := '';
  IF NEW.metadata IS NOT NULL AND NEW.metadata ? 'productos' THEN
    SELECT string_agg(p->>'nombre', ', ')
    INTO v_productos
    FROM jsonb_array_elements(NEW.metadata->'productos') AS p;
  END IF;

  IF v_productos = '' THEN
    v_productos := 'Producto #' || substring(NEW.id::text, 1, 8);
  END IF;

  v_estado_label := CASE NEW.estado
    WHEN 'completado' THEN 'completada'
    ELSE 'pendiente'
  END;

  v_titulo := 'Nueva venta ' || v_estado_label;

  v_mensaje := v_productos || ' — $' || COALESCE(NEW.monto_usd, 0)::text || ' USD';

  IF NEW.monto_coins > 0 THEN
    v_mensaje := v_mensaje || ' + ' || NEW.monto_coins::text || ' BLIS';
  END IF;

  v_mensaje := v_mensaje || ' — ' || COALESCE(NEW.metodo_pago, 'manual');

  -- Insertar notificación para admins de la empresa
  INSERT INTO notificaciones (
    empresa_id, tipo, titulo, mensaje, link,
    enviado_por, destinatario_tipo, destinatario_ids
  ) VALUES (
    NEW.empresa_id,
    'venta',
    v_titulo,
    v_mensaje,
    '/superadmin/ventas',
    NULL,
    'por_rol',
    ARRAY['superadmin', 'admin']
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_nueva_venta ON compras;

CREATE TRIGGER trigger_nueva_venta
AFTER INSERT ON compras
FOR EACH ROW
EXECUTE FUNCTION notificar_nueva_venta();
