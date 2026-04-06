
import os

filepath = r'c:\Users\kevin\.gemini\antigravity\scratch\blis-corp\components\superadmin\POSManager.tsx'

if not os.path.exists(filepath):
    print(f"File not found: {filepath}")
    exit(1)

with open(filepath, 'r', encoding='utf-8') as f:
    fc = f.read()

start_marker = '{isCheckoutOpen && ('
end_marker = '/* --- THERMAL TICKET (PRINT ONLY) --- */'

start_idx = fc.find(start_marker)
end_idx = fc.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print(f"Markers not found. Start: {start_idx}, End: {end_idx}")
    # Try alternative markers if needed
    exit(1)

prefix = fc[:start_idx]
suffix = fc[end_idx:]

# Refined modal code with correct nesting and full logic
modal_code = """{isCheckoutOpen && (
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
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="bg-zinc-950 border border-white/10 p-12 rounded-[4rem] w-full max-w-6xl relative z-10 shadow-3xl flex gap-10 overflow-hidden"
                    >
                        {/* COLUMNA IZQUIERDA: RESUMEN O ÉXITO */}
                        <div className="flex-1 space-y-10 min-w-0">
                            {!invoiceResult ? (
                                <>
                                    <div>
                                        <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Finalizar Venta</h2>
                                        <div className="flex gap-4 mt-2 items-center">
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Doc: {documentType}</span>
                                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">|</span>
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Cliente: {customer?.name || 'Venta General'}</span>

                                            <button 
                                                onClick={() => {
                                                    const phone = customer?.phone || customer?.cellphone;
                                                    if (!phone) {
                                                        alert('El cliente no tiene un número de celular configurado.');
                                                        return;
                                                    }
                                                    const text = encodeURIComponent(`Hola ${customer?.name || ''}, adjunto tu comprobante de venta por ${currency}${total}. Gracias por tu compra.`);
                                                    window.open(`https://wa.me/${phone.replace(/\s+/g, '')}?text=${text}`, '_blank');
                                                }}
                                                className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full ml-auto hover:bg-emerald-500/20 transition-all"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                                                <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest">WhatsApp</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Métodos de Pago */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { id: 'cash', icon: Banknote, label: 'Efectivo', desc: country === 'EC' ? 'Saldo físico / caja' : 'Pago físico', color: 'emerald' },
                                            { id: 'card', icon: CreditCard, label: 'Tarjeta', desc: country === 'EC' ? 'Datafast / Medianet' : 'IziPay / Niubiz', color: 'blue' },
                                            { id: 'bliscoins', icon: Coins, label: 'BlisCoins', desc: 'Canje de Puntos', color: 'amber' },
                                            { id: 'transfer', icon: ArrowRightLeft, label: country === 'EC' ? 'Deuna / Pichincha' : 'Transferencia', desc: country === 'EC' ? 'Interbancario' : 'Yape / Plin', color: 'purple' }
                                        ].map(method => (
                                            <button
                                                key={method.id}
                                                onClick={() => setPaymentMethod(method.id as any)}
                                                className={`group relative p-6 rounded-[2.5rem] border-2 transition-all flex items-center gap-6 ${paymentMethod === method.id ? 'bg-emerald-500/10 border-emerald-500 shadow-2xl' : 'bg-black/40 border-white/5 hover:border-white/10'}`}
                                            >
                                                <div className={`w-14 h-14 rounded-2xl bg-black border border-white/5 flex items-center justify-center shrink-0 transition-all ${paymentMethod === method.id ? 'text-emerald-500' : 'text-zinc-700'}`}>
                                                    <method.icon className="w-7 h-7" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-[12px] font-black uppercase text-white mb-1">{method.label}</div>
                                                    <div className="text-[8px] font-bold text-gray-500 uppercase truncate">{method.desc}</div>
                                                </div>
                                                {paymentMethod === method.id && <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-emerald-500" />}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Toggle Facturación */}
                                    {(country === 'PE' || country === 'EC') && (
                                        <div className="pt-6 border-t border-white/5">
                                            <button
                                                onClick={() => setEmitElectronicInvoice(!emitElectronicInvoice)}
                                                className={`w-full p-8 rounded-[3rem] border-2 transition-all flex items-center justify-between group overflow-hidden relative ${emitElectronicInvoice ? 'bg-emerald-500/10 border-emerald-500 shadow-2xl' : 'bg-black/40 border-white/5'}`}
                                            >
                                                <div className="flex items-center gap-5 relative z-10">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${emitElectronicInvoice ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-700'}`}>
                                                        <ShieldCheck className="w-7 h-7" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="text-sm font-black uppercase text-white tracking-widest leading-none mb-1">Facturación Electrónica {country === 'PE' ? 'SUNAT' : 'SRI'}</div>
                                                        <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Enviar comprobante legal {country === 'PE' ? 'a ApiSunat' : 'vía ApiConsult'}</div>
                                                    </div>
                                                </div>
                                                <div className={`w-14 h-7 rounded-full relative transition-all border-2 shrink-0 ${emitElectronicInvoice ? 'bg-emerald-500 border-emerald-500' : 'bg-zinc-900 border-white/10'}`}>
                                                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 ${emitElectronicInvoice ? 'left-8' : 'left-0.5'}`} />
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-10 py-12">
                                    <div className="relative">
                                        <div className="w-28 h-28 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 animate-pulse">
                                            <CheckCircle2 className="w-16 h-16" />
                                        </div>
                                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-black p-1.5 rounded-full shadow-lg">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-3xl font-black uppercase text-white tracking-widest italic">Venta Exitosa</h3>
                                        <p className="text-emerald-500/60 text-xs font-bold uppercase tracking-[0.2em]">{invoiceResult?.msg}</p>
                                    </div>

                                    {invoiceResult?.detail && (
                                        <div className="bg-emerald-500/5 p-8 rounded-[2.5rem] border border-emerald-500/20 w-full space-y-4 shadow-2xl relative overflow-hidden">
                                            <div className="flex items-center justify-between relative z-10 text-left">
                                                <div>
                                                    <span className="text-[9px] font-black text-emerald-500/70 uppercase tracking-[0.3em]">Clave de Acceso {country === 'EC' ? 'SRI' : 'SUNAT'}</span>
                                                    <div className="text-[7px] font-bold text-emerald-500/40 uppercase">DOCUMENTO REGISTRADO EN EL PORTAL</div>
                                                </div>
                                                <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase text-right">Autorizado</span>
                                            </div>
                                            <div className="text-[11px] font-mono text-white break-all leading-relaxed bg-black/60 p-6 rounded-3xl border border-white/10 select-all hover:border-emerald-500/50 transition-all cursor-pointer group relative z-10">
                                                {invoiceResult.detail}
                                                <div className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <Copy className="w-3 h-3 text-emerald-500" />
                                                </div>
                                            </div>
                                            <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest text-center relative z-10">Esta clave es la prueba real de que el {country === 'EC' ? 'SRI' : 'SUNAT'} recibió el documento.</p>
                                        </div>
                                    )}

                                    <div className="flex gap-4 w-full">
                                        <button onClick={() => window.print()} className="flex-1 py-6 bg-zinc-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-[2rem] border border-white/10 hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
                                            <Printer className="w-4 h-4" /> Comprobante
                                        </button>
                                        <button onClick={() => { setInvoiceResult(null); setIsCheckoutOpen(false); }} className="flex-[2] py-6 bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-[2rem] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-white/10">
                                            Continuar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* COLUMNA DERECHA: PAGO Y TOTALS */}
                        {!invoiceResult && (
                            <div className="w-[450px] space-y-8 flex flex-col justify-between">
                                <div className="bg-zinc-900/40 p-12 rounded-[4rem] border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
                                    <div className="w-full space-y-4 relative z-10">
                                        <div className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-2">Monto Total a Cobrar</div>
                                        <div className="flex items-center justify-center gap-4">
                                            <span className="text-4xl font-black text-zinc-800 tracking-tighter">{currency}</span>
                                            <div className="text-8xl font-black tracking-tighter text-white animate-in slide-in-from-bottom-4 duration-700">
                                                {(total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            value={receivedAmount}
                                            onChange={(e) => setReceivedAmount(e.target.value)}
                                            className="w-full bg-zinc-900 border-2 border-white/10 py-10 px-8 rounded-[2.5rem] text-4xl font-black text-white text-center outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-800"
                                            placeholder="0.00"
                                        />
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">Monto Recibido</div>
                                    </div>

                                    {parseFloat(receivedAmount) > total && (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl animate-in fade-in zoom-in duration-300">
                                            <div className="text-[10px] text-emerald-500 font-black uppercase mb-1">Cambio a Entregar</div>
                                            <div className="text-2xl font-black text-emerald-500">{currency}{(parseFloat(receivedAmount) - total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                        </div>
                                    )}

                                    <button
                                        onClick={async () => {
                                            if (total <= 0) { alert('El total debe ser mayor a 0'); return; }
                                            if (receivedAmount && parseFloat(receivedAmount) < total) { alert('Monto insuficiente'); return; }
                                            
                                            if (emitElectronicInvoice) {
                                                setIsIssuingInvoice(true);
                                                if (country === 'PE') {
                                                    const token = localStorage.getItem('apisunat_token');
                                                    const env = localStorage.getItem('apisunat_env') || 'sandbox';
                                                    if (!token) { alert('No se encontró Token'); setIsIssuingInvoice(false); return; }
                                                    const mappedItems = (cart || []).map(item => ({ unidad_de_medida: item.category === 'cursos' ? 'ZZ' : 'NIU', descripcion: item.name, cantidad: item.quantity.toString(), valor_unitario: (item.price / (1 + (taxRate / 100))).toFixed(6), porcentaje_igv: taxRate.toString(), codigo_tipo_afectacion_igv: "10", nombre_tributo: taxName }));
                                                    const sunatDoc = { documento: documentType, serie: documentType === 'factura' ? (localStorage.getItem('apisunat_serie_f') || 'F001') : (localStorage.getItem('apisunat_serie_b') || 'B001'), numero: Math.floor(Math.random() * 9999), fecha_de_emision: new Date().toISOString().split('T')[0], cliente_tipo_de_documento: documentType === 'factura' ? '6' : '1', cliente_numero_de_documento: customer?.id || "00000000", cliente_denominacion: customer?.name || "CLIENTE GENERAL", items: mappedItems, total: (total || 0).toFixed(2) };
                                                    try {
                                                        const res = await fetch('/api/issue-invoice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ document: sunatDoc, token, env }) });
                                                        const result = await res.json();
                                                        if (res.ok) alert('✅ SUNAT OK'); else alert('❌ Error SUNAT');
                                                    } catch (e) {}
                                                } else if (country === 'EC') {
                                                    const token = localStorage.getItem('apiconsult_token');
                                                    const env = localStorage.getItem('apiconsult_env') || 'pruebas';
                                                    const p12 = localStorage.getItem('apiconsult_p12_base64');
                                                    const password = localStorage.getItem('apiconsult_p12');
                                                    if (!token || !p12) { alert('Faltan credenciales Ecuador'); setIsIssuingInvoice(false); return; }
                                                    const ecuadorDoc = mapCartToEcuadorInvoice(cart, customer, total, subtotal, tax, taxRate, { env, ruc: localStorage.getItem('blis_store_ruc'), razonSocial: localStorage.getItem('blis_store_name'), address: localStorage.getItem('blis_store_address') });
                                                    try {
                                                        const res = await fetch('/api/ecuador-api', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-apiconsult-token': token }, body: JSON.stringify({ p12, password, env: env === 'produccion' ? '2' : '1', comprobante: ecuadorDoc }) });
                                                        const result = await res.json();
                                                        if (res.ok) { setInvoiceResult({ success: true, msg: 'SRI Aprobado', detail: result.claveAcceso || result.authorizationCode }); saveTransaction(); return; }
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
                                        className="w-full py-10 bg-emerald-500 text-black text-[13px] font-black uppercase tracking-[0.4em] rounded-[3.5rem] shadow-[0_25px_50px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                                    >
                                        {isIssuingInvoice ? 'PROCESANDO...' : 'FINALIZAR VENTA'} <CheckCircle2 className="w-8 h-8" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
"""

with open(filepath, 'w', encoding='utf-8', newline='\\n') as f:
    f.write(prefix + modal_code + suffix)

print("Modal refactored successfully")
