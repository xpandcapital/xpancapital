-- ============================================================
-- 089: Agregar tablas del dashboard a supabase_realtime
-- Necesario para que el dashboard reciba actualizaciones en vivo
-- ============================================================

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE compras; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE leads; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE blog_posts; EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT 'Realtime dashboard tables added' AS status;
