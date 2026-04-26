-- Migration: 062_compra_items_product_type
-- Agrega columna product_type a compra_items para mantener referencia histórica del tipo

ALTER TABLE compra_items ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'digital';

COMMENT ON COLUMN compra_items.product_type IS 'Tipo de producto al momento de la compra: digital, fisico, servicio, suscripcion';
