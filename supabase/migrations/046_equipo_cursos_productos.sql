-- Migration: equipo_cursos, equipo_productos, para_equipo on cursos, postulante_id on advisors
-- This enables: accepted postulantes become team members, team members get assigned courses/products,
-- and courses marked "para_equipo" are hidden from public view

-- 1. Add para_equipo column to cursos
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS para_equipo BOOLEAN DEFAULT false;

-- 2. Add postulante_id to advisors (to link accepted postulantes to team members)
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS postulante_id UUID REFERENCES postulantes(id) ON DELETE SET NULL;
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS aceptado_en TIMESTAMPTZ;

-- 3. Junction table: equipo_cursos (which team members have which courses)
CREATE TABLE IF NOT EXISTS equipo_cursos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL REFERENCES advisors(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  progreso DECIMAL(5,2) DEFAULT 0,
  estado TEXT DEFAULT 'asignado' CHECK (estado IN ('asignado', 'en_progreso', 'completado', 'bloqueado')),
  nota_final DECIMAL(5,2),
  asignado_en TIMESTAMPTZ DEFAULT now(),
  completado_en TIMESTAMPTZ,
  UNIQUE(advisor_id, curso_id)
);

-- 4. Junction table: equipo_productos (which team members have which products)
CREATE TABLE IF NOT EXISTS equipo_productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL REFERENCES advisors(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  estado TEXT DEFAULT 'asignado' CHECK (estado IN ('asignado', 'activo', 'completado', 'cancelado')),
  asignado_en TIMESTAMPTZ DEFAULT now(),
  completado_en TIMESTAMPTZ,
  UNIQUE(advisor_id, producto_id)
);

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_equipo_cursos_advisor ON equipo_cursos(advisor_id);
CREATE INDEX IF NOT EXISTS idx_equipo_cursos_curso ON equipo_cursos(curso_id);
CREATE INDEX IF NOT EXISTS idx_equipo_productos_advisor ON equipo_productos(advisor_id);
CREATE INDEX IF NOT EXISTS idx_equipo_productos_producto ON equipo_productos(producto_id);
CREATE INDEX IF NOT EXISTS idx_advisors_postulante ON advisors(postulante_id);
CREATE INDEX IF NOT EXISTS idx_cursos_para_equipo ON cursos(para_equipo);