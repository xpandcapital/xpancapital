-- Migración: 123_gamificacion_refinamiento.sql
-- Puntos por categoría, topes diarios, histórico mensual y puntos configurables por curso

-- ═══════════════════════════════════════════════════════
-- 1. PUNTOS CONFIGURABLES POR CURSO
-- ═══════════════════════════════════════════════════════
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS puntos_completado INTEGER DEFAULT 500;
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS puntos_por_leccion INTEGER DEFAULT 50;
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS puntos_certificado INTEGER DEFAULT 1000;

-- ═══════════════════════════════════════════════════════
-- 2. CATEGORÍAS DE PUNTOS EN PROFILES
-- ═══════════════════════════════════════════════════════
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS puntos_cursos INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS puntos_comunidad INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS puntos_blog INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_profiles_puntos_cursos
  ON profiles(puntos_nivel DESC, puntos DESC)
  WHERE puntos_cursos > 0;

-- ═══════════════════════════════════════════════════════
-- 3. TOPES DIARIOS ANTI-SPAM EN CONFIG
-- ═══════════════════════════════════════════════════════
ALTER TABLE gamificacion_config ADD COLUMN IF NOT EXISTS max_comentarios_comunidad_dia INTEGER DEFAULT 10;
ALTER TABLE gamificacion_config ADD COLUMN IF NOT EXISTS max_posts_comunidad_dia INTEGER DEFAULT 3;
ALTER TABLE gamificacion_config ADD COLUMN IF NOT EXISTS max_reacciones_dia INTEGER DEFAULT 20;
ALTER TABLE gamificacion_config ADD COLUMN IF NOT EXISTS max_comentarios_blog_dia INTEGER DEFAULT 10;
ALTER TABLE gamificacion_config ADD COLUMN IF NOT EXISTS max_lecturas_blog_dia INTEGER DEFAULT 5;

-- ═══════════════════════════════════════════════════════
-- 4. HISTÓRICO MENSUAL
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS gamificacion_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  periodo TEXT NOT NULL,
  puntos_cursos INTEGER DEFAULT 0,
  puntos_comunidad INTEGER DEFAULT 0,
  puntos_blog INTEGER DEFAULT 0,
  ranking_global INTEGER,
  creado_en TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, periodo)
);

CREATE INDEX IF NOT EXISTS idx_gamif_historico_user
  ON gamificacion_historico(user_id, periodo DESC);

CREATE INDEX IF NOT EXISTS idx_gamif_historico_empresa_periodo
  ON gamificacion_historico(empresa_id, periodo);
