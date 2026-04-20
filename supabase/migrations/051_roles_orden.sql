-- Add orden column to roles table for custom display order
ALTER TABLE roles ADD COLUMN IF NOT EXISTS orden INTEGER DEFAULT 0;

-- Set default order for existing roles
UPDATE roles SET orden = 1 WHERE nombre = 'superadmin';
UPDATE roles SET orden = 2 WHERE nombre = 'admin';
UPDATE roles SET orden = 3 WHERE nombre = 'editor';
UPDATE roles SET orden = 4 WHERE nombre = 'cliente';
UPDATE roles SET orden = 5 WHERE nombre = 'usuario';

-- Set orden for any custom roles that don't have one
UPDATE roles SET orden = 99 WHERE orden IS NULL OR orden = 0;

-- Addorden column label and descripcion updates
-- (These columns already exist from migration 047)