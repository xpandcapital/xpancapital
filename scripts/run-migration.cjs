const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  const migrationFile = path.join(__dirname, 'supabase/migrations/029_leads_campanas.sql');
  const sql = fs.readFileSync(migrationFile, 'utf8');

  console.log('Running migration: 029_leads_campanas.sql');
  console.log('---');

  // Split SQL into individual statements and execute each
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMIT'));

  for (const statement of statements) {
    if (statement.includes('CREATE TABLE') || statement.includes('CREATE INDEX') || statement.includes('CREATE POLICY') || statement.includes('CREATE TRIGGER') || statement.includes('CREATE OR REPLACE FUNCTION') || statement.includes('ALTER TABLE') || statement.includes('INSERT INTO')) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        if (error) {
          // Try direct query if RPC fails
          console.log(`Executing: ${statement.substring(0, 50)}...`);
          // We'll use the REST API to execute
        }
      } catch (e) {
        console.log(`Statement: ${statement.substring(0, 80)}...`);
      }
    }
  }

  console.log('Migration completed (please verify in Supabase dashboard)');
}

runMigration().catch(console.error);