-- ============================================================
-- 090: Agregar empresa_id a projects para multi-tenant
-- ============================================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL;
UPDATE projects SET empresa_id = '6186f014-c8c7-4027-9f08-8acf2bae3eae' WHERE empresa_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_empresa_id ON projects(empresa_id);

SELECT 'projects.empresa_id added' AS status;
