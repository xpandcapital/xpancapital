"use client";

import { useState } from 'react';
import {
    Lock, BadgeDollarSign, Calendar, History, DollarSign,
    ArrowRightLeft as ArrowRightLeftIcon
} from 'lucide-react';
import type { Client, Transaction } from '../../../_types';
import { useToast } from '@/components/ui/Toast';

interface EconomyTabProps {
    client: Client;
    transactions: Transaction[];
    onUpdate: (fields: Partial<Client>) => void;
    onAdjustCoins: (amount: number, reason: string) => void;
}

export function EconomyTab({ client, transactions, onUpdate, onAdjustCoins }: EconomyTabProps) {
    const { showToast } = useToast();
    const [coinAmount, setCoinAmount] = useState('0');
    const [coinReason, setCoinReason] = useState('');

    const handleAdjust = (amount: number) => {
        if (!coinReason) return showToast('Falta razón del movimiento', 'error');
        onAdjustCoins(amount, coinReason);
        setCoinAmount('0');
        setCoinReason('');
    };

    const handleTransferSim = () => {
        showToast('Simulando transferencia de 10 BC...', 'info');
        setTimeout(() => {
            onUpdate({ xpandCoins: client.xpandCoins - 10 });
            showToast('Transferencia completada', 'success');
        }, 1500);
    };

    return (
        <div className="space-y-10">
            <div className="relative group">
                <div className="p-10 bg-gradient-to-br from-zinc-900 to-black border border-white/5 rounded-[3rem] text-center space-y-4 shadow-3xl">
                    <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Saldo Disponible</div>
                    <div className={`text-7xl font-black transition-all ${client.isAccountFrozen ? 'text-gray-600' : 'text-white'}`}>
                        {client.xpandCoins.toLocaleString()} <span className="text-3xl text-amber-500">BC</span>
                    </div>
                    {client.isAccountFrozen && (
                        <div className="text-[9px] font-black text-rose-500 uppercase flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3" /> FONDOS CONGELADOS
                        </div>
                    )}
                </div>
                <div className="absolute top-6 right-8 flex gap-3">
                    <button
                        onClick={() => onUpdate({ isAccountFrozen: !client.isAccountFrozen })}
                        className={`p-3 rounded-2xl border transition-all ${client.isAccountFrozen ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}
                    >
                        <Lock className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="p-8 bg-zinc-900 border border-white/5 rounded-[3rem] space-y-6 shadow-2xl">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                                <BadgeDollarSign className="w-5 h-5 text-amber-500" />
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-tighter">Ajuste de Bóveda</h4>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-xl border border-white/5">
                            <Calendar className="w-3.5 h-3.5 text-gray-600" />
                            <input
                                type="date"
                                value={client.coinsExpiration}
                                onChange={e => onUpdate({ coinsExpiration: e.target.value })}
                                className="bg-transparent text-[10px] font-black uppercase outline-none w-28 text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Monto de Ajuste</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={coinAmount}
                                onChange={e => setCoinAmount(e.target.value)}
                                className="w-full bg-black/60 border border-white/5 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:border-amber-500 transition-all placeholder:text-gray-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Límite Crédito</label>
                            <div className="relative">
                                <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <input
                                    type="number"
                                    value={client.creditLimit}
                                    onChange={e => onUpdate({ creditLimit: Number(e.target.value) })}
                                    className="w-full bg-black/60 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm font-black outline-none focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Razón del Movimiento</label>
                        <textarea
                            placeholder="Explica el motivo del cambio..."
                            value={coinReason}
                            onChange={e => setCoinReason(e.target.value)}
                            className="w-full bg-black/60 border border-white/5 rounded-2xl px-6 py-4 text-xs min-h-[100px] outline-none focus:border-white/20 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => handleAdjust(Number(coinAmount))}
                            className="py-4 bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 rounded-2xl font-black uppercase text-[9px] hover:bg-emerald-600 hover:text-white transition-all shadow-lg"
                        >
                            + Abonar
                        </button>
                        <button
                            onClick={() => handleAdjust(-Number(coinAmount))}
                            className="py-4 bg-rose-600/10 text-rose-500 border border-rose-500/20 rounded-2xl font-black uppercase text-[9px] hover:bg-rose-600 hover:text-white transition-all shadow-lg"
                        >
                            - Retirar
                        </button>
                        <button
                            onClick={handleTransferSim}
                            className="py-4 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-2xl font-black uppercase text-[9px] hover:bg-blue-600 hover:text-white transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            <ArrowRightLeftIcon className="w-3.5 h-3.5" /> Enviar
                        </button>
                    </div>
                </div>

                <div className="p-8 bg-zinc-900 border border-white/5 rounded-[3rem] shadow-4xl flex flex-col h-full max-h-[500px] overflow-hidden">
                    <div className="flex items-center gap-4 mb-8 shrink-0">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-lg">
                            <History className="w-6 h-6 text-amber-500" />
                        </div>
                        <div className="flex flex-col">
                            <h4 className="text-xs font-black uppercase tracking-widest text-white">Historial Bóveda</h4>
                            <p className="text-[9px] text-gray-600 font-bold uppercase">Últimos movimientos</p>
                        </div>
                    </div>
                    <div className="space-y-4 overflow-y-auto scrollbar-hide flex-1 pr-1 pb-4">
                        {transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-16 opacity-10 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                                <History className="w-16 h-16 mb-4" />
                                <span className="text-[10px] font-black uppercase">Sin actividad</span>
                            </div>
                        ) : (
                            transactions.map(tx => (
                                <div
                                    key={tx.id}
                                    className="p-5 bg-black/40 border border-white/5 rounded-[1.8rem] flex justify-between items-center group hover:border-amber-500/30 hover:bg-white/[0.05] transition-all shrink-0"
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-black text-white group-hover:text-amber-500 transition-all leading-none">{tx.description}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] text-gray-600 font-black uppercase tracking-wider">{tx.date}</span>
                                            <span className="w-1 h-1 rounded-full bg-white/10" />
                                            <span className="text-[8px] text-gray-700 font-black uppercase">{tx.type}</span>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl text-xs font-black shadow-xl ${tx.amount >= 0 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' : 'bg-rose-500/20 text-rose-500 border border-rose-500/10'}`}>
                                        {tx.amount >= 0 ? '+' : ''}{tx.amount} <span className="text-[9px]">BC</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
