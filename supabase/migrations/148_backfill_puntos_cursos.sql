-- Migración 148: backfill de puntos_cursos desde lecciones completadas y cursos completados

WITH curso_total_lecciones AS (
  SELECT
    c.id AS curso_id,
    c.puntos_por_leccion,
    c.puntos_completado,
    COALESCE(
      (SELECT COALESCE(SUM(jsonb_array_length(m->'lessons')), 0)
       FROM jsonb_array_elements(c.modulos) AS m
       WHERE jsonb_typeof(m) = 'object' AND m ? 'lessons'),
      0
    ) AS total_lecciones
  FROM public.cursos c
),
progreso_unificado AS (
  SELECT user_id, curso_id,
         COALESCE(jsonb_array_length(lecciones_completadas), 0) AS lecciones,
         COALESCE(progreso, 0)::numeric AS progreso
  FROM public.equipo_cursos
  WHERE user_id IS NOT NULL

  UNION ALL

  SELECT user_id, curso_id, 0 AS lecciones, COALESCE(progreso, 0) AS progreso
  FROM public.curso_progreso
  WHERE user_id IS NOT NULL
),
dedup AS (
  SELECT user_id, curso_id,
         MAX(lecciones) AS lecciones,
         MAX(progreso) AS progreso
  FROM progreso_unificado
  GROUP BY user_id, curso_id
),
puntos_por_usuario AS (
  SELECT
    d.user_id,
    SUM(
      GREATEST(d.lecciones, CEIL(d.progreso / 100.0 * ctl.total_lecciones)) * COALESCE(ctl.puntos_por_leccion, 50)
      + CASE WHEN d.progreso >= 100 THEN COALESCE(ctl.puntos_completado, 500) ELSE 0 END
    )::int AS puntos_cursos_calculados
  FROM dedup d
  JOIN curso_total_lecciones ctl ON ctl.curso_id = d.curso_id
  WHERE d.progreso > 0
  GROUP BY d.user_id
)
UPDATE public.profiles p
SET puntos_cursos = ppu.puntos_cursos_calculados,
    puntos = ppu.puntos_cursos_calculados + COALESCE(p.puntos_comunidad, 0) + COALESCE(p.puntos_blog, 0)
FROM puntos_por_usuario ppu
WHERE p.id = ppu.user_id;

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
