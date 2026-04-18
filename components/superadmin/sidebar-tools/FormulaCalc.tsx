"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function FormulaCalc() {
    const [mode, setMode] = useState<'pct' | 'area'>('pct');
    const [val, setVal] = useState({ a: '', b: '' });
    const [res, setRes] = useState('');
    const calc = () => {
        const a = parseFloat(val.a) || 0; const b = parseFloat(val.b) || 0;
        if (mode === 'pct') setRes(`${(a * b / 100).toFixed(2)}`);
        else setRes(`${(Math.PI * a * a).toFixed(2)}`);
    };

    return (
        <div className="p-8 bg-zinc-900/30 rounded-xl border border-white/5 space-y-8 max-w-md mx-auto shadow-2xl backdrop-blur-sm">
            <div className="flex bg-black/60 p-2 rounded-2xl gap-2">
                {['pct', 'area'].map(m => (
                    <button key={m} onClick={() => setMode(m as any)} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-xl transition-all ${mode === m ? 'bg-blis-red text-white shadow-lg' : 'text-zinc-700 hover:text-white'}`}>
                        {m === 'pct' ? 'PORCENTAJES' : 'ÁREA CÍRCULO'}
                    </button>
                ))}
            </div>
            <div className="space-y-4">
                <div className="relative">
                    <input placeholder={mode === 'pct' ? 'Importe Base' : 'Radio del Círculo'} className="w-full bg-black/60 border border-white/5 p-6 rounded-xl text-xl font-black text-white text-center outline-none focus:border-blis-red/30 transition-all placeholder:text-zinc-900" value={val.a} onChange={e => setVal({ ...val, a: e.target.value })} />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-800 uppercase tracking-widest">{mode === 'pct' ? 'VALOR' : 'RAD'}</div>
                </div>
                {mode === 'pct' && (
                    <div className="relative">
                        <input placeholder="Porcentaje (%)" className="w-full bg-black/60 border border-white/5 p-6 rounded-xl text-xl font-black text-white text-center outline-none focus:border-blis-red/30 transition-all placeholder:text-zinc-900" value={val.b} onChange={e => setVal({ ...val, b: e.target.value })} />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[12px] font-black text-zinc-800">%</div>
                    </div>
                )}
            </div>
            <button onClick={calc} className="w-full py-5 bg-zinc-800 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] hover:bg-zinc-700 transition-all shadow-xl">PROCESAR FÓRMULA</button>
            <AnimatePresence>
                {res && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 bg-blis-red/5 rounded-[2.5rem] border border-blis-red/20 shadow-inner">
                        <div className="text-[8px] font-black text-blis-red uppercase tracking-[0.5em] mb-2">Resultado Matemático</div>
                        <div className="text-5xl font-black text-white tracking-tighter">{res}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export { FormulaCalc };