CREATE TABLE IF NOT EXISTS equipo_cursos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  advisor_id UUID,
  curso_id UUID,
  progreso INTEGER DEFAULT 0,
  estado TEXT DEFAULT 'asignado',
  nota_final REAL,
  lecciones_completadas JSONB DEFAULT '[]',
  asignado_en TIMESTAMPTZ DEFAULT NOW(),
  completado_en TIMESTAMPTZ,
  creado_en TIMESTAMPTZ DEFAULT NOW()
)
