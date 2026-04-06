-- Add new columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS cover_image TEXT;

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);