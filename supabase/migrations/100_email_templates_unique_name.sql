-- Backfill: poblar columna evento desde settings->>'evento' en plantillas existentes
UPDATE email_templates
SET evento = CASE 
  WHEN settings->>'evento' IS NOT NULL AND settings->>'evento' != 'ninguno' 
  THEN settings->>'evento' 
  ELSE NULL 
END
WHERE evento IS NULL AND settings IS NOT NULL;

-- Eliminar plantillas duplicadas (conservar la más reciente)
DELETE FROM email_templates a
USING email_templates b
WHERE a.empresa_id = b.empresa_id
  AND a.nombre = b.nombre
  AND a.creado_en < b.creado_en;

-- Unique constraint: no puede haber dos plantillas con el mismo nombre en la misma empresa
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_templates_empresa_nombre
  ON email_templates(empresa_id, nombre);
