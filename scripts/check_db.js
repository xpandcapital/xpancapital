const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://srjhrhiesienkofisvnv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_0xRvUYAVKWEficLT5kHhxg_DQE3ZkhK';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    console.log("Comprobando base de datos...");
    const { data, error } = await supabase.from('contract_reconciliation').select('id, lot_id, client_name, actual_paid_amount');
    
    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log(`Filas encontradas: ${data.length}`);
        console.table(data.slice(0, 10));
    }
}

check();
