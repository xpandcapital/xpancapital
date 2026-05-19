-- 093: Configuración de seguridad (geobloqueo, rate limiting, firewall)
-- Agrega columna JSONB a site_config para herramientas de seguridad extensibles

ALTER TABLE site_config
ADD COLUMN IF NOT EXISTS security_config JSONB DEFAULT '{}';

COMMENT ON COLUMN site_config.security_config IS 'Configuración de herramientas de seguridad. Estructura: { geobloqueo: { habilitado, modo, paises_bloqueados, paises_permitidos, mensaje_bloqueo }, rate_limiting: {...}, firewall: {...} }';
