-- Migración: 102_vincular_productos_huerfanos.sql
-- Vincula productos existentes tipo 'servicio' sin curso_id a sus cursos correspondientes
-- por coincidencia de slug o nombre (case-insensitive)

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    WITH vinculados AS (
        UPDATE productos p
        SET curso_id = c.id
        FROM cursos c
        WHERE p.curso_id IS NULL
          AND p.tipo = 'servicio'
          AND p.empresa_id = c.empresa_id
          AND (
              p.slug = c.slug
              OR lower(trim(p.nombre)) = lower(trim(c.nombre))
          )
        RETURNING p.id
    )
    SELECT count(*) INTO v_count FROM vinculados;

    RAISE NOTICE 'Productos huérfanos vinculados: %', v_count;
END $$;
