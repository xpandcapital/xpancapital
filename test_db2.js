const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://srjhrhiesienkofisvnv.supabase.co';
const supabaseKey = 'sb_publishable_0xRvUYAVKWEficLT5kHhxg_DQE3ZkhK';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data } = await supabase.from('trading_history').select('*').limit(1);
    console.log("Existing columns:", Object.keys(data?.[0] || {}));
}
check();