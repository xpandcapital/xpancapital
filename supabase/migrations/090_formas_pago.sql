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
  ('BLISCOINS', 'coins', 'Paga con tus BLISCOINS acumulados', true, '{"provider": "internal", "rate": 10}', 3),
  ('Transferencia Bancaria', 'transfer', 'Pago por transferencia bancaria', true, '{"provider": "manual", "bank_info": ""}', 4)
ON CONFLICT (slug) DO NOTHING;
