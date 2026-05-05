-- Agrega tipo 'legal' al CHECK constraint de tipo_contenido en templates
-- para permitir páginas legales editables desde el editor de templates

ALTER TABLE templates DROP CONSTRAINT IF EXISTS templates_tipo_contenido_check;

ALTER TABLE templates ADD CONSTRAINT templates_tipo_contenido_check 
CHECK (tipo_contenido IN (
    'landing', 'blog', 'blog_post', 'tienda', 'producto',
    'curso', 'leccion', 'proyecto', 'funnel', 'captura',
    'checkout', 'thankyou', 'legal'
));
