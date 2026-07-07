const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://srjhrhiesienkofisvnv.supabase.co';
const supabaseKey = 'sb_publishable_0xRvUYAVKWEficLT5kHhxg_DQE3ZkhK';
const supabase = createClient(supabaseUrl, supabaseKey);

async function addSessionIdColumn() {
    try {
        // Add sessionId column to trading_history table
        const { error } = await supabase.rpc('exec_sql', { 
            sql: `ALTER TABLE public.trading_history ADD COLUMN IF NOT EXISTS session_id TEXT;`
        });
        
        if (error) {
            console.error('Error adding session_id column:', error);
            // Try alternative approach
            const { error2 } = await supabase.from('trading_history').select('session_id').limit(1);
            if (error2 && error2.message && error2.message.includes('session_id')) {
                console.log('Column does not exist, need to add it via Supabase dashboard or migration');
            } else {
                console.log('session_id column already exists or accessible');
            }
        } else {
            console.log('Successfully added session_id column to trading_history');
        }
    } catch (err) {
        console.error('Exception:', err);
    }
}

addSessionIdColumn();