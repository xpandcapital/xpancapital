-- Agregar columna evento a email_templates para vincular plantillas a eventos del sistema
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS evento TEXT DEFAULT NULL;

-- Indice unico parcial: solo una plantilla por evento por empresa
-- NULL y 'ninguno' permiten multiples plantillas sin evento asignado
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_templates_evento_unique 
  ON email_templates(empresa_id, evento) 
  WHERE evento IS NOT NULL AND evento != 'ninguno';

-- Indice para busqueda rapida por evento
CREATE INDEX IF NOT EXISTS idx_email_templates_evento ON email_templates(evento);
