const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://srjhrhiesienkofisvnv.supabase.co';
const supabaseKey = 'sb_publishable_0xRvUYAVKWEficLT5kHhxg_DQE3ZkhK';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSessionIdColumn() {
    try {
        const { data, error } = await supabase.from('trading_history').select('session_id').limit(1);
        if (error) {
            console.log('Error selecting session_id:', error.message);
            // If column doesn't exist, error will be like: invalid column name
            return false;
        } else {
            console.log('session_id column exists, sample value:', data[0]?.session_id);
            return true;
        }
    } catch (err) {
        console.log('Exception:', err);
        return false;
    }
}

checkSessionIdColumn();