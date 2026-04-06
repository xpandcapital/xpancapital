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
  // Count all posts
  const { count: total } = await supabase
    .from('blog_posts')
    .select('id', { count: 'exact', head: true });
  console.log('Total posts:', total);

  // Count published
  const { count: published } = await supabase
    .from('blog_posts')
    .select('id', { count: 'exact', head: true })
    .eq('estado', 'publicado');
  console.log('Posts publicados:', published);

  // Count posts without categoria_id
  const { data: noCat } = await supabase
    .from('blog_posts')
    .select('id, titulo')
    .is('categoria_id', null)
    .limit(5);
  console.log('Posts sin categoria_id:', noCat?.length || 0);
  
  // Check sample posts
  const { data: sample } = await supabase
    .from('blog_posts')
    .select('id, titulo, estado, categoria_id')
    .limit(3);
  console.log('Sample posts:', sample);
}

check();