-- 090: Tabla de formas de pago configurables
CREATE TABLE IF NOT EXISTS formas_pago (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid DEFAULT '6186f014-c8c7-4027-9f08-8acf2bae3eae',
  nombre text NOT NULL,
  slug text NOT NULL UNIQUE,
  descripcion text,
  activo boolean DEFAULT false,
  config jsonb DEFAULT '{}',
  orden int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_formas_pago_empresa ON formas_pago(empresa_id);
CREATE INDEX IF NOT EXISTS idx_formas_pago_slug ON formas_pago(slug);

-- RLS — público puede ver solo activas, admin todo
ALTER TABLE formas_pago ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "formas_pago_select_public" ON formas_pago;
CREATE POLICY "formas_pago_select_public"
  ON formas_pago FOR SELECT
  USING (activo = true);

DROP POLICY IF EXISTS "formas_pago_admin_all" ON formas_pago;
CREATE POLICY "formas_pago_admin_all"
  ON formas_pago FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.rol IN ('admin', 'superadmin')
    )
  );

-- Seed: métodos de pago por defecto
INSERT INTO formas_pago (nombre, slug, descripcion, activo, config, orden) VALUES
  ('Tarjeta de Crédito/Débito', 'helio_card', 'Pago con tarjeta via Hel.io', true, '{"provider": "helio", "type": "card"}', 1),
  ('Criptomonedas', 'helio_crypto', 'Pago con crypto via Hel.io', false, '{"provider": "helio", "type": "crypto"}', 2),
  ('XPANDCOINS', 'coins', 'Paga con tus XPANDCOINS acumulados', true, '{"provider": "internal", "rate": 10}', 3),
  ('Transferencia Bancaria', 'transfer', 'Pago por transferencia bancaria', true, '{"provider": "manual", "whatsapp": "+51999999999", "instructions": "Envía el comprobante de pago por WhatsApp para validar tu compra.", "countries": {"peru": {"label": "Perú", "flag": "🇵🇪", "banks": [{"name": "Banco de Crédito BCP", "account_number": "123-456-789", "account_holder": "Xpand Capital SAC", "cci": "00212300456789012345", "currency": "PEN", "account_type": "ahorros"}, {"name": "Interbank", "account_number": "987-654-321", "account_holder": "Xpand Capital SAC", "cci": "00398700654321098765", "currency": "USD", "account_type": "corriente"}]}}}', 4),
  ('Cripto Manual', 'crypto_manual', 'Pago directo con criptomonedas (manual)', false, '{"provider": "manual", "whatsapp": "+51999999999", "instructions": "Realiza el pago a la wallet indicada y envía el hash de transacción por WhatsApp.", "wallets": [{"network": "USDT (TRC20)", "address": "", "label": "USDT TRC20"}, {"network": "USDT (BEP20)", "address": "", "label": "USDT BEP20"}, {"network": "BTC", "address": "", "label": "Bitcoin"}, {"network": "ETH", "address": "", "label": "Ethereum"}]}', 5)
ON CONFLICT (slug) DO NOTHING;


