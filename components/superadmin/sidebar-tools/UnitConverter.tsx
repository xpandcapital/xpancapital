"use client";

import React, { useState, useEffect } from 'react';

function UnitConverter() {
    const [mode, setMode] = useState<'len' | 'weight'>('len');
    const [val, setVal] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [result, setResult] = useState<number | null>(null);

    const units = {
        len: { units: ['Metros', 'Kilómetros', 'Millas', 'Pies', 'Pulgadas'], rates: { 'Metros': 1, 'Kilómetros': 1000, 'Millas': 1609.34, 'Pies': 0.3048, 'Pulgadas': 0.0254 } },
        weight: { units: ['Kilogramos', 'Libras', 'Gramos', 'Onzas'], rates: { 'Kilogramos': 1, 'Libras': 0.453592, 'Gramos': 0.001, 'Onzas': 0.0283495 } }
    };

    useEffect(() => {
        setFrom(units[mode].units[0]);
        setTo(units[mode].units[1]);
        setResult(null);
    }, [mode]);

    const convert = () => {
        const num = parseFloat(val);
        if (isNaN(num)) return;
        const rates = units[mode].rates as Record<string, number>;
        const r = (num * rates[from]) / rates[to];
        setResult(r);
    };

    return (
        <div className="space-y-4 p-8 bg-zinc-900/40 rounded-xl border border-white/5 max-w-lg mx-auto shadow-2xl">
            <div className="flex bg-black/40 p-1.5 rounded-2xl gap-1">
                {(['len', 'weight'] as const).map(m => (
                    <button key={m} onClick={() => setMode(m)} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${mode === m ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-600 hover:text-white'}`}>
                        {m === 'len' ? 'Medidas Longitud' : 'Cargas de Peso'}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-zinc-600 uppercase ml-2 tracking-widest">Origen</label>
                    <select value={from} onChange={e => setFrom(e.target.value)} className="w-full bg-black/60 border border-white/5 p-4 rounded-2xl text-[11px] font-black text-white outline-none appearance-none cursor-pointer hover:border-white/20 transition-all">
                        {units[mode].units.map(u => <option key={u} value={u} className="bg-zinc-900">{u}</option>)}
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-zinc-600 uppercase ml-2 tracking-widest">Destino</label>
                    <select value={to} onChange={e => setTo(e.target.value)} className="w-full bg-black/60 border border-white/5 p-4 rounded-2xl text-[11px] font-black text-white outline-none appearance-none cursor-pointer hover:border-white/20 transition-all">
                        {units[mode].units.map(u => <option key={u} value={u} className="bg-zinc-900">{u}</option>)}
                    </select>
                </div>
            </div>
            <div className="relative">
                <input type="number" placeholder="Ingrese el valor a convertir..." className="w-full bg-black/60 border border-white/5 p-6 rounded-xl text-center text-2xl font-black outline-none focus:border-blis-red/30 transition-all placeholder:text-zinc-900" value={val} onChange={e => setVal(e.target.value)} />
            </div>
            <button onClick={convert} className="w-full py-4 bg-blis-red text-white text-[11px] font-black uppercase rounded-[1.5rem] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blis-red/20">Procesar Conversión</button>
            {result !== null && (
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 text-center animate-in zoom-in-95 duration-500 shadow-inner">
                    <div className="text-[8px] font-black text-gray-600 uppercase tracking-[0.3em] mb-2">Equivalencia Resultante</div>
                    <div className="text-3xl font-black text-white tracking-tighter">{result.toLocaleString(undefined, { maximumFractionDigits: 6 })} <span className="text-xs text-zinc-700 ml-2 uppercase">{to}</span></div>
                </div>
            )}
        </div>
    );
};

export { UnitConverter };