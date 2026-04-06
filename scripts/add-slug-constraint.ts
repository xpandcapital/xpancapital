/**
 * Fix blog_posts table - add unique constraint on slug
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

async function fixTable() {
  console.log('Checking blog_posts table...');
  
  // Check existing posts
  const { data: existingPosts, error: countError } = await supabase
    .from('blog_posts')
    .select('id, slug')
    .limit(5);
  
  if (existingPosts && existingPosts.length > 0) {
    console.log('Existing posts:', existingPosts.length);
    console.log('Sample:', existingPosts[0]);
  }
  
  // Try to insert a test post
  console.log('\nTrying to add unique constraint via SQL...');
  
  const sql = `
    -- Add unique constraint on slug
    CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_unique ON blog_posts(slug);
  `;
  
  console.log('\nPlease run this SQL in Supabase SQL Editor:');
  console.log('==========================================');
  console.log(sql);
  console.log('==========================================');
  console.log('\nAfter adding the constraint, run:');
  console.log('npx ts-node scripts/import-blog.ts');
}

fixTable();