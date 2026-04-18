"use client";

import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, RefreshCcw } from 'lucide-react';
import { fetchExchangeRate } from '@/lib/peru-apis';

function CurrencyConverter() {
    const [soles, setSoles] = useState('');
    const [usd, setUsd] = useState('');
    const [rate, setRate] = useState('3.70');
    const [loading, setLoading] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(null);

    const loadRate = async () => {
        setLoading(true);
        const res = await fetchExchangeRate();
        if (res.success) {
            setRate(res.sell.toString());
            setLastSync(new Date().toLocaleTimeString());
        }
        setLoading(false);
    };

    useEffect(() => {
        loadRate();
    }, []);

    const updateSoles = (v: string) => {
        setSoles(v);
        const n = parseFloat(v);
        if (!isNaN(n)) setUsd((n / parseFloat(rate)).toFixed(2));
        else setUsd('');
    };

    const updateUsd = (v: string) => {
        setUsd(v);
        const n = parseFloat(v);
        if (!isNaN(n)) setSoles((n * parseFloat(rate)).toFixed(2));
        else setSoles('');
    };

    return (
        <div className="space-y-6 p-8 bg-zinc-900/40 rounded-xl border border-white/5 max-w-xl mx-auto shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <ArrowRightLeft className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-widest">Conversor PEN / USD</h4>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase">Datos en tiempo real (API)</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-2xl border border-white/5">
                    <div className="text-right">
                        <div className="text-[7px] font-black text-zinc-500 uppercase tracking-tighter">Tipo de Cambio</div>
                        <input className="bg-transparent text-sm font-black text-emerald-500 outline-none text-right w-12" value={rate} onChange={e => setRate(e.target.value)} />
                    </div>
                    <button onClick={loadRate} className={`p-1.5 rounded-lg hover:bg-white/5 transition-all ${loading ? 'animate-spin' : ''}`}>
                        <RefreshCcw className="w-3.5 h-3.5 text-zinc-600" />
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <img src="https://flagcdn.com/w20/pe.png" className="w-4 h-3 rounded-sm opacity-60" />
                        <span className="text-[10px] font-black text-zinc-600">S/.</span>
                    </div>
                    <input placeholder="Monto en Soles" className="w-full bg-black/40 border border-white/5 p-6 pl-20 rounded-xl text-xl font-black text-white outline-none focus:border-emerald-500/30 transition-all placeholder:text-zinc-900" value={soles} onChange={e => updateSoles(e.target.value)} />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-800 tracking-widest uppercase">PEN</div>
                </div>

                <div className="flex justify-center -my-2 relative z-10">
                    <div className="w-12 h-12 bg-zinc-950 border border-white/5 rounded-2xl flex items-center justify-center shadow-2xl">
                        <ArrowRightLeft className="w-5 h-5 text-zinc-700 rotate-90" />
                    </div>
                </div>

                <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <img src="https://flagcdn.com/w20/us.png" className="w-4 h-3 rounded-sm opacity-60" />
                        <span className="text-[10px] font-black text-zinc-600">$</span>
                    </div>
                    <input placeholder="Monto en Dólares" className="w-full bg-black/40 border border-white/5 p-6 pl-20 rounded-xl text-xl font-black text-white outline-none focus:border-blis-red/30 transition-all placeholder:text-zinc-900" value={usd} onChange={e => updateUsd(e.target.value)} />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-800 tracking-widest uppercase">USD</div>
                </div>
            </div>

            {lastSync && (
                <div className="text-center pt-2">
                    <span className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em]">Última sincronización: {lastSync}</span>
                </div>
            )}
        </div>
    );
};

export { CurrencyConverter };