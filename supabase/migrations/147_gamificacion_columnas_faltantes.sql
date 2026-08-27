-- Migración 147: columnas de gamificación faltantes en profiles
-- El código (gamificación, stats, cursos) espera estas columnas que nunca se crearon.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS puntos INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS puntos_nivel INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS racha_dias INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ultima_actividad DATE;

CREATE INDEX IF NOT EXISTS idx_profiles_puntos_cursos
  ON public.profiles(puntos_cursos DESC);

-- Backfill: puntos totales acumulados
UPDATE public.profiles
SET puntos = COALESCE(puntos_cursos, 0) + COALESCE(puntos_comunidad, 0) + COALESCE(puntos_blog, 0)
WHERE puntos IS NULL OR puntos = 0;

-- Backfill: nivel según gamificacion_niveles (mayor nivel con puntos_requeridos <= puntos_cursos)
UPDATE public.profiles p
SET puntos_nivel = sub.nivel
FROM (
  SELECT u.id,
    COALESCE(
      (SELECT n.nivel
       FROM public.gamificacion_niveles n
       WHERE n.empresa_id = u.empresa_id
         AND n.puntos_requeridos <= COALESCE(u.puntos_cursos, 0)
       ORDER BY n.puntos_requeridos DESC
       LIMIT 1),
      1
    ) AS nivel
  FROM public.profiles u
) sub
WHERE p.id = sub.id;
