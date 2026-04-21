ALTER TABLE equipo_cursos ADD COLUMN IF NOT EXISTS lecciones_completadas TEXT[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_equipo_cursos_advisor_curso ON equipo_cursos(advisor_id, curso_id);