/**
 * Check blog_posts schema and find valid autor_id
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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function checkSchema() {
  // Check if there's an autores table
  console.log('Checking autores table...');
  const { data: autores, error: autoresError } = await supabase
    .from('autores')
    .select('*')
    .limit(5);
  
  if (autoresError) {
    console.log('No autores table:', autoresError.message);
  } else {
    console.log('Autores found:', autores?.length || 0);
    if (autores && autores.length > 0) {
      console.log('First autor:', autores[0]);
    }
  }
  
  // Check if there's an usuarios table
  console.log('\nChecking usuarios table...');
  const { data: usuarios, error: usuariosError } = await supabase
    .from('usuarios')
    .select('id, nombre, email')
    .limit(5);
  
  if (usuariosError) {
    console.log('No usuarios table:', usuariosError.message);
  } else {
    console.log('Usuarios found:', usuarios?.length || 0);
    if (usuarios && usuarios.length > 0) {
      console.log('Using first usuario as author:', usuarios[0].id, usuarios[0].nombre);
    }
  }
  
  // Check blog_posts table constraints
  console.log('\nChecking blog_posts sample...');
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .limit(1);
  
  if (posts && posts.length > 0) {
    console.log('Sample blog_post columns:', Object.keys(posts[0]));
  }
  
  // Try to insert without autor_id
  console.log('\nTrying to insert with null autor_id...');
  const testPost = {
    empresa_id: '6186f014-c8c7-4027-9f08-8acf2bae3eae',
    titulo: 'TEST - DELETE ME',
    slug: 'test-delete-me-' + Date.now(),
    contenido: 'test',
    extracto: 'test',
    estado: 'borrador',
  };
  
  const { error: insertError } = await supabase
    .from('blog_posts')
    .insert(testPost);
  
  if (insertError) {
    console.log('Insert error:', insertError.message);
    
    // Try with usuarios
    if (usuarios && usuarios.length > 0) {
      console.log('\nTrying with first usuario as autor_id...');
      const testPost2 = {
        ...testPost,
        slug: 'test-delete-me-2-' + Date.now(),
        autor_id: usuarios[0].id,
      };
      
      const { error: insertError2 } = await supabase
        .from('blog_posts')
        .insert(testPost2);
      
      if (insertError2) {
        console.log('Insert error 2:', insertError2.message);
      } else {
        console.log('✅ Insert successful with usuario id!');
        // Clean up
        await supabase.from('blog_posts').delete().eq('slug', testPost2.slug);
      }
    }
  } else {
    console.log('✅ Insert successful without autor_id!');
    // Clean up
    await supabase.from('blog_posts').delete().eq('slug', testPost.slug);
  }
  
  // Clean up test posts
  await supabase.from('blog_posts').delete().like('slug', 'test-delete-me%');
}

checkSchema();