-- Migración 151: backfill monto_usd de ventas con precio del producto
-- Las ventas registradas manualmente sin monto quedaban en 0.
-- Se rellena con el precio_usd del producto asociado (solo si monto era 0 y no fue pago con coins).

UPDATE public.compras c
SET monto_usd = p.precio_usd
FROM public.productos p
WHERE p.id = c.producto_id
  AND c.monto_usd = 0
  AND COALESCE(c.monto_coins, 0) = 0
  AND p.precio_usd IS NOT NULL
  AND p.precio_usd > 0;
