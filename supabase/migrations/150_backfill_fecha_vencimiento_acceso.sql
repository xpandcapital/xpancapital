-- Migración 150: backfill fecha_vencimiento_acceso según duracion_dias del producto
-- Las compras históricas tenían fecha_vencimiento_acceso = creado_en + 365 días (valor fijo),
-- ignorando producto.duracion_dias. Se recalcula correctamente.

UPDATE public.compras c
SET fecha_vencimiento_acceso = c.creado_en + (p.duracion_dias * interval '1 day')
FROM public.productos p
WHERE p.id = c.producto_id
  AND c.estado = 'completado'
  AND p.duracion_dias IS NOT NULL
  AND p.duracion_dias > 0;
