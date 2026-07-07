-- ============================================================
-- 089: Agregar tablas del dashboard a supabase_realtime
-- Necesario para que el dashboard reciba actualizaciones en vivo
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE compras;
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE blog_posts;

SELECT 'Realtime dashboard tables added' AS status;
