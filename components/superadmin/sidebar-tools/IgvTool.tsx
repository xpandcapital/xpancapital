"use client";

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { callAI } from './call-ai';

function IgvTool() {
    const [raw, setRaw] = useState({ total: '', sub: '', igv: '18' });

    const update = (field: 'total' | 'sub', val: string) => {
        const num = parseFloat(val) || 0;
        const rate = (parseFloat(raw.igv) || 0) / 100;
        if (field === 'total') setRaw({ ...raw, total: val, sub: (num / (1 + rate)).toFixed(2) });
        else setRaw({ ...raw, sub: val, total: (num * (1 + rate)).toFixed(2) });
    };

    return (
        <div className="space-y-6 p-8 bg-zinc-900/40 rounded-xl border border-white/5 max-w-xl mx-auto shadow-2xl relative group">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Cálculo Impositivo IA</h4>
                    <button
                        onClick={async () => {
                            const res = await callAI(`Dada una base imponible de ${raw.sub || '0'}, sugiere una estrategia de optimización fiscal legal en una frase corta.`);
                            alert(res);
                        }}
                        className="p-1 px-3 bg-blis-red/10 rounded-full hover:bg-blis-red/20 transition-all flex items-center gap-2 group/ia"
                    >
                        <Sparkles className="w-2.5 h-2.5 text-blis-red animate-pulse" />
                        <span className="text-[6px] font-black text-blis-red uppercase">Smart Strategy</span>
                    </button>
                </div>
                <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-2xl border border-white/5">
                    <span className="text-[8px] font-black text-zinc-700 uppercase">% TASA</span>
                    <input className="w-12 bg-transparent text-sm font-black text-blis-red outline-none text-center" value={raw.igv} onChange={e => setRaw({ ...raw, igv: e.target.value })} />
                </div>
            </div>
            <div className="space-y-4">
                <div className="relative">
                    <label className="absolute left-6 top-3 text-[9px] font-black text-zinc-700 uppercase tracking-widest">Importe Base (Sin Impuestos)</label>
                    <input placeholder="0.00" className="w-full bg-black/60 border border-white/5 p-8 pt-12 rounded-[2rem] text-3xl font-black text-white outline-none focus:border-emerald-500/30 transition-all placeholder:text-zinc-900" value={raw.sub} onChange={e => update('sub', e.target.value)} />
                    <div className="absolute right-6 bottom-5 flex items-center gap-2">
                        <span className="text-[10px] font-black text-zinc-800 uppercase trackers-widest">NETO</span>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    </div>
                </div>
                <div className="relative">
                    <label className="absolute left-6 top-3 text-[9px] font-black text-zinc-700 uppercase tracking-widest">Importe Final (Incluye Impuestos)</label>
                    <input placeholder="0.00" className="w-full bg-black/60 border border-white/5 p-8 pt-12 rounded-[2rem] text-3xl font-black text-white outline-none focus:border-blis-red/30 transition-all placeholder:text-zinc-900" value={raw.total} onChange={e => update('total', e.target.value)} />
                    <div className="absolute right-6 bottom-5 flex items-center gap-2">
                        <span className="text-[10px] font-black text-zinc-800 trailers-widest">TOTAL</span>
                        <div className="w-2.5 h-2.5 rounded-full bg-blis-red shadow-[0_0_10px_rgba(230,0,50,0.5)]" />
                    </div>
                </div>
            </div>
            <div className="p-10 bg-zinc-950/80 rounded-[2rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-3">
                <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Carga Impositiva Reservada</div>
                <div className="text-5xl font-black text-white tracking-tighter">${(parseFloat(raw.total || '0') - parseFloat(raw.sub || '0')).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
        </div>
    );
};

export { IgvTool };