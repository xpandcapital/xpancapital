-- Agregar tracking de clicks a short_links

ALTER TABLE short_links ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0;
ALTER TABLE short_links ADD COLUMN IF NOT EXISTS ultimo_click TIMESTAMPTZ;

-- Función para incrementar clicks de forma atómica
CREATE OR REPLACE FUNCTION track_short_link_click(link_code TEXT)
RETURNS void AS $$
BEGIN
  UPDATE short_links SET clicks = COALESCE(clicks, 0) + 1, ultimo_click = NOW() WHERE codigo = link_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
