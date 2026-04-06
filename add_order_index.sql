-- Agregar columna order_index a la tabla projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Actualizar proyectos existentes con order_index basado en created_at
UPDATE projects SET order_index = EXTRACT(EPOCH FROM created_at)::INTEGER WHERE order_index IS NULL OR order_index = 0;

-- Crear índice para ordenamiento
CREATE INDEX IF NOT EXISTS projects_order_index_idx ON projects(order_index);
