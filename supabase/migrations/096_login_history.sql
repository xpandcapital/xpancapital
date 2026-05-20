CREATE TABLE IF NOT EXISTS login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email text,
  ip text,
  pais text,
  ciudad text,
  user_agent text,
  es_anomalo boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);