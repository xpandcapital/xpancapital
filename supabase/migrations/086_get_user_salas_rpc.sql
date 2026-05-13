-- 086: RPC para obtener todas las salas del usuario en 1 sola query
-- Reemplaza 3 round-trips HTTP (chat_miembros + chat_salas visitante + chat_salas detalles)
-- con 1 sola llamada RPC

CREATE OR REPLACE FUNCTION get_user_salas(p_user_id uuid, p_empresa_id uuid)
RETURNS SETOF chat_salas
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT DISTINCT s.*
  FROM chat_salas s
  LEFT JOIN chat_miembros m ON s.id = m.sala_id AND m.user_id = p_user_id
  WHERE s.estado = 'activo'
    AND (
      m.user_id = p_user_id
      OR (s.tipo = 'visitante' AND s.empresa_id = p_empresa_id)
    )
  ORDER BY s.ultima_actividad DESC;
$$;
