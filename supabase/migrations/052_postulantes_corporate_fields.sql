-- Add corporate email, assigned password, and user_created flag to postulantes
ALTER TABLE postulantes ADD COLUMN IF NOT EXISTS correo_corporativo TEXT;
ALTER TABLE postulantes ADD COLUMN IF NOT EXISTS contrasena_asignada TEXT;
ALTER TABLE postulantes ADD COLUMN IF NOT EXISTS usuario_creado BOOLEAN DEFAULT FALSE;
ALTER TABLE postulantes ADD COLUMN IF NOT EXISTS puesto_trabajo_id UUID REFERENCES puestos_trabajo(id) ON DELETE SET NULL;