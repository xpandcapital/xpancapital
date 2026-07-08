-- ============================================================
-- 091: Habilitar unaccent para búsqueda insensible a tildes
-- ============================================================
CREATE EXTENSION IF NOT EXISTS unaccent;

-- RPC para búsqueda global insensible a tildes
-- Busca en una tabla por nombre/título usando unaccent
CREATE OR REPLACE FUNCTION search_table(
  p_table TEXT,
  p_query TEXT,
  p_empresa_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  sql_query TEXT;
BEGIN
  -- Construir query según la tabla
  CASE p_table
    WHEN 'productos' THEN
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'title', nombre,
          'subtitle', COALESCE(precio_usd::text, ''),
          'url', '/superadmin/productos?id=' || id,
          'image', COALESCE(imagen_principal, '')
        )
      )
      INTO result
      FROM productos
      WHERE empresa_id = p_empresa_id
        AND activo = true
        AND unaccent(nombre) ILIKE unaccent('%' || p_query || '%')
      LIMIT 8;

    WHEN 'blog_posts' THEN
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'title', titulo,
          'subtitle', COALESCE(LEFT(extracto, 80), ''),
          'url', '/superadmin/blog/crear?id=' || id,
          'image', COALESCE(imagen_url, '')
        )
      )
      INTO result
      FROM blog_posts
      WHERE empresa_id = p_empresa_id
        AND unaccent(titulo) ILIKE unaccent('%' || p_query || '%')
      LIMIT 8;

    WHEN 'projects' THEN
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'title', name,
          'subtitle', COALESCE(status, ''),
          'url', '/superadmin/proyectos/' || id,
          'image', COALESCE(cover_image, '')
        )
      )
      INTO result
      FROM projects
      WHERE empresa_id = p_empresa_id
        AND unaccent(name) ILIKE unaccent('%' || p_query || '%')
      LIMIT 8;

    WHEN 'profiles' THEN
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'title', COALESCE(nombre, email),
          'subtitle', COALESCE(email, ''),
          'url', '/superadmin/clientes/' || id,
          'image', COALESCE(profilepic, '')
        )
      )
      INTO result
      FROM profiles
      WHERE empresa_id = p_empresa_id
        AND unaccent(COALESCE(nombre, '')) ILIKE unaccent('%' || p_query || '%')
      LIMIT 8;

    WHEN 'leads' THEN
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'title', nombre,
          'subtitle', COALESCE(email, 'Sin email') || ' · ' || COALESCE(estado, 'nuevo'),
          'url', '/superadmin/leads?id=' || id,
          'image', ''
        )
      )
      INTO result
      FROM leads
      WHERE empresa_id = p_empresa_id
        AND unaccent(nombre) ILIKE unaccent('%' || p_query || '%')
      LIMIT 8;

    WHEN 'cursos' THEN
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'title', nombre,
          'subtitle', COALESCE(LEFT(descripcion, 60), ''),
          'url', '/superadmin/cursos?id=' || id,
          'image', COALESCE(imagen_principal, '')
        )
      )
      INTO result
      FROM cursos
      WHERE unaccent(nombre) ILIKE unaccent('%' || p_query || '%')
      LIMIT 8;

    WHEN 'templates' THEN
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'title', nombre,
          'subtitle', COALESCE(tipo_contenido, 'pagina') || ' · ' || COALESCE(estado, 'borrador'),
          'url', '/superadmin/templates?id=' || id,
          'image', COALESCE(thumbnail_url, '')
        )
      )
      INTO result
      FROM templates
      WHERE empresa_id = p_empresa_id
        AND unaccent(nombre) ILIKE unaccent('%' || p_query || '%')
      LIMIT 8;

    ELSE
      result := '[]'::jsonb;
  END CASE;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

SELECT 'unaccent enabled and search_table RPC created' AS status;
