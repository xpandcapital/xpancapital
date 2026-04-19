-- 050: API Keys multi-tenant (empresa_id) + RLS
-- Ejecutado manualmente en Supabase SQL Editor antes de este archivo.
-- Este archivo queda como documentación de la migración.

-- Nota: Las siguientes sentencias YA FUERON EJECUTADAS en Supabase.
-- Se incluyen aquí como registro formal de la migración.

-- ALTER TABLE api_keys DROP CONSTRAINT api_keys_key_name_key;
-- ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id);
-- UPDATE api_keys SET empresa_id = '6186f014-c8c7-4027-9f08-8acf2bae3eae' WHERE empresa_id IS NULL;
-- ALTER TABLE api_keys ALTER COLUMN empresa_id SET NOT NULL;
-- CREATE UNIQUE INDEX api_keys_key_name_empresa_key ON api_keys(key_name, empresa_id);
-- ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can read own empresa keys" ON api_keys FOR SELECT USING (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));
-- CREATE POLICY "Admins can manage own empresa keys" ON api_keys FOR ALL USING (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()) AND (SELECT rol FROM profiles WHERE id = auth.uid()) IN ('superadmin', 'admin'));

SELECT 1;