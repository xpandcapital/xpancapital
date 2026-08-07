-- 103_examen_system.sql
-- Columnas para sistema de exámenes con ciclos e intentos

ALTER TABLE equipo_cursos ADD COLUMN IF NOT EXISTS ciclo_examen INTEGER DEFAULT 0;
ALTER TABLE equipo_cursos ADD COLUMN IF NOT EXISTS intento_examen INTEGER DEFAULT 0;
ALTER TABLE equipo_cursos ADD COLUMN IF NOT EXISTS intento_aprobado INTEGER;
ALTER TABLE equipo_cursos ADD COLUMN IF NOT EXISTS ciclo_aprobado INTEGER;
ALTER TABLE curso_progreso ADD COLUMN IF NOT EXISTS ciclo_examen INTEGER DEFAULT 0;
ALTER TABLE curso_progreso ADD COLUMN IF NOT EXISTS intento_examen INTEGER DEFAULT 0;
ALTER TABLE curso_progreso ADD COLUMN IF NOT EXISTS intento_aprobado INTEGER;
ALTER TABLE curso_progreso ADD COLUMN IF NOT EXISTS ciclo_aprobado INTEGER;
