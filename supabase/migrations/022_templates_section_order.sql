-- Add section order and visibility to templates table
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS "sectionOrder" TEXT[] DEFAULT '{}';

ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS "sectionVisibility" JSONB DEFAULT '{}';

-- Update existing templates with default section order
UPDATE templates 
SET "sectionOrder" = ARRAY['hero', 'about', 'video', 'process', 'operations', 'market', 'calculator', 'map', 'projects', 'catalog', 'team', 'testimonials', 'faq', 'blog', 'footer']
WHERE "sectionOrder" IS NULL OR "sectionOrder" = '{}';