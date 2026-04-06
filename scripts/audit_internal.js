const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// CONFIG
const SUPABASE_URL = 'https://srjhrhiesienkofisvnv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_0xRvUYAVKWEficLT5kHhxg_DQE3ZkhK'; 
const GEMINI_KEY = 'AIzaSyDTaDqoOzRBeDlZlS2rvUFse9aLMVHUsHU';
const FOLDER_PATH = './app/superadmin/Contratos de reserva';
const MODEL_ID = 'gemini-2.5-flash'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function processFile(filePath, fileName) {
    console.log(`      [IA] Analizando: ${fileName}...`);
    try {
        const fileData = fs.readFileSync(filePath);
        const base64Data = fileData.toString('base64');
        const mimeType = fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/png';

        const prompt = `Analiza este documento (${fileName}). Determina si es un CONTRATO o un RECIBO (o una captura de pantalla con datos de pagos).
        
        EXTRACCIÓN:
        - Si es CONTRATO: lotId (ej: LOTE 01), clientName, totalPrice, monthlyPayment.
        - Si es RECIBO o CAPTURA: lotId, listado de abonos [ { amount, type } ].
        
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
        console.error(`      [ERROR] ${fileName}: ${e.message}`);
        return null;
    }
}

async function main() {
    console.log("\n=========================================");
    console.log("   AUDITORÍA INTERNA MONTEBELLO v8.0");
    console.log("=========================================\n");
    
    const files = fs.readdirSync(FOLDER_PATH);
    const loteGroups = {};

    files.forEach(file => {
        const match = file.match(/LOTE\s?(\d+)/i);
        const id = match ? `LOTE ${match[1].padStart(2, '0')}` : 'GLOBAL';
        if (!loteGroups[id]) loteGroups[id] = [];
        loteGroups[id].push(file);
    });

    const entries = Object.entries(loteGroups);
    console.log(`[SISTEMA] ${entries.length} expedientes encontrados.\n`);

    for (const [loteId, groupFiles] of entries) {
        if (loteId === 'GLOBAL' && groupFiles.length > 0) {
            // Procesar capturas globales que contienen varios lotes
            console.log(`>>> PROCESANDO CAPTURAS GLOBALES...`);
            for (const file of groupFiles) {
                await sleep(2000);
                const res = await processFile(path.join(FOLDER_PATH, file), file);
                if (res && res.docType !== 'CONTRATO') {
                    // Aquí la IA debería habernos devuelto una lista de pagos por lote si es una captura de Notion
                }
            }
            continue;
        }

        console.log(`>>> LOTE: ${loteId} (${groupFiles.length} archivos)`);
        
        let contract = null;
        let payments = [];

        for (const file of groupFiles) {
            await sleep(2000); 
            const res = await processFile(path.join(FOLDER_PATH, file), file);
            if (res) {
                if (res.totalPrice) contract = res;
                if (res.amount || res.abonos) {
                    if (res.abonos) payments.push(...res.abonos);
                    else payments.push(res);
                }
            }
        }

        if (contract || loteId) {
            const client = contract?.clientName || "Procesando...";
            const price = parseFloat(contract?.totalPrice) || 30000;
            const cuota = parseFloat(contract?.monthlyPayment) || 500;
            const totalAbonado = payments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
            
            const expected = (price * 0.5) + (9 * cuota);
            const debt = Math.max(0, expected - totalAbonado);
            const projected = 20 * cuota;
            const balanceDeed = Math.max(0, price - totalAbonado - projected);

            await supabase.from('contract_reconciliation').upsert({
                lot_id: loteId,
                client_name: client,
                total_price: price,
                monthly_payment: cuota,
                actual_paid_amount: totalAbonado,
                actual_balance_owed: debt,
                balance_due_deed: balanceDeed,
                projected_installments_dec2026: projected,
                status: 'reconciled'
            }, { onConflict: 'lot_id' });
            console.log(`   [OK] Lote ${loteId} sincronizado.`);
        }
    }
}

main();
