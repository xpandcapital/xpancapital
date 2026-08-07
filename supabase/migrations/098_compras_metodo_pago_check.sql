-- 098_compras_metodo_pago_check.sql
-- Actualizar CHECK constraint de metodo_pago en compras para incluir todos los métodos usados

ALTER TABLE compras DROP CONSTRAINT IF EXISTS compras_metodo_pago_check;

ALTER TABLE compras ADD CONSTRAINT compras_metodo_pago_check
  CHECK (metodo_pago IN (
    'izipay', 'paypal', 'coins', 'xpandCoins', 'transfer', 'transferencia',
    'crypto_manual', 'whatsapp', 'efectivo', 'tarjeta', 'otro', 'cash', 'card', 'manual'
  ));
