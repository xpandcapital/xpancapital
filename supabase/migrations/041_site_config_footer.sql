-- Add footer and VIP fields to site_config

ALTER TABLE site_config 
ADD COLUMN IF NOT EXISTS footer_vip_title VARCHAR(100) DEFAULT 'Acceso VIP',
ADD COLUMN IF NOT EXISTS footer_vip_description TEXT DEFAULT 'Únete a la lista de inversores selectos para recibir análisis de mercado.',
ADD COLUMN IF NOT EXISTS footer_vip_placeholder VARCHAR(100) DEFAULT 'Tu correo corporativo',
ADD COLUMN IF NOT EXISTS footer_vip_button VARCHAR(50) DEFAULT 'Suscribirme',
ADD COLUMN IF NOT EXISTS footer_projects_title VARCHAR(50) DEFAULT 'Proyectos',
ADD COLUMN IF NOT EXISTS footer_legal_title VARCHAR(50) DEFAULT 'Legal',
ADD COLUMN IF NOT EXISTS footer_location_text VARCHAR(200) DEFAULT 'Diseñado con visión en 🇪🇨 Ecuador · 🇵🇪 Perú',
ADD COLUMN IF NOT EXISTS footer_show_projects BOOLEAN DEFAULT true;