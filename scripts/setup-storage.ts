/**
 * Check and create storage bucket for blog images
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
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function setupStorage() {
  console.log('Checking storage buckets...');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error listing buckets:', error);
      return;
    }
    
    console.log('Existing buckets:', buckets?.map(b => b.name).join(', ') || 'none');
    
    const cmsBucket = buckets?.find(b => b.name === 'cms');
    
    if (!cmsBucket) {
      console.log('\nCreating cms bucket...');
      const { data, error: createError } = await supabase.storage.createBucket('cms', {
        public: true,
        fileSizeLimit: 5242880
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
      } else {
        console.log('cms bucket created successfully!');
      }
    } else {
      console.log('\ncms bucket already exists');
    }
    
  } catch (e) {
    console.error('Error:', e);
  }
}

setupStorage();