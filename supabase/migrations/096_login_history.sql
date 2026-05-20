CREATE TABLE IF NOT EXISTS login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid,
  user_id uuid,
  email text,
  ip text,
  pais text,
  ciudad text,
  user_agent text,
  es_anomalo boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_history_created ON login_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_anomalo ON login_history(empresa_id, created_at DESC) WHERE es_anomalo = true;
