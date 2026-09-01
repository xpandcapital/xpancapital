-- Migración 152: revertir backfill de monto en ventas manuales
-- Los montos en 0 de las ventas registradas manualmente (clientes antiguos) eran intencionales.
-- Se restaura monto_usd = 0 para las compras manuales; solo se conserva el monto real del checkout.

UPDATE public.compras
SET monto_usd = 0
WHERE metadata->>'es_registro_manual' = 'true'
  AND estado = 'completado';
