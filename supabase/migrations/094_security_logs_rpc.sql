-- RPC para agregación de security_logs (reemplaza 4 queries con limit(5000))
CREATE OR REPLACE FUNCTION security_logs_aggregation(
  p_empresa_id UUID,
  p_desde TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'top_paises', (
      SELECT jsonb_agg(jsonb_build_object('pais', pais, 'count', cnt))
      FROM (
        SELECT pais, COUNT(*) as cnt
        FROM security_logs
        WHERE empresa_id = p_empresa_id AND created_at >= p_desde
        GROUP BY pais
        ORDER BY cnt DESC
        LIMIT 5
      ) t
    ),
    'top_rutas', (
      SELECT jsonb_agg(jsonb_build_object('ruta', ruta, 'count', cnt))
      FROM (
        SELECT ruta, COUNT(*) as cnt
        FROM security_logs
        WHERE empresa_id = p_empresa_id AND created_at >= p_desde
        GROUP BY ruta
        ORDER BY cnt DESC
        LIMIT 5
      ) t
    ),
    'top_ips', (
      SELECT jsonb_agg(jsonb_build_object('ip', ip, 'count', cnt))
      FROM (
        SELECT ip, COUNT(*) as cnt
        FROM security_logs
        WHERE empresa_id = p_empresa_id AND created_at >= p_desde
        GROUP BY ip
        ORDER BY cnt DESC
        LIMIT 5
      ) t
    ),
    'por_hora', (
      SELECT jsonb_agg(jsonb_build_object('hora', h || 'h', 'count', cnt))
      FROM (
        SELECT EXTRACT(HOUR FROM created_at)::int as h, COUNT(*) as cnt
        FROM security_logs
        WHERE empresa_id = p_empresa_id AND created_at >= p_desde
        GROUP BY h
        ORDER BY h
      ) t
    )
  ) INTO result;

  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;
