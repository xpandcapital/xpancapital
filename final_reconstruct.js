const fs = require('fs');
let code = fs.readFileSync('tmp_POSManager.tsx', 'utf8');

// Function to balance divs
function balanceDivs(str) {
    let d = 0;
    const parts = str.split(/(<\/div>|<div(?!\w))/);
    parts.forEach(p => {
        if (p === '<div') d++;
        else if (p === '</div>') d--;
    });
    console.log("Balancing depth:", d);
    if (d > 0) return str + '\n' + '</div>'.repeat(d);
    return str;
}

// Split point before old modal
const splitPoint = code.indexOf('isCheckoutOpen &&');
if (splitPoint === -1) {
    console.log("Could not find modal start");
    process.exit(1);
}

let uiPart = code.substring(0, splitPoint).trimEnd();
// Remove the trailing {
if (uiPart.endsWith('{')) {
    uiPart = uiPart.substring(0, uiPart.length - 1).trimEnd();
}
uiPart = balanceDivs(uiPart);

const improvedModal = `
            {isCheckoutOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
                        onClick={() => {
                            setIsCheckoutOpen(false);
                            setInvoiceResult(null);
                        }}
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="bg-zinc-950 border border-white/10 rounded-[2.5rem] md:rounded-[4rem] w-full max-w-6xl relative z-10 shadow-3xl flex flex-col lg:flex-row overflow-hidden max-h-[95vh] md:max-h-[min(900px,90vh)]"
                    >
                        {/* LEFT COLUMN: Steps & Confirmation */}
                        <div className="flex-1 flex flex-col min-w-0 bg-zinc-900/20">
                            <div className="p-6 md:p-10 border-b border-white/5 flex justify-between items-center bg-black/40">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">Checkout</h2>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{documentType} • {customer?.name || 'Consumidor Final'}</p>
                                </div>
                                <button onClick={() => setIsCheckoutOpen(false)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
                                    <X className="w-5 h-5 text-zinc-500" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 no-scrollbar">
                                {!invoiceResult ? (
                                    <>
                                        {/* STEP 1: PAYMENT METHOD */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-emerald-500 text-black text-[10px] font-black flex items-center justify-center">1</div>
                                                <h3 className="text-xs font-black uppercase tracking-widest text-white/60">Método de Pago</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { id: 'cash', icon: Banknote, label: 'Efectivo', desc: 'Sencillo / Caja' },
                                                    { id: 'card', icon: CreditCard, label: 'Tarjeta', desc: 'Visa / MC / Izi' },
                                                    { id: 'bliscoins', icon: Coins, label: 'BlisCoins', desc: 'Puntos Fidelidad' },
                                                    { id: 'transfer', icon: ArrowRightLeft, label: 'Transferencia', desc: 'Yape / Plin / Bank' }
                                                ].map(method => (
                                                    <button
                                                        key={method.id}
                                                        onClick={() => setPaymentMethod(method.id as any)}
                                                        className={\`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left \${paymentMethod === method.id ? 'bg-emerald-500/10 border-emerald-500' : 'bg-black/40 border-white/5 hover:border-white/10'}\`}
                                                    >
                                                        <div className={\`w-10 h-10 rounded-xl bg-black border border-white/5 flex items-center justify-center shrink-0 \${paymentMethod === method.id ? 'text-emerald-500' : 'text-white/20'}\`}>
                                                            <method.icon className="w-5 h-5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-[10px] font-black uppercase text-white leading-none mb-1">{method.label}</div>
                                                            <div className="text-[7px] font-bold text-zinc-600 uppercase truncate">{method.desc}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* STEP 2: BILLING OPTIONS */}
                                        <div className="space-y-4 pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-emerald-500 text-black text-[10px] font-black flex items-center justify-center">2</div>
                                                <h3 className="text-xs font-black uppercase tracking-widest text-white/60">Facturación</h3>
                                            </div>
                                            <button
                                                onClick={() => setEmitElectronicInvoice(!emitElectronicInvoice)}
                                                className={\`w-full p-6 rounded-3xl border-2 transition-all flex items-center justify-between group \${emitElectronicInvoice ? 'bg-emerald-500/10 border-emerald-500 shadow-lg' : 'bg-black/40 border-white/5'}\`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={\`w-12 h-12 rounded-xl flex items-center justify-center transition-all \${emitElectronicInvoice ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-700'}\`}>
                                                        <ShieldCheck className="w-6 h-6" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="text-[11px] font-black uppercase text-white tracking-widest">Documento Electrónico {country} {typeof window !== 'undefined' && localStorage.getItem('apisunat_env') === 'sandbox' && <span className="text-[8px] bg-amber-500 text-black px-1.5 py-0.5 rounded ml-1">Mock/Pruebas</span>}</div>
                                                        <div className="text-[8px] font-bold text-zinc-600 uppercase">Enviar automáticamente al sistema tributario</div>
                                                    </div>
                                                </div>
                                                <div className={\`w-12 h-6 rounded-full relative transition-all border-2 shrink-0 \${emitElectronicInvoice ? 'bg-emerald-500 border-white/20' : 'bg-zinc-900 border-white/10'}\`}>
                                                    <div className={\`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 \${emitElectronicInvoice ? 'left-7' : 'left-0.5'}\`} />
                                                </div>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="h-full flex flex-col items-center justify-center text-center space-y-8"
                                    >
                                        <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                            <CheckCircle2 className="w-12 h-12" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black uppercase text-white italic tracking-tighter">Venta Exitosa</h3>
                                            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-2 px-6 py-2 bg-emerald-500/5 rounded-full inline-block">{invoiceResult.msg}</p>
                                        </div>
                                        {invoiceResult.detail && (
                                            <div className="bg-black border border-white/5 p-4 rounded-2xl w-full max-w-sm">
                                                <span className="text-[8px] font-black text-zinc-600 uppercase block mb-2">Clave de Acceso / Autorización</span>
                                                <code className="text-[10px] text-white/70 break-all font-mono">{invoiceResult.detail}</code>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                                            <button onClick={() => window.print()} className="py-4 bg-zinc-900 text-white font-black uppercase text-[10px] rounded-2xl border border-white/10 hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
                                                <Printer className="w-4 h-4" /> Ticket
                                            </button>
                                            <button onClick={() => { setInvoiceResult(null); setIsCheckoutOpen(false); }} className="py-4 bg-white text-black font-black uppercase text-[10px] rounded-2xl hover:bg-zinc-200 transition-all">Siguiente</button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COL: SUMMARY & ACTIONS */}
                        {!invoiceResult && (
                            <div className="w-full lg:w-[420px] bg-zinc-900 border-l border-white/5 flex flex-col">
                                <div className="p-8 md:p-10 flex-1 flex flex-col justify-between space-y-8">
                                    <div className="space-y-6">
                                        <div className="text-center space-y-2">
                                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Total de la Venta</span>
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-2xl font-black text-zinc-800">{currency}</span>
                                                <div className="text-7xl font-black text-white tracking-tighter">{(total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                            </div>
                                        </div>

                                        <div className="relative pt-6">
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest z-10">Monto Recibido</div>
                                            <input
                                                type="number"
                                                value={receivedAmount}
                                                onChange={(e) => setReceivedAmount(e.target.value)}
                                                className="w-full bg-black/40 border-2 border-white/10 py-8 px-6 rounded-3xl text-4xl font-black text-white text-center outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-800"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        {parseFloat(receivedAmount) > total && (
                                            <motion.div 
                                                initial={{ y: 10, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl text-center"
                                            >
                                                <span className="text-[8px] font-black text-emerald-500/50 uppercase tracking-widest block mb-1">Cambio</span>
                                                <span className="text-2xl font-black text-emerald-500">{currency}{(parseFloat(receivedAmount) - total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Método: {paymentMethod}</span>
                                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Items: {cart.length}</span>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (total <= 0) { alert('El total debe ser mayor a 0'); return; }
                                                if (receivedAmount && parseFloat(receivedAmount) < total) { alert('Monto insuficiente'); return; }
                                                
                                                if (emitElectronicInvoice) {
                                                    setIsIssuingInvoice(true);
                                                    if (country === 'PE') {
                                                        const token = localStorage.getItem('apisunat_token');
                                                        const env = localStorage.getItem('apisunat_env') || 'sandbox';
                                                        if (!token) { alert('Falta Token'); setIsIssuingInvoice(false); return; }
                                                        const mappedItems = (cart || []).map(item => ({ unidad_de_medida: item.category === 'cursos' ? 'ZZ' : 'NIU', descripcion: item.name, cantidad: item.quantity.toString(), valor_unitario: (item.price / (1 + (taxRate / 100))).toFixed(6), porcentaje_igv: taxRate.toString(), codigo_tipo_afectacion_igv: "10", nombre_tributo: taxName }));
                                                        const sunatDoc = { documento: documentType, serie: documentType === 'factura' ? (localStorage.getItem('apisunat_serie_f') || 'F001') : (localStorage.getItem('apisunat_serie_b') || 'B001'), numero: Math.floor(Math.random() * 9999), fecha_de_emision: new Date().toISOString().split('T')[0], cliente_tipo_de_documento: documentType === 'factura' ? '6' : '1', cliente_numero_de_documento: customer?.id || "00000000", cliente_denominacion: customer?.name || "CLIENTE GENERAL", items: mappedItems, total: (total || 0).toFixed(2) };
                                                        try {
                                                            const res = await fetch('/api/issue-invoice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ document: sunatDoc, token, env }) });
                                                            if (res.ok) alert('✅ SUNAT OK'); else alert('❌ Error SUNAT');
                                                        } catch (e) {}
                                                    } else if (country === 'EC') {
                                                        const token = localStorage.getItem('apiconsult_token');
                                                        const env = localStorage.getItem('apiconsult_env') || 'pruebas';
                                                        const p12 = localStorage.getItem('apiconsult_p12_base64');
                                                        const password = localStorage.getItem('apiconsult_p12');
                                                        if (!token || !p12) { alert('Faltan credenciales EC'); setIsIssuingInvoice(false); return; }
                                                        const ecuadorDoc = mapCartToEcuadorInvoice(cart, customer, total, subtotal, tax, taxRate, { env, ruc: localStorage.getItem('blis_store_ruc'), razonSocial: localStorage.getItem('blis_store_name'), address: localStorage.getItem('blis_store_address') });
                                                        try {
                                                            const res = await fetch('/api/ecuador-api', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-apiconsult-token': token }, body: JSON.stringify({ p12, password, env: env === 'produccion' ? '2' : '1', comprobante: ecuadorDoc }) });
                                                            const result = await res.json();
                                                            if (res.ok) { setInvoiceResult({ success: true, msg: 'SRI Aprobando', detail: result.claveAcceso || result.authorizationCode }); saveTransaction(); return; }
                                                        } catch (e) {}
                                                    }
                                                    setIsIssuingInvoice(false);
                                                }
                                                saveTransaction();
                                                setInvoiceResult({ success: true, msg: 'Venta registrada.' });
                                                setReceivedAmount('');
                                                setEmitElectronicInvoice(false);
                                            }}
                                            disabled={isIssuingInvoice}
                                            className="w-full py-8 bg-emerald-500 text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {isIssuingInvoice ? 'PROCESANDO...' : 'FINALIZAR VENTA'} <CheckCircle2 className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
`;

const footerPart = `
            {/* THERMAL TICKET */}
            <div className="hidden print:block w-[80mm] font-mono text-[10px] text-black bg-white">
                <div className="text-center font-black text-sm mb-2">BLIS CORP S.A.S.</div>
                <div className="text-center mb-4">{typeof window !== 'undefined' ? (localStorage.getItem('blis_store_address') || 'Ecuador / Perú') : 'Ecuador / Perú'}</div>
                <div className="border-t border-dashed border-black my-2" />
                <div className="flex justify-between uppercase"><span>{documentType}:</span> <span>{new Date().getTime()}</span></div>
                <div className="flex justify-between uppercase"><span>Cliente:</span> <span className="truncate">{customer?.name || 'Venta de Pasillo'}</span></div>
                {customer?.id && customer.id !== '0' && <div className="flex justify-between uppercase"><span>Doc:</span> <span>{customer.id}</span></div>}
                <div className="border-t border-dashed border-black my-2" />
                <div className="space-y-1 mb-4">
                    {cart.map((item, idx) => (
                        <div key={idx} className="flex justify-between uppercase">
                            <span>{item.quantity}x {item.name.substring(0, 16)}</span>
                            <span>{currency}{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    {shippingCost > 0 && (
                        <div className="flex justify-between uppercase">
                            <span>Envío</span>
                            <span>{currency}{shippingCost.toFixed(2)}</span>
                        </div>
                    )}
                </div>
                <div className="border-t border-dashed border-black my-2" />
                <div className="flex justify-between font-black text-sm"><span>TOTAL:</span> <span>{currency}{total.toFixed(2)}</span></div>
                <div className="text-center mt-6 uppercase font-black">¡Gracias por su compra!</div>
                <div className="text-center mt-2 text-[8px] italic">Powered by Blis</div>
            </div>
        </>
    );
};
`;

let finalCode = uiPart + '\n\n' + improvedModal + '\n' + footerPart;

// Apply small improvements
finalCode = finalCode.replace(
    'couponCode, setCouponCode,\n        currency',
    'couponCode, setCouponCode,\n        shippingCost, setShippingCost,\n        currency'
);

// Olva courier button update
// We'll use a safer approach for prompt replacement
finalCode = finalCode.replace(
    /prompt\('Ingrese costo de envío Olva \(S\/\):', '15'\)/,
    "prompt(`Ingrese costo de envío Olva (${currency}):`, '15')"
);
finalCode = finalCode.replace(
    /setGlobalDiscountAmount\(globalDiscountAmount \+ parseFloat\(shippingCost\)\)/,
    "setShippingCost(parseFloat(shippingCost))"
);

// WhatsApp
finalCode = finalCode.replace(
    /<button className="flex items-center gap-2 bg-emerald-500\/10 border border-emerald-500\/30 px-3 py-1.5 rounded-full ml-auto group hover:bg-emerald-500\/20 transition-all">[\s\S]*?<MessageSquare className="w-3.5 h-3.5 text-emerald-500" \/>[\s\S]*?<span className="text-\[8px\] font-black uppercase text-emerald-500 tracking-widest">Enviar por WhatsApp<\/span>[\s\S]*?<\/button>/,
    `<button 
                                            onClick={() => {
                                                if (!customer?.phone) { alert('Cliente sin número telefónico'); return; }
                                                const txt = encodeURIComponent('Hola ' + customer.name + ', gracias por su compra. Total: ' + currency + total);
                                                window.open('https://wa.me/' + customer.phone.replace(/\\D/g,'') + '?text=' + txt, '_blank');
                                            }}
                                            className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full ml-auto group hover:bg-emerald-500/20 transition-all"
                                        >
                                            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest">Enviar por WhatsApp</span>
                                        </button>`
);

// Shipping total line
finalCode = finalCode.replace(
    /<div className="flex justify-between items-center text-\[11px\] font-black text-gray-600 uppercase tracking-widest">[\s\S]*?<div className="flex items-center gap-2">[\s\S]*?<span>\{taxName\} \(\{taxRate\}%\)<\/span>/,
    `{shippingCost > 0 && (
                                <div className="flex justify-between items-center text-[11px] font-black text-amber-500 uppercase tracking-widest">
                                    <span>Envío Olva Courier</span>
                                    <span>{currency}{shippingCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-[11px] font-black text-gray-600 uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <span>{taxName} ({taxRate}%)</span>`
);

fs.writeFileSync('components/superadmin/POSManager.tsx', finalCode);
console.log('Final reconstruction complete!');
