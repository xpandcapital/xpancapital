-- Migración 149: permitir tipo 'comunidad' en notificaciones
ALTER TABLE public.notificaciones DROP CONSTRAINT IF EXISTS notificaciones_tipo_check;

ALTER TABLE public.notificaciones
ADD CONSTRAINT notificaciones_tipo_check
CHECK (tipo = ANY (ARRAY['lectura_completada','coins_ganados','coins_comprados','nuevo_articulo','compra_exitosa','comentario_respuesta','referido_registro','comision_recibida','evento_invitacion','nivel_subido','sistema','venta','alerta','manual','comunidad']));
