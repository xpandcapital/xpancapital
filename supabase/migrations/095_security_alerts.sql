-- 095: Tabla de alertas de seguridad
-- Registra cada alerta disparada por los detectores de patrones

CREATE TABLE IF NOT EXISTS security_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid DEFAULT '6186f014-c8c7-4027-9f08-8acf2bae3eae',
  tipo text NOT NULL,
  nivel text NOT NULL DEFAULT 'warning',
  titulo text NOT NULL,
  detalle text,
  metadata jsonb DEFAULT '{}',
  leida boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_alerts_empresa ON security_alerts(empresa_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created ON security_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_alerts_tipo ON security_alerts(tipo);
CREATE INDEX IF NOT EXISTS idx_security_alerts_nivel ON security_alerts(nivel);
CREATE INDEX IF NOT EXISTS idx_security_alerts_no_leidas ON security_alerts(empresa_id, created_at DESC) WHERE leida = false;

ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins pueden ver alertas" ON security_alerts;
CREATE POLICY "Admins pueden ver alertas" ON security_alerts
  FOR SELECT USING (empresa_id IN (
    SELECT empresa_id FROM profiles WHERE id = auth.uid() AND rol IN ('admin', 'superadmin')
  ));

DROP POLICY IF EXISTS "Service role puede insertar alertas" ON security_alerts;
CREATE POLICY "Service role puede insertar alertas" ON security_alerts
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins pueden actualizar alertas" ON security_alerts;
CREATE POLICY "Admins pueden actualizar alertas" ON security_alerts
  FOR UPDATE USING (empresa_id IN (
    SELECT empresa_id FROM profiles WHERE id = auth.uid() AND rol IN ('admin', 'superadmin')
  ));

DROP POLICY IF EXISTS "Admins pueden eliminar alertas" ON security_alerts;
CREATE POLICY "Admins pueden eliminar alertas" ON security_alerts
  FOR DELETE USING (empresa_id IN (
    SELECT empresa_id FROM profiles WHERE id = auth.uid() AND rol IN ('admin', 'superadmin')
  ));
