ALTER TABLE cursos ADD COLUMN IF NOT EXISTS sequential_progress BOOLEAN DEFAULT false;
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS require_completion BOOLEAN DEFAULT false;
NOTIFY pgrst, 'reload schema';