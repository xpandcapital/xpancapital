const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://srjhrhiesienkofisvnv.supabase.co';
const supabaseKey = 'sb_publishable_0xRvUYAVKWEficLT5kHhxg_DQE3ZkhK';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    // Check trading_history
    const { data: history } = await supabase
        .from('trading_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
    
    console.log("=== RECENT TRADING HISTORY ===");
    console.log(`Total records: ${history?.length || 0}`);
    history?.forEach((t, i) => {
        console.log(`${i+1}. ${t.symbol} | ${t.trade_type} | $${t.amount} | PnL: $${t.final_pnl} | Created: ${new Date(t.created_at).toLocaleString()}`);
    });

    // Calculate total PnL from DB
    const { data: allHistory } = await supabase
        .from('trading_history')
        .select('final_pnl');
    
    const totalPnL = allHistory?.reduce((acc, t) => acc + (t.final_pnl || 0), 0) || 0;
    const wins = allHistory?.filter(t => t.final_pnl > 0).length || 0;
    const losses = allHistory?.filter(t => t.final_pnl < 0).length || 0;
    
    console.log("\n=== DATABASE SUMMARY ===");
    console.log(`Total trades in DB: ${allHistory?.length || 0}`);
    console.log(`Total Wins: ${wins}`);
    console.log(`Total Losses: ${losses}`);
    console.log(`Total PnL: $${totalPnL.toFixed(2)}`);
    console.log(`Starting balance was $200, estimated current: $${(200 + totalPnL).toFixed(2)}`);

    // Check open positions
    const { data: openPositions } = await supabase
        .from('trading_open_positions')
        .select('*');
    
    console.log("\n=== OPEN POSITIONS ===");
    console.log(`Open positions: ${openPositions?.length || 0}`);
    openPositions?.forEach((p, i) => {
        console.log(`${i+1}. ${p.id} | Payload: ${JSON.stringify(p.payload).slice(0, 100)}...`);
    });
}

checkData();