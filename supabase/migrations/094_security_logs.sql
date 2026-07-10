-- 094: Tabla de logs de seguridad (geobloqueo, rate limiting, etc)
-- Registra cada request bloqueado para auditoría y monitoreo

CREATE TABLE IF NOT EXISTS security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid DEFAULT '6186f014-c8c7-4027-9f08-8acf2bae3eae',
  ip text,
  pais text,
  ruta text,
  metodo text,
  motivo text,
  user_agent text,
  detalles jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_logs_empresa ON security_logs(empresa_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_created ON security_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_pais ON security_logs(pais);
CREATE INDEX IF NOT EXISTS idx_security_logs_motivo ON security_logs(motivo);

ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins pueden ver logs" ON security_logs;
CREATE POLICY "Admins pueden ver logs" ON security_logs
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid() AND rol IN ('admin', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "Service role puede insertar" ON security_logs;
CREATE POLICY "Service role puede insertar" ON security_logs
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins pueden eliminar logs" ON security_logs;
CREATE POLICY "Admins pueden eliminar logs" ON security_logs
  FOR DELETE USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid() AND rol IN ('admin', 'superadmin')
    )
  );
