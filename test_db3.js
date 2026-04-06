const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://srjhrhiesienkofisvnv.supabase.co';
const supabaseKey = 'sb_publishable_0xRvUYAVKWEficLT5kHhxg_DQE3ZkhK'; // Wait, this is the anon key, I can't run DDL with anon key.

// Let's check if anon key has privileges
async function run() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.rpc('test');
    console.log(error);
}
run();