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

        const prompt = `Analiza este documento (${fileName}). Determina si es un CONTRATO o un RECIBO (o captura de Notion).
        
        EXTRACCIÓN REQUERIDA:
        - Si es CONTRATO: lotId, clientName, totalPrice, monthlyPayment.
        - Si es RECIBO/CAPTURA: Una lista de abonos encontrados: [ { "lotId": "LOTE XX", "amount": numero, "type": "cuota" | "inicial" } ].
        
        Responde ÚNICAMENTE con JSON puro.`;

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
        const rawText = json.candidates[0].content.parts[0].text;
        return JSON.parse(rawText.replace(/```json/gi, '').replace(/```/gi, '').trim());
    } catch (e) {
        console.error(`      [ERROR] ${fileName}: ${e.message}`);
        return null;
    }
}

async function main() {
    console.log("INICIANDO PROCESAMIENTO MONTEBELLO V8.1");
    const files = fs.readdirSync(FOLDER_PATH);
    
    // Almacén de datos acumulados por lote
    const globalState = {};

    function ensureLote(id) {
        if (!id) return null;
        const normalized = id.toUpperCase().includes('LOTE') ? id.toUpperCase() : `LOTE ${id.padStart(2, '0')}`;
        if (!globalState[normalized]) {
            globalState[normalized] = {
                clientName: "Identificando...",
                totalPrice: 30000,
                monthlyPayment: 500,
                totalPaid: 0,
                receipts: []
            };
        }
        return normalized;
    }

    // Procesar todos los archivos
    for (const file of files) {
        await sleep(2500);
        const res = await processFile(path.join(FOLDER_PATH, file), file);
        if (!res) continue;

        if (res.docType === 'CONTRATO' || res.totalPrice) {
            const lid = ensureLote(res.lotId || file.match(/LOTE\s?(\d+)/i)?.[1]);
            if (lid) {
                globalState[lid].clientName = res.clientName || globalState[lid].clientName;
                globalState[lid].totalPrice = parseFloat(res.totalPrice) || globalState[lid].totalPrice;
                globalState[lid].monthlyPayment = parseFloat(res.monthlyPayment) || globalState[lid].monthlyPayment;
            }
        }

        // Si la IA detectó una lista de abonos (en capturas de Notion)
        const abonos = res.abonos || (Array.isArray(res) ? res : []);
        for (const a of abonos) {
            const lid = ensureLote(a.lotId);
            if (lid) {
                globalState[lid].totalPaid += parseFloat(a.amount) || 0;
            }
        }
        
        // Si detectó un abono simple
        if (res.amount && !Array.isArray(res)) {
            const lid = ensureLote(res.lotId || file.match(/LOTE\s?(\d+)/i)?.[1]);
            if (lid) globalState[lid].totalPaid += parseFloat(res.amount);
        }
    }

    // Finalizar y subir
    console.log("\nSUBIENDO RESULTADOS A SUPABASE...");
    for (const [loteId, data] of Object.entries(globalState)) {
        const expected = (data.totalPrice * 0.5) + (9 * data.monthlyPayment);
        const debt = Math.max(0, expected - data.totalPaid);
        const projected = 20 * data.monthlyPayment;
        const balanceDeed = Math.max(0, data.totalPrice - data.totalPaid - projected);

        await supabase.from('contract_reconciliation').upsert({
            lot_id: loteId,
            client_name: data.clientName,
            total_price: data.totalPrice,
            monthly_payment: data.monthlyPayment,
            actual_paid_amount: data.totalPaid,
            actual_balance_owed: debt,
            balance_due_deed: balanceDeed,
            projected_installments_dec2026: projected,
            status: 'reconciled'
        }, { onConflict: 'lot_id' });
        console.log(`   [OK] ${loteId} sincronizado.`);
    }
}

main();
