-- Add config column to templates table for branding and custom settings
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}';

-- Create index for faster config queries
CREATE INDEX IF NOT EXISTS idx_templates_config ON templates USING GIN (config);

-- Update existing template with default config
UPDATE templates 
SET config = jsonb_build_object(
    'showHeader', true,
    'showFooter', true,
    'branding', jsonb_build_object(
        'name', 'BLIS Corp',
        'primaryColor', '#B10D24',
        'secondaryColor', '#10B981',
        'backgroundColor', '#000000',
        'textColor', '#FFFFFF',
        'accentColor', '#B10D24',
        'logoHorizontal', '/images/blis-logo.png',
        'logoVertical', '/images/logo-blis-vertical.png'
    )
)
WHERE config IS NULL OR config = '{}';