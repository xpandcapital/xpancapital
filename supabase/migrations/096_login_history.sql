-- 096: Historial de inicios de sesión para detección de anomalías geográficas
-- Registra cada login exitoso con IP, país y ciudad

CREATE TABLE IF NOT EXISTS login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid DEFAULT '6186f014-c8c7-4027-9f08-8acf2bae3eae',
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  email text,
  ip text,
  pais text,
  ciudad text,
  user_agent text,
  es_anomalo boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_history_user ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created ON login_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_pais ON login_history(pais);
CREATE INDEX IF NOT EXISTS idx_login_history_anomalo ON login_history(empresa_id, created_at DESC) WHERE es_anomalo = true;

ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins pueden ver historial" ON login_history;
CREATE POLICY "Admins pueden ver historial" ON login_history
  FOR SELECT USING (empresa_id IN (
    SELECT empresa_id FROM profiles WHERE id = auth.uid() AND rol IN ('admin', 'superadmin')
  ));

DROP POLICY IF EXISTS "Service role puede insertar" ON login_history;
CREATE POLICY "Service role puede insertar" ON login_history
  FOR INSERT WITH CHECK (true);
