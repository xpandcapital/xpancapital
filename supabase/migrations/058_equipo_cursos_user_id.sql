-- Add user_id column to equipo_cursos to track profile directly
ALTER TABLE equipo_cursos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_equipo_cursos_user_id ON equipo_cursos(user_id);
NOTIFY pgrst, 'reload schema';