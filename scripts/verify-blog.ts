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

async function verify() {
  // Count posts
  const { count } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true });
  console.log('Total posts:', count);
  
  // Recent posts
  const { data: recent } = await supabase
    .from('blog_posts')
    .select('titulo, publicado_en, es_premium')
    .order('publicado_en', { ascending: false })
    .limit(5);
  
  console.log('\nRecent posts:');
  recent?.forEach(p => {
    console.log(`  - ${p.titulo.substring(0, 50)}... (${p.publicado_en?.substring(0, 10)}) ${p.es_premium ? '🪙' : ''}`);
  });
  
  // Categories
  const { data: categories } = await supabase.from('blog_categorias').select('*');
  console.log('\nCategories:', categories?.length);
  categories?.forEach(c => console.log(`  - ${c.nombre}`));
  
  // Premium posts
  const { data: premium } = await supabase
    .from('blog_posts')
    .select('titulo, precio_coins, recompensa_coins')
    .eq('es_premium', true);
  
  console.log('\nPremium posts with BlisCoins:', premium?.length);
}

verify();