import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Check if templates table already exists
    const { error: checkError } = await supabase
      .from('templates')
      .select('id')
      .limit(1)

    if (!checkError) {
      return NextResponse.json({ 
        success: true, 
        message: 'Tables already exist' 
      })
    }

    // Try creating tables via the REST API
    // Note: This is a simplified approach - for production, use Supabase migrations
    
    const createTemplatesTable = `
      CREATE TABLE IF NOT EXISTS templates (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
        nombre VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL,
        tipo_contenido VARCHAR(30) NOT NULL DEFAULT 'landing',
        estado VARCHAR(20) DEFAULT 'borrador',
        es_principal BOOLEAN DEFAULT false,
        mostrar_en_menu BOOLEAN DEFAULT true,
        mostrar_en_footer BOOLEAN DEFAULT true,
        secciones JSONB NOT NULL DEFAULT '{}',
        meta_titulo VARCHAR(200),
        meta_descripcion TEXT,
        meta_keywords TEXT[],
        og_imagen TEXT,
        thumbnail_url TEXT,
        descripcion TEXT,
        creado_por UUID REFERENCES profiles(id),
        creado_en TIMESTAMPTZ DEFAULT NOW(),
        actualizado_en TIMESTAMPTZ DEFAULT NOW(),
        publicado_en TIMESTAMPTZ,
        CONSTRAINT unique_slug_empresa UNIQUE(empresa_id, slug)
      );
    `

    const createTemplateVersionesTable = `
      CREATE TABLE IF NOT EXISTS template_versiones (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
        version INT NOT NULL DEFAULT 1,
        secciones JSONB NOT NULL,
        creado_en TIMESTAMPTZ DEFAULT NOW(),
        creado_por UUID REFERENCES profiles(id),
        notas TEXT,
        UNIQUE(template_id, version)
      );
    `

    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_templates_empresa ON templates(empresa_id);
      CREATE INDEX IF NOT EXISTS idx_templates_tipo ON templates(tipo_contenido);
      CREATE INDEX IF NOT EXISTS idx_templates_estado ON templates(estado);
      CREATE INDEX IF NOT EXISTS idx_templates_activos ON templates(empresa_id) WHERE estado = 'activo';
      CREATE INDEX IF NOT EXISTS idx_templates_menu ON templates(empresa_id, mostrar_en_menu) WHERE mostrar_en_menu = true AND estado = 'activo';
      CREATE UNIQUE INDEX IF NOT EXISTS idx_templates_principal_por_tipo ON templates(empresa_id, tipo_contenido) WHERE es_principal = true AND estado = 'activo';
      CREATE INDEX IF NOT EXISTS idx_template_versiones ON template_versiones(template_id, version DESC);
    `

    const enableRLS = `
      ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
      ALTER TABLE template_versiones ENABLE ROW LEVEL SECURITY;
    `

    const createPolicies = `
      CREATE POLICY IF NOT EXISTS "Usuarios ven templates de su empresa" ON templates
      FOR SELECT USING (
        empresa_id IN (
          SELECT empresa_id FROM profiles WHERE id = auth.uid()
        )
      );

      CREATE POLICY IF NOT EXISTS "Usuarios pueden crear templates" ON templates
      FOR INSERT WITH CHECK (
        empresa_id IN (
          SELECT empresa_id FROM profiles WHERE id = auth.uid()
        )
      );

      CREATE POLICY IF NOT EXISTS "Usuarios pueden actualizar templates" ON templates
      FOR UPDATE USING (
        empresa_id IN (
          SELECT empresa_id FROM profiles WHERE id = auth.uid()
        )
      );

      CREATE POLICY IF NOT EXISTS "Admins pueden eliminar templates" ON templates
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND rol IN ('admin', 'superadmin')
          AND empresa_id = templates.empresa_id
        )
      );

      CREATE POLICY IF NOT EXISTS "Usuarios pueden ver versiones" ON template_versiones
      FOR SELECT USING (
        template_id IN (
          SELECT id FROM templates 
          WHERE empresa_id IN (
            SELECT empresa_id FROM profiles WHERE id = auth.uid()
          )
        )
      );

      CREATE POLICY IF NOT EXISTS "Usuarios pueden crear versiones" ON template_versiones
      FOR INSERT WITH CHECK (
        template_id IN (
          SELECT id FROM templates 
          WHERE empresa_id IN (
            SELECT empresa_id FROM profiles WHERE id = auth.uid()
          )
        )
      );
    `

    // Execute SQL via rpc (if available) or return the SQL for manual execution
    // Since we can't execute DDL via the REST API, we'll return the SQL
    // and instructions for manual execution

    return NextResponse.json({
      success: false,
      message: 'Please run the migration manually in Supabase SQL Editor',
      instructions: [
        '1. Go to your Supabase Dashboard',
        '2. Navigate to SQL Editor',
        '3. Create a new query',
        '4. Paste the contents of: supabase/migrations/021_templates.sql',
        '5. Execute the query'
      ],
      sqlFile: '/supabase/migrations/021_templates.sql'
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}