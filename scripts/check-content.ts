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

async function checkContent() {
  // Check posts that were imported from WP (slugs from WP)
  const wpSlugs = [
    'blis-corp',
    'diferencia-impuesto-contribuciones-y-tasas',
    'preguntas-frecuentes-patrimonio-familiar',
    'pueden-embargar-mi-patrimonio-familiar'
  ];
  
  for (const slug of wpSlugs) {
    const { data: post } = await supabase
      .from('blog_posts')
      .select('id, titulo, slug, contenido')
      .eq('slug', slug)
      .single();
    
    if (post) {
      console.log(`\n=== ${post.titulo?.substring(0, 40)} ===`);
      console.log(`Slug: ${post.slug}`);
      console.log(`Contenido length: ${post.contenido?.length || 0} chars`);
      if (post.contenido && post.contenido.length > 100) {
        console.log(`Preview (first 500): ${post.contenido.substring(0, 500)}...`);
      } else {
        console.log(`Contenido: ${post.contenido}`);
      }
    } else {
      console.log(`\nNo encontrado: ${slug}`);
    }
  }
  
  // Count total
  const { count } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true });
  console.log(`\n\nTotal posts en BD: ${count}`);
}

checkContent();