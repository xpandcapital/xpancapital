/**
 * Fix blog posts table - add missing column
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
  console.log('Checking blog_posts table schema...');
  
  // Try to get one row to see what columns exist
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('Error:', error);
  } else if (data && data.length > 0) {
    console.log('Existing columns:', Object.keys(data[0]));
  } else {
    console.log('Table exists but is empty');
  }
  
  // Try to add the missing column via RPC
  const addColumnSQL = `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS autor TEXT;`;
  
  const { error: rpcError } = await supabase.rpc('exec_sql', { sql: addColumnSQL });
  
  if (rpcError) {
    console.log('\nPlease run this SQL in Supabase SQL Editor:');
    console.log('==========================================');
    console.log(addColumnSQL);
    console.log('==========================================');
  } else {
    console.log('Column added successfully!');
  }
}

fixTable();