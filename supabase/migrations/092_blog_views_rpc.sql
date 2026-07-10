-- RPC para obtener suma de vistas del blog (optimiza dashboard)
CREATE OR REPLACE FUNCTION get_blog_views(p_empresa_id UUID)
RETURNS BIGINT
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(SUM(vistas), 0) FROM blog_posts WHERE empresa_id = p_empresa_id;
$$;
