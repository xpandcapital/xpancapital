ALTER TABLE cursos ADD COLUMN IF NOT EXISTS imagen_principal TEXT;
NOTIFY pgrst, 'reload schema';