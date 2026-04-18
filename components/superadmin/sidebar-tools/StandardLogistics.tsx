"use client";

import React, { useState } from 'react';

function StandardBreakEven() {
    const [fixed, setFixed] = useState('');
    const [price, setPrice] = useState('');
    const [variable, setVariable] = useState('');

    const f = parseFloat(fixed) || 0;
    const p = parseFloat(price) || 0;
    const v = parseFloat(variable) || 0;
    const units = (f / (p - v)) || 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <label className="text-[7px] font-black text-zinc-500 uppercase block mb-1">Costos Fijos</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-3 rounded-lg text-sm text-white font-black" placeholder="0" value={fixed} onChange={e => setFixed(e.target.value)} />
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <label className="text-[7px] font-black text-zinc-500 uppercase block mb-1">Precio Venta</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-3 rounded-lg text-sm text-white font-black" placeholder="0" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <label className="text-[7px] font-black text-zinc-500 uppercase block mb-1">Costo Var.</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-3 rounded-lg text-sm text-white font-black" placeholder="0" value={variable} onChange={e => setVariable(e.target.value)} />
                </div>
            </div>
            <div className="p-10 bg-cyan-500/5 border border-cyan-500/20 rounded-[2.5rem] text-center">
                <div className="text-[8px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-2">Punto de Equilibrio</div>
                <div className="text-6xl font-black text-white">{isFinite(units) ? Math.ceil(units) : '0'} <span className="text-xl text-zinc-800 uppercase">Unidades</span></div>
                <div className="text-[9px] text-zinc-600 mt-2 font-black uppercase">Ingreso mínimo: ${(Math.ceil(units) * p).toFixed(2)}</div>
            </div>
        </div>
    );
}

function StandardTax() {
    const [amount, setAmount] = useState('');
    const igv_rate = 0.18;
    const val = parseFloat(amount) || 0;
    const base = val / (1 + igv_rate);
    const igv = val - base;

    return (
        <div className="space-y-6 text-center">
            <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5">
                <label className="text-[8px] font-black text-zinc-500 uppercase block mb-3">Monto Total (Inc. IGV)</label>
                <input className="w-full bg-transparent text-5xl font-black text-white text-center outline-none" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-8 bg-zinc-900 border border-white/5 rounded-xl">
                    <div className="text-[7px] font-black text-zinc-600 uppercase mb-1">Sub-Total (Base)</div>
                    <div className="text-2xl font-black text-white">${base.toFixed(2)}</div>
                </div>
                <div className="p-8 bg-zinc-900 border border-white/5 rounded-xl">
                    <div className="text-[7px] font-black text-blis-red uppercase mb-1">Impuesto (18%)</div>
                    <div className="text-2xl font-black text-blis-red">${igv.toFixed(2)}</div>
                </div>
            </div>
        </div>
    );
}

function StandardWaste() {
    const [initial, setInitial] = useState('');
    const [final, setFinal] = useState('');
    const loss = (parseFloat(initial) - parseFloat(final)) || 0;
    const pct = (loss / parseFloat(initial)) * 100 || 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-500 uppercase block mb-2">Inv. Inicial</label>
                    <input className="w-full bg-zinc-900 p-4 rounded-xl text-white font-black" placeholder="0" value={initial} onChange={e => setInitial(e.target.value)} />
                </div>
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-500 uppercase block mb-2">Ventas/Fin</label>
                    <input className="w-full bg-zinc-900 p-4 rounded-xl text-white font-black" placeholder="0" value={final} onChange={e => setFinal(e.target.value)} />
                </div>
            </div>
            <div className="p-10 bg-rose-500/5 border border-rose-500/20 rounded-[2.5rem] text-center">
                <div className="text-[8px] font-black text-rose-500 uppercase mb-2">Merma Detectada</div>
                <div className="text-5xl font-black text-white">{pct.toFixed(2)}%</div>
                <div className="text-[9px] text-zinc-600 mt-2">Pérdida física: {loss.toFixed(2)} unidades</div>
            </div>
        </div>
    );
}

function StandardFuel() {
    const [dist, setDist] = useState('');
    const [yieldVal, setYieldVal] = useState('');
    const [price, setPrice] = useState('');
    const gallons = (parseFloat(dist) / parseFloat(yieldVal)) || 0;
    const total = gallons * parseFloat(price);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <label className="text-[7px] font-black text-zinc-700 uppercase block mb-1">Distancia (km)</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-3 rounded-lg text-sm font-black text-white outline-none" placeholder="0" value={dist} onChange={e => setDist(e.target.value)} />
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <label className="text-[7px] font-black text-zinc-700 uppercase block mb-1">Rendimiento (km/gal)</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-3 rounded-lg text-sm font-black text-white outline-none" placeholder="45" value={yieldVal} onChange={e => setYieldVal(e.target.value)} />
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <label className="text-[7px] font-black text-zinc-700 uppercase block mb-1">Precio Galón</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-3 rounded-lg text-sm font-black text-white outline-none" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
            </div>
            <div className="p-8 bg-zinc-900 border border-white/5 rounded-[2rem] flex items-center justify-between">
                <div>
                    <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Costo Estimado</div>
                    <div className="text-4xl font-black text-white mt-1">${total.toFixed(2)}</div>
                </div>
                <div className="text-right">
                    <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Galones req.</div>
                    <div className="text-xl font-black text-emerald-500">{gallons.toFixed(2)} gal</div>
                </div>
            </div>
        </div>
    );
}

export { StandardBreakEven, StandardTax, StandardWaste, StandardFuel };