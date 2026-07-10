-- ============================================================
-- 096: Agregar empresa_id a tablas sin multi-tenant
-- ============================================================

-- Tabla de progreso de cursos (consultada directamente en GET /api/cursos)
ALTER TABLE curso_progreso ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id);
DO $$ BEGIN
  UPDATE curso_progreso cp SET empresa_id = c.empresa_id
  FROM cursos c WHERE c.id = cp.curso_id AND cp.empresa_id IS NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_curso_progreso_empresa ON curso_progreso(empresa_id);

-- Tabla de asignación equipo-cursos
ALTER TABLE equipo_cursos ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id);
DO $$ BEGIN
  UPDATE equipo_cursos ec SET empresa_id = c.empresa_id
  FROM cursos c WHERE c.id = ec.curso_id AND ec.empresa_id IS NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_equipo_cursos_empresa ON equipo_cursos(empresa_id);

-- Tabla de certificados
ALTER TABLE certificados ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id);
DO $$ BEGIN
  UPDATE certificados cer SET empresa_id = c.empresa_id
  FROM cursos c WHERE c.id = cer.curso_id AND cer.empresa_id IS NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_certificados_empresa ON certificados(empresa_id);

-- Tabla de short links (usada en checkout, sin empresa_id)
ALTER TABLE short_links ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id);
UPDATE short_links SET empresa_id = '6186f014-c8c7-4027-9f08-8acf2bae3eae' WHERE empresa_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_short_links_empresa ON short_links(empresa_id);

-- Login history (seguridad)
ALTER TABLE login_history ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id);
UPDATE login_history SET empresa_id = '6186f014-c8c7-4027-9f08-8acf2bae3eae' WHERE empresa_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_login_history_empresa ON login_history(empresa_id);

SELECT 'empresa_id added to 5 tables' AS status;
