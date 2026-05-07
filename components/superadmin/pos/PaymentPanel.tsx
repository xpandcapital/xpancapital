"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Banknote, CreditCard, Coins, ArrowRightLeft,
    CheckCircle2, ShieldCheck
} from 'lucide-react';

interface PaymentPanelProps {
    country: string;
    currency: string;
    total: number;
    paymentMethod: string;
    setPaymentMethod: (m: 'cash' | 'card' | 'bliscoins' | 'transfer' | 'helio') => void;
    receivedAmount: string;
    setReceivedAmount: (v: string) => void;
    isIssuingInvoice: boolean;
    emitElectronicInvoice: boolean;
    setEmitElectronicInvoice: (v: boolean) => void;
    onFinalize: () => void;
}

export function PaymentPanel({
    country, currency, total,
    paymentMethod, setPaymentMethod,
    receivedAmount, setReceivedAmount,
    isIssuingInvoice, emitElectronicInvoice, setEmitElectronicInvoice,
    onFinalize,
}: PaymentPanelProps) {
    return (
        <div className="w-[450px] space-y-8 flex flex-col justify-between">
            <div className="bg-zinc-900/40 p-12 rounded-[4rem] border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-emerald-500/5 blur-[100px]" />
                <div className="w-full space-y-4 relative z-10">
                    <div className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.3em]">Total a Cobrar</div>
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
                    onClick={onFinalize}
                    disabled={isIssuingInvoice}
                    className="w-full py-10 bg-emerald-500 text-black text-[13px] font-black uppercase tracking-[0.4em] rounded-[3.5rem] shadow-[0_25px_50px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                >
                    {isIssuingInvoice ? 'PROCESANDO...' : 'FINALIZAR VENTA'} <CheckCircle2 className="w-8 h-8" />
                </button>
            </div>
        </div>
    );
}
