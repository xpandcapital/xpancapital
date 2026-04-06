const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// CONFIGURACIÓN MAESTRA
const SUPABASE_URL = 'https://srjhrhiesienkofisvnv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_0xRvUYAVKWEficLT5kHhxg_DQE3ZkhK'; 
const GEMINI_KEY = 'AIzaSyDTaDqoOzRBeDlZlS2rvUFse9aLMVHUsHU';
const FOLDER_PATH = 'D:/Downloads/Montebello/Contratos de reserva';
const MODEL_ID = 'gemini-2.0-flash'; // Usando el modelo de nueva generación disponible

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function processFile(filePath, fileName) {
    console.log(`      [IA] Analizando documento: ${fileName}...`);
    try {
        const fileData = fs.readFileSync(filePath);
        const base64Data = fileData.toString('base64');
        const mimeType = fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/png';

        const prompt = `Extrae de este contrato o recibo de Montebello: 
        1. lotId (ej: LOTE 01)
        2. clientName
        3. totalPrice (si es contrato)
        4. monthlyPayment (si es contrato)
        5. monthlyStartDate (YYYY-MM-DD)
        6. amount (si es recibo/abono)
        7. type (inicial o cuota)
        Responde SOLO el JSON puro.`;

        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType, data: base64Data } }] }],
                generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
            })
        });

        const json = await resp.json();
        if (json.error) throw new Error(json.error.message);
        return JSON.parse(json.candidates[0].content.parts[0].text);
    } catch (e) {
        console.error(`      [ERROR IA] ${fileName}: ${e.message}`);
        return null;
    }
}

async function main() {
    console.log("\n=========================================");
    console.log("   AUDITORÍA TOTAL MONTEBELLO v7.0");
    console.log("=========================================\n");
    
    const files = fs.readdirSync(FOLDER_PATH);
    const loteGroups = {};

    files.forEach(file => {
        const match = file.match(/LOTE\s?(\d+)/i);
        const id = match ? `LOTE ${match[1].padStart(2, '0')}` : null;
        if (id) {
            if (!loteGroups[id]) loteGroups[id] = [];
            loteGroups[id].push(file);
        }
    });

    const entries = Object.entries(loteGroups);
    console.log(`[SISTEMA] ${entries.length} expedientes detectados.\n`);

    for (const [loteId, groupFiles] of entries) {
        console.log(`>>> PROCESANDO ${loteId} (${groupFiles.length} archivos)...`);
        
        let contract = null;
        let totalAbonado = 0;
        let cuotasPagadas = 0;
        let inicialPagada = 0;

        for (const file of groupFiles) {
            await sleep(2000); 
            const res = await processFile(path.join(FOLDER_PATH, file), file);
            if (res) {
                if (res.totalPrice) contract = res;
                if (res.amount) {
                    const amt = parseFloat(res.amount);
                    totalAbonado += amt;
                    if (res.type === 'cuota') cuotasPagadas += amt;
                    else inicialPagada += amt;
                }
            }
        }

        const client = contract?.clientName || "Cliente Montebello";
        const price = parseFloat(contract?.totalPrice) || 30000;
        const cuota = parseFloat(contract?.monthlyPayment) || 500;
        
        // Lógica de cálculo 2026/2027
        const expected = (price * 0.5) + (9 * cuota); // Meta Abril 2026
        const debt = Math.max(0, expected - totalAbonado);
        const projected = 20 * cuota; // Hasta Dic 2027
        const balanceDeed = Math.max(0, price - totalAbonado - projected);

        console.log(`   [BASE DE DATOS] Guardando Lote ${loteId}...`);
        const { error } = await supabase.from('contract_reconciliation').upsert({
            lot_id: loteId,
            client_name: client,
            total_price: price,
            monthly_payment: cuota,
            actual_paid_amount: totalAbonado,
            total_paid_installments: cuotasPagadas,
            total_paid_initial: inicialPagada,
            actual_balance_owed: debt,
            balance_due_deed: balanceDeed,
            projected_installments_dec2026: projected,
            status: 'reconciled'
        }, { onConflict: 'lot_id' });

        if (error) console.error("      [ERROR DB]", error.message);
        else console.log(`   [LISTO] ${loteId} sincronizado.\n`);
    }
    console.log("\n=========================================");
    console.log("   AUDITORÍA COMPLETADA - REVISA EL PANEL");
    console.log("=========================================");
}

main();
