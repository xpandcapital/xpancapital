import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function check() {
  // Check profiles table
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, nombre, apellido')
    .limit(3);
  
  console.log('Profiles:', profilesError ? profilesError.message : profiles);
  
  // Check blog_categorias
  const { data: categorias } = await supabase
    .from('blog_categorias')
    .select('*');
  
  console.log('\nCategorias:', categorias?.length);
  categorias?.forEach(c => console.log(`  - ${c.nombre} (${c.id})`));
  
  // Check blog_posts sample
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, titulo, categoria_id, autor_id')
    .limit(3);
  
  console.log('\nPosts sample:', posts);
  
  // Check blog_posts columns
  const { data: samplePost } = await supabase
    .from('blog_posts')
    .select('*')
    .limit(1);
  
  console.log('\nPost columns:', samplePost ? Object.keys(samplePost[0]) : 'none');
}

check();