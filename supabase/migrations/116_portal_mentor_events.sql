-- Portal: Eventos del Mentor + Finnhub
ALTER TABLE comunidad_posts ADD COLUMN IF NOT EXISTS es_evento_mentor BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_comunidad_posts_evento_mentor ON comunidad_posts(es_evento_mentor, created_at DESC) WHERE es_evento_mentor = true AND oculto = false;
