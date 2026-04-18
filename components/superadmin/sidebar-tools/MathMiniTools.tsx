"use client";

import React, { useState } from 'react';
import { ArrowRightLeft, Trash2 } from 'lucide-react';

function PercentageTool() {
    const [a, setA] = useState('');
    const [b, setB] = useState('');
    const res = (parseFloat(a) && parseFloat(b)) ? ((parseFloat(a) / parseFloat(b)) * 100).toFixed(2) : '--';
    return (
        <div className="space-y-6">
            <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                <div className="text-[10px] font-black text-zinc-500 uppercase mb-4 tracking-widest">Calcular Porcentaje (A respecto de B)</div>
                <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="text-[8px] font-black text-zinc-700 uppercase block pl-2">Valor A</label>
                        <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-2xl text-xl font-black text-white outline-none focus:border-blis-red/30" value={a} onChange={e => setA(e.target.value)} placeholder="0" />
                    </div>
                    <ArrowRightLeft className="w-4 h-4 text-zinc-800 mt-6" />
                    <div className="flex-1 space-y-2">
                        <label className="text-[8px] font-black text-zinc-700 uppercase block pl-2">Valor B (Total)</label>
                        <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-2xl text-xl font-black text-white outline-none focus:border-blis-red/30" value={b} onChange={e => setB(e.target.value)} placeholder="0" />
                    </div>
                </div>
            </div>
            <div className="bg-blis-red/5 border border-blis-red/20 p-8 rounded-[2rem] text-center">
                <div className="text-[8px] font-black text-blis-red uppercase tracking-[0.4em] mb-2">Resultado Porcentual</div>
                <div className="text-5xl font-black text-white">{res}%</div>
            </div>
        </div>
    );
}

function AverageTool() {
    const [vals, setVals] = useState<string[]>(['', '']);
    const numbers = vals.map(v => parseFloat(v)).filter(n => !isNaN(n));
    const mean = numbers.length ? (numbers.reduce((s, n) => s + n, 0) / numbers.length).toFixed(2) : '--';

    return (
        <div className="space-y-6">
            <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                <div className="text-[10px] font-black text-zinc-500 uppercase mb-4 tracking-widest italic">Promedios Dinámicos</div>
                <div className="grid grid-cols-2 gap-3">
                    {vals.map((v, i) => (
                        <input key={i} className="bg-zinc-900 border border-white/5 p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-emerald-500/30" value={v} onChange={e => {
                            const n = [...vals]; n[i] = e.target.value;
                            if (i === vals.length - 1 && e.target.value) n.push('');
                            setVals(n);
                        }} placeholder={`Valor ${i + 1}`} />
                    ))}
                </div>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[2rem] flex items-center justify-between">
                <div className="text-left">
                    <div className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.4em]">Media Aritmética</div>
                    <div className="text-4xl font-black text-white mt-1">{mean}</div>
                </div>
                <button onClick={() => setVals(['', ''])} className="p-4 bg-zinc-900 rounded-2xl hover:bg-zinc-800 transition-colors"><Trash2 className="w-4 h-4 text-zinc-600" /></button>
            </div>
        </div>
    );
}

function FractionTool() {
    const [dec, setDec] = useState('');
    const toFraction = (n: number) => {
        let len = n.toString().includes('.') ? n.toString().split('.')[1].length : 0;
        let den = Math.pow(10, len);
        let num = n * den;
        const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
        let common = gcd(num, den);
        return { num: num / common, den: den / common };
    };
    const f = dec ? toFraction(parseFloat(dec)) : null;

    return (
        <div className="space-y-6">
            <div className="bg-black/40 p-8 rounded-xl border border-white/5 text-center">
                <div className="text-[10px] font-black text-zinc-500 uppercase mb-4 tracking-widest">Decimal a Fracción</div>
                <input className="w-full bg-zinc-900 border border-white/5 p-6 rounded-2xl text-3xl font-black text-white text-center outline-none" value={dec} onChange={e => setDec(e.target.value)} placeholder="0.5" />
            </div>
            {f && (
                <div className="flex items-center justify-center gap-8 py-4">
                    <div className="text-6xl font-black text-white border-b-4 border-blis-red pb-2">{f.num}</div>
                    <div className="text-6xl font-black text-white">{f.den}</div>
                </div>
            )}
        </div>
    );
}

function NumberGenerator() {
    const [min, setMin] = useState('1');
    const [max, setMax] = useState('100');
    const [qty, setQty] = useState('1');
    const [res, setRes] = useState<number[]>([]);

    const gen = () => {
        let r = [];
        for (let i = 0; i < parseInt(qty); i++) r.push(Math.floor(Math.random() * (parseInt(max) - parseInt(min) + 1)) + parseInt(min));
        setRes(r);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                    <label className="text-[7px] font-black text-zinc-700 uppercase pl-2">Mínimo</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-center font-black text-white" value={min} onChange={e => setMin(e.target.value)} />
                </div>
                <div className="space-y-1">
                    <label className="text-[7px] font-black text-zinc-700 uppercase pl-2">Máximo</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-center font-black text-white" value={max} onChange={e => setMax(e.target.value)} />
                </div>
                <div className="space-y-1">
                    <label className="text-[7px] font-black text-zinc-700 uppercase pl-2">Cantidad</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-center font-black text-white" value={qty} onChange={e => setQty(e.target.value)} />
                </div>
            </div>
            <button onClick={gen} className="w-full py-5 bg-emerald-500 text-black font-black uppercase text-xs rounded-2xl shadow-lg shadow-emerald-500/10">Generar Aleatorios</button>
            <div className="flex flex-wrap gap-2 justify-center">
                {res.map((n, i) => (
                    <div key={i} className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-lg font-black text-white">{n}</div>
                ))}
            </div>
        </div>
    );
}

export { PercentageTool, AverageTool, FractionTool, NumberGenerator };