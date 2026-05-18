-- Campos necesarios para las variables de email templates por evento

-- 1. advisors: campos de empleado para emails de RRHH
ALTER TABLE advisors 
  ADD COLUMN IF NOT EXISTS departamento TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS fecha_inicio DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS fecha_cese DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS motivo_cese TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS es_instructor BOOLEAN DEFAULT false;

-- 2. cursos: instructor asignado (FK a advisors)
ALTER TABLE cursos 
  ADD COLUMN IF NOT EXISTS instructor_id UUID DEFAULT NULL REFERENCES advisors(id) ON DELETE SET NULL;

-- 3. empresas: dias de garantia por defecto para productos/servicios
ALTER TABLE empresas 
  ADD COLUMN IF NOT EXISTS dias_garantia_defecto INTEGER DEFAULT 7;

-- 4. profiles: departamento (para usuarios que tambien son empleados)
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS departamento TEXT DEFAULT NULL;
