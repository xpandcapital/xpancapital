import os

filepath = r'c:\Users\kevin\.gemini\antigravity\scratch\blis-corp\components\superadmin\POSManager.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    fc = f.read()

start_marker = '<Truck className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />'
end_marker = '{isCheckoutOpen && ('

start_idx = fc.find(start_marker)
end_idx = fc.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print('markers not found')
    exit()

prefix = fc[:start_idx + len(start_marker)]
suffix = fc[end_idx:]

fixed_content = """
                                <span className="text-[9px] font-black uppercase text-amber-500 tracking-widest">Cotizar Envío Olva Courier</span>
                            </button>
                        </div>
                    </div>

                    {/* --- TOTAL BOX MOVED INSIDE RIGHT COLUMN --- */}
                    <div className="mt-auto pt-6 space-y-6 shrink-0 z-20">
                        <div className="bg-zinc-950 border-2 border-white/10 p-8 rounded-[3rem] space-y-4 shadow-3xl">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[11px] font-black text-gray-600 uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span>{currency}{(subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] font-black text-gray-600 uppercase tracking-widest">
                                    <div className="flex items-center gap-2">
                                        <span>{taxName} ({taxRate}%)</span>
                                        {documentType === 'ticket' && <span className="bg-blis-red/20 text-blis-red px-2 py-0.5 rounded text-[7px]">EXENTO</span>}
                                    </div>
                                    <span>{currency}{(tax || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>

                                {globalDiscountAmount > 0 && (
                                    <div className="flex justify-between items-center text-[11px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">
                                        <span>Dscto. Aplicado</span>
                                        <div className="flex items-center gap-1">
                                            <span>-</span>
                                            <span>{currency}{(globalDiscountType === 'percent' ? (subtotal * (1 + taxRate / 100) * globalDiscountAmount / 100) : globalDiscountAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-5 border-t border-white/10 flex justify-between items-end">
                                    <div className="flex-1">
                                        <div className="text-[10px] font-black text-blis-red uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2">
                                            {documentType === 'ticket' ? <Ticket className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                            Total {transactionType}
                                        </div>
                                        <div className="flex items-baseline gap-1.5 min-w-0 pr-2">
                                            <span className="text-2xl font-black text-zinc-700">{currency}</span>
                                            <div className="text-4xl xl:text-5xl font-black tracking-tighter text-white truncate">{(total || 0).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        {transactionType === 'cotizacion' ? (
                                            <button
                                                onClick={saveTransaction}
                                                className="px-5 py-6 xl:p-6 bg-amber-500 text-black rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-3 hover:scale-105"
                                            >
                                                <Save className="w-5 h-5" /> <span className="hidden xl:inline">GUARDAR</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setIsCheckoutOpen(true)}
                                                disabled={(cart || []).length === 0}
                                                className="px-5 py-6 xl:p-6 bg-emerald-500 text-black rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-3 disabled:opacity-20 shadow-[0_20px_40px_rgba(16,185,129,0.2)] hover:scale-105 active:scale-95"
                                            >
                                                <span className="hidden xl:inline">COBRAR</span> <ChevronRight className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            """

with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
    f.write(prefix + fixed_content + suffix)
print('Fixed layout in POSManager.tsx successfully')
