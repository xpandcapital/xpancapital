-- Trading Calculator V2 — nuevos campos basados en pips y par de divisas
ALTER TABLE trading_calculations 
  ADD COLUMN IF NOT EXISTS account_currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS currency_pair TEXT,
  ADD COLUMN IF NOT EXISTS stop_loss_pips DECIMAL(12,2);

-- Hacer nullable las columnas que ya no se usan en V2
ALTER TABLE trading_calculations 
  ALTER COLUMN entry_price DROP NOT NULL,
  ALTER COLUMN stop_loss DROP NOT NULL,
  ALTER COLUMN distancia_sl_pct DROP NOT NULL,
  ALTER COLUMN tamano_posicion DROP NOT NULL,
  ALTER COLUMN lotes DROP NOT NULL,
  ALTER COLUMN valor_posicion DROP NOT NULL;
