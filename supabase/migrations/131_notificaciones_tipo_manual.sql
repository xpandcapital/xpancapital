-- Agrega 'manual' al tipo de notificaciones para las enviadas desde CommsTab
ALTER TABLE notificaciones DROP CONSTRAINT IF EXISTS notificaciones_tipo_check;
ALTER TABLE notificaciones ADD CONSTRAINT notificaciones_tipo_check CHECK (tipo = ANY (ARRAY['lectura_completada','coins_ganados','coins_comprados','nuevo_articulo','compra_exitosa','comentario_respuesta','referido_registro','comision_recibida','evento_invitacion','nivel_subido','sistema','venta','alerta','manual']))
