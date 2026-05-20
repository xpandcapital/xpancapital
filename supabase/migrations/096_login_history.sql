CREATE TABLE IF NOT EXISTS login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email text,
  ip text,
  pais text,
  created_at timestamptz DEFAULT now()
);
