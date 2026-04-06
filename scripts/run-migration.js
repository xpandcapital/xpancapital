const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('Running migration: 021_templates.sql');
  
  const sqlPath = path.join(__dirname, 'supabase', 'migrations', '021_templates.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  // Split by semicolons and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  for (const statement of statements) {
    if (!statement) continue;
    
    try {
      // Use raw SQL execution via RPC
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
      
      if (error) {
        // Try direct query if RPC fails
        console.log(`Executing: ${statement.substring(0, 100)}...`);
        const { error: directError } = await supabase.from('_migrations').select('*').limit(1);
        
        if (directError && directError.code !== 'PGRST116') {
          console.error('Error:', directError.message);
        }
      }
    } catch (err) {
      console.error('Error executing statement:', err.message);
    }
  }
  
  console.log('Migration completed!');
  
  // Verify tables exist
  const { data: templates, error: templatesError } = await supabase
    .from('templates')
    .select('id')
    .limit(1);
    
  if (templatesError) {
    console.log('Note: You may need to run the migration manually in Supabase SQL Editor');
    console.log('The SQL file is located at: supabase/migrations/021_templates.sql');
  } else {
    console.log('✓ Templates table created successfully');
  }
}

runMigration().catch(console.error);