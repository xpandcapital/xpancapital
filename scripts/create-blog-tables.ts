/**
 * Create blog tables in Supabase
 * Run: npx ts-node scripts/create-blog-tables.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('Creating blog tables...');
  
  // Try using raw SQL via RPC
  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS blog_categorias (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      empresa_id UUID REFERENCES empresas(id),
      nombre TEXT NOT NULL,
      slug TEXT UNIQUE,
      descripcion TEXT,
      creado_en TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      empresa_id UUID REFERENCES empresas(id),
      titulo TEXT NOT NULL,
      slug TEXT UNIQUE,
      contenido TEXT,
      extracto TEXT,
      imagen_destacada TEXT,
      categoria TEXT,
      tags TEXT[],
      autor TEXT,
      estado TEXT DEFAULT 'borrador',
      publicado_en TIMESTAMPTZ,
      creado_en TIMESTAMPTZ DEFAULT now(),
      actualizado_en TIMESTAMPTZ DEFAULT now(),
      wp_id INTEGER
    );
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createTablesSQL });
    if (error) {
      console.log('RPC method not available, trying alternative...');
      
      // Workaround: use Supabase SQL editor URL
      console.log('\nPlease run this SQL in Supabase SQL Editor:');
      console.log('==========================================');
      console.log(createTablesSQL);
      console.log('==========================================');
      
      // Check if tables already exist
      const { data: postsExist, error: postsError } = await supabase
        .from('blog_posts')
        .select('id')
        .limit(1);
      
      if (postsError && postsError.code === 'PGRST204') {
        console.log('\nTable blog_posts does not exist');
      } else if (postsError) {
        console.log('Error checking blog_posts:', postsError.code);
      } else {
        console.log('\nTable blog_posts already exists');
      }
      
      const { data: catsExist, error: catsError } = await supabase
        .from('blog_categorias')
        .select('id')
        .limit(1);
      
      if (catsError && catsError.code === 'PGRST204') {
        console.log('Table blog_categorias does not exist');
      } else if (catsError) {
        console.log('Error checking blog_categorias:', catsError.code);
      } else {
        console.log('Table blog_categorias already exists');
      }
      
      return;
    }
    console.log('Tables created successfully');
  } catch (e) {
    console.error('Error:', e);
  }
}

createTables();