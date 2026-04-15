CREATE TABLE IF NOT EXISTS postulantes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT,
    puesto TEXT NOT NULL,
    linkedin_url TEXT,
    experiencia_años INTEGER DEFAULT 0,
    nota TEXT,
    cv_url TEXT,
    estado TEXT DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'en_revision', 'entrevista', 'aceptado', 'rechazado')),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_postulantes_empresa ON postulantes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_postulantes_estado ON postulantes(estado);
CREATE INDEX IF NOT EXISTS idx_postulantes_puesto ON postulantes(puesto);

-- RLS
ALTER TABLE postulantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access for authenticated users" ON postulantes
    FOR ALL USING (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_postulantes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER postulantes_updated_at
    BEFORE UPDATE ON postulantes
    FOR EACH ROW
    EXECUTE FUNCTION update_postulantes_updated_at();