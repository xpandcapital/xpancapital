"use client";

import React, { useState } from 'react';

function StandardROI() {
    const [cost, setCost] = useState('');
    const [gain, setGain] = useState('');
    const roi = (parseFloat(cost) && parseFloat(gain)) ? (((parseFloat(gain) - parseFloat(cost)) / parseFloat(cost)) * 100).toFixed(2) : '--';

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-700 uppercase block mb-2 px-2">Costo Inversión</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-xl font-black text-white outline-none" placeholder="0.00" value={cost} onChange={e => setCost(e.target.value)} />
                </div>
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-700 uppercase block mb-2 px-2">Ganancia Total</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-xl font-black text-white outline-none" placeholder="0.00" value={gain} onChange={e => setGain(e.target.value)} />
                </div>
            </div>
            <div className={`p-10 rounded-[2.5rem] border text-center transition-all ${parseFloat(roi) > 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                <div className="text-[9px] font-black uppercase tracking-[0.5em] mb-2">{parseFloat(roi) >= 0 ? 'Retorno Positivo' : 'Pérdida Detectada'}</div>
                <div className="text-6xl font-black text-white">{roi}%</div>
            </div>
        </div>
    );
}

function StandardDiscount() {
    const [price, setPrice] = useState('');
    const [pct, setPct] = useState('');
    const discount = (parseFloat(price) * (parseFloat(pct) / 100)) || 0;
    const total = parseFloat(price) - discount;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-700 uppercase block mb-2 px-2">Precio Original</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-xl font-black text-white outline-none" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-700 uppercase block mb-2 px-2">Descuento (%)</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-xl font-black text-white outline-none" placeholder="0%" value={pct} onChange={e => setPct(e.target.value)} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-8 bg-zinc-900 border border-white/5 rounded-xl text-center">
                    <div className="text-[7px] font-black text-zinc-600 uppercase mb-1">Ahorro</div>
                    <div className="text-2xl font-black text-emerald-500">${discount.toFixed(2)}</div>
                </div>
                <div className="p-8 bg-blis-red/10 border border-blis-red/20 rounded-xl text-center">
                    <div className="text-[7px] font-black text-blis-red uppercase mb-1">Precio Final</div>
                    <div className="text-2xl font-black text-white">${total.toFixed(2)}</div>
                </div>
            </div>
        </div>
    );
}

function StandardMarkup() {
    const [cost, setCost] = useState('');
    const [margin, setMargin] = useState('');
    const price = (parseFloat(cost) / (1 - (parseFloat(margin) / 100))) || 0;
    const profit = price - parseFloat(cost);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-700 uppercase block mb-2 px-2">Costo Producir</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-xl font-black text-white outline-none" placeholder="0.00" value={cost} onChange={e => setCost(e.target.value)} />
                </div>
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-700 uppercase block mb-2 px-2">Margen Deseado (%)</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-xl font-black text-white outline-none" placeholder="0%" value={margin} onChange={e => setMargin(e.target.value)} />
                </div>
            </div>
            <div className="p-10 bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] text-center">
                <div className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-2">Precio de Venta Sugerido</div>
                <div className="text-5xl font-black text-white">${price.toFixed(2)}</div>
                <div className="text-[10px] text-zinc-600 mt-2">Ganancia por unidad: ${profit.toFixed(2)}</div>
            </div>
        </div>
    );
}

function StandardLoan() {
    const [amount, setAmount] = useState('');
    const [rate, setRate] = useState('');
    const [time, setTime] = useState('');
    const [period, setPeriod] = useState('12');

    const p = parseFloat(amount) || 0;
    const r = (parseFloat(rate) / 100) / parseFloat(period);
    const n = parseFloat(time) * parseFloat(period);

    const installment = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = installment * n;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <label className="text-[7px] font-black text-zinc-700 uppercase block mb-1">Monto Péstamo</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-3 rounded-lg text-sm font-black text-white outline-none" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <label className="text-[7px] font-black text-zinc-700 uppercase block mb-1">Tasa Anual (%)</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-3 rounded-lg text-sm font-black text-white outline-none" value={rate} onChange={e => setRate(e.target.value)} placeholder="0%" />
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <label className="text-[7px] font-black text-zinc-700 uppercase block mb-1">Años</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-3 rounded-lg text-sm font-black text-white outline-none" value={time} onChange={e => setTime(e.target.value)} placeholder="1" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-8 bg-zinc-900 border border-white/5 rounded-[2rem] text-center">
                    <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Cuota Mensual</div>
                    <div className="text-3xl font-black text-white">${isNaN(installment) ? '0.00' : installment.toFixed(2)}</div>
                </div>
                <div className="p-8 bg-blis-red/5 border border-blis-red/20 rounded-[2rem] text-center">
                    <div className="text-[8px] font-black text-blis-red uppercase tracking-widest mb-1">Pago Total</div>
                    <div className="text-3xl font-black text-white">${isNaN(total) ? '0.00' : total.toFixed(2)}</div>
                </div>
            </div>
        </div>
    );
}

function StandardCommission() {
    const [sales, setSales] = useState('');
    const [pct, setPct] = useState('');
    const comm = (parseFloat(sales) * (parseFloat(pct) / 100)) || 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-700 uppercase block mb-2 px-2">Ventas Totales</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-xl font-black text-white outline-none" placeholder="0.00" value={sales} onChange={e => setSales(e.target.value)} />
                </div>
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-700 uppercase block mb-2 px-2">Tasa de Comisión (%)</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-xl font-black text-white outline-none" placeholder="0%" value={pct} onChange={e => setPct(e.target.value)} />
                </div>
            </div>
            <div className="p-10 bg-blis-red/5 border border-blis-red/20 rounded-[2.5rem] text-center">
                <div className="text-[8px] font-black text-blis-red uppercase tracking-[0.4em] mb-2">Comisión a Pagar</div>
                <div className="text-6xl font-black text-white">${comm.toFixed(2)}</div>
            </div>
        </div>
    );
}

function StandardTips() {
    const [total, setTotal] = useState('');
    const [people, setPeople] = useState('1');
    const [pct, setPct] = useState('10');

    const bill = parseFloat(total) || 0;
    const count = parseInt(people) || 1;
    const tip = bill * (parseFloat(pct) / 100);
    const perPerson = (bill + tip) / count;

    return (
        <div className="space-y-6">
            <div className="bg-black/40 p-8 rounded-xl border border-white/5 space-y-6">
                <input className="w-full bg-transparent text-5xl font-black text-center text-white outline-none placeholder:text-zinc-900" placeholder="0.00" value={total} onChange={e => setTotal(e.target.value)} />
                <div className="flex gap-4">
                    <div className="flex-1 space-y-1">
                        <label className="text-[7px] font-black text-zinc-700 uppercase block">Personas</label>
                        <input type="number" className="w-full bg-zinc-950 p-4 rounded-xl text-lg font-black text-white" value={people} onChange={e => setPeople(e.target.value)} />
                    </div>
                    <div className="flex-1 space-y-1">
                        <label className="text-[7px] font-black text-zinc-700 uppercase block">Propina (%)</label>
                        <input type="number" className="w-full bg-zinc-950 p-4 rounded-xl text-lg font-black text-white" value={pct} onChange={e => setPct(e.target.value)} />
                    </div>
                </div>
            </div>
            <div className="bg-emerald-500 text-black p-8 rounded-[2rem] text-center shadow-xl shadow-emerald-500/20">
                <div className="text-[8px] font-black uppercase tracking-[0.4em] mb-1">Cada uno paga</div>
                <div className="text-5xl font-black">${perPerson.toFixed(2)}</div>
                <div className="text-[9px] font-bold mt-2 opacity-60">Total con propina: ${(bill + tip).toFixed(2)}</div>
            </div>
        </div>
    );
}

function StandardUnitPrice() {
    const [p1, setP1] = useState({ price: '', qty: '' });
    const [p2, setP2] = useState({ price: '', qty: '' });
    const u1 = (parseFloat(p1.price) / parseFloat(p1.qty)) || 0;
    const u2 = (parseFloat(p2.price) / parseFloat(p2.qty)) || 0;
    const diff = Math.abs(u1 - u2);

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <div className="flex-1 bg-black/40 p-6 rounded-xl border border-white/5 space-y-4">
                    <span className="text-[8px] font-black text-zinc-500 uppercase">Opción A</span>
                    <input className="w-full bg-zinc-900 p-4 rounded-xl text-white font-black" placeholder="Precio" value={p1.price} onChange={e => setP1({ ...p1, price: e.target.value })} />
                    <input className="w-full bg-zinc-900 p-4 rounded-xl text-white font-black" placeholder="Ctd/Peso" value={p1.qty} onChange={e => setP1({ ...p1, qty: e.target.value })} />
                    <div className="text-emerald-500 text-xs font-black">Unitario: ${u1.toFixed(4)}</div>
                </div>
                <div className="flex-1 bg-black/40 p-6 rounded-xl border border-white/5 space-y-4">
                    <span className="text-[8px] font-black text-zinc-500 uppercase">Opción B</span>
                    <input className="w-full bg-zinc-900 p-4 rounded-xl text-white font-black" placeholder="Precio" value={p2.price} onChange={e => setP2({ ...p2, price: e.target.value })} />
                    <input className="w-full bg-zinc-900 p-4 rounded-xl text-white font-black" placeholder="Ctd/Peso" value={p2.qty} onChange={e => setP2({ ...p2, qty: e.target.value })} />
                    <div className="text-emerald-500 text-xs font-black">Unitario: ${u2.toFixed(4)}</div>
                </div>
            </div>
            {u1 > 0 && u2 > 0 && (
                <div className="p-6 bg-zinc-900 border border-white/10 rounded-xl text-center">
                    <div className="text-[9px] font-black text-blis-red uppercase">La opción {u1 < u2 ? 'A' : 'B'} es más BARATA</div>
                    <div className="text-lg font-black text-white">Ahorras ${((Math.max(u1, u2) - Math.min(u1, u2)) * (u1 < u2 ? parseFloat(p1.qty) : parseFloat(p2.qty))).toFixed(2)} por compra</div>
                </div>
            )}
        </div>
    );
}

export { StandardROI, StandardDiscount, StandardMarkup, StandardLoan, StandardCommission, StandardTips, StandardUnitPrice };