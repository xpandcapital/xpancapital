CREATE TABLE IF NOT EXISTS public.trading_open_positions (
    id TEXT PRIMARY KEY,
    payload JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar lectura y escritura sin RLS para facilidad en front-end (ya que no hay login de usuario aún)
ALTER TABLE public.trading_open_positions DISABLE ROW LEVEL SECURITY;
