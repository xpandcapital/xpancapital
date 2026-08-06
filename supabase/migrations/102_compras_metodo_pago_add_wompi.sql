-- Agregar 'wompi' al CHECK constraint de metodo_pago en compras

ALTER TABLE compras DROP CONSTRAINT IF EXISTS compras_metodo_pago_check;

ALTER TABLE compras ADD CONSTRAINT compras_metodo_pago_check
  CHECK (metodo_pago IN (
    'izipay', 'paypal', 'coins', 'bliscoins', 'transfer', 'transferencia',
    'crypto_manual', 'whatsapp', 'efectivo', 'tarjeta', 'otro', 'cash', 'card', 'manual', 'wompi'
  ));
