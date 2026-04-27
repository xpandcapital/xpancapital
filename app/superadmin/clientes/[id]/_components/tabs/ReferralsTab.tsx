"use client";

import { useState } from 'react';
import {
    Users, UserCircle, Link2, ShoppingBag
} from 'lucide-react';
import type { Referral } from '../../../_types';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';

interface ReferralsTabProps {
    referrals: Referral[];
}

export function ReferralsTab({ referrals }: ReferralsTabProps) {
    const { showToast } = useToast();
    const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);

    return (
        <div className="space-y-8">
            <div className="p-10 bg-indigo-600/10 border border-indigo-500/20 rounded-[3rem] text-center space-y-3 shadow-2xl">
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Red de Referidos</div>
                <div className="text-6xl font-black text-white">
                    {referrals.length} <span className="text-2xl text-indigo-500">Socios</span>
                </div>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Contribuidores directos</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <h4 className="text-sm font-black uppercase ml-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" /> Socios Referidos
                </h4>

                {referrals.length === 0 ? (
                    <div className="p-12 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center opacity-20">
                        <UserCircle className="w-12 h-12 mx-auto mb-2" />
                        <span className="text-[10px] font-black uppercase">Sin referidos directos</span>
                    </div>
                ) : (
                    referrals.map(ref => (
                        <div
                            key={ref.id}
                            onClick={() => setSelectedReferral(selectedReferral?.id === ref.id ? null : ref)}
                            className="p-6 bg-zinc-900 border border-white/5 rounded-3xl flex flex-col gap-6 group hover:border-indigo-500/30 transition-all cursor-pointer overflow-hidden shadow-xl"
                        >
                            <div className="flex justify-between items-center w-full">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 ${ref.avatarColor || 'bg-indigo-500/10'} rounded-2xl flex items-center justify-center text-white font-black shadow-lg`}>
                                        {ref.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-white group-hover:text-indigo-400 transition-all">{ref.name}</span>
                                        <span className="text-[9px] text-gray-600 uppercase tracking-widest font-black">{ref.id}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex gap-2 flex-wrap justify-end">
                                        {ref.commissionBC && (
                                            <span className="text-sm font-black text-amber-500 tracking-tighter">+{ref.commissionBC} BC</span>
                                        )}
                                        {ref.commissionCash && (
                                            <span className="text-sm font-black text-emerald-500 flex items-center gap-1.5 px-3 py-1 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                                                +${ref.commissionCash.toFixed(2)}
                                                {ref.commissionPercent && <span className="text-[9px] opacity-40">| {ref.commissionPercent}%</span>}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[8px] text-gray-700 font-black uppercase tracking-tighter mt-1">Comisión Pendiente</span>
                                </div>
                            </div>

                            <AnimatePresence>
                                {selectedReferral?.id === ref.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="pt-8 border-t border-white/5 space-y-6"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <h5 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1 flex items-center gap-2">
                                                    <ShoppingBag className="w-3 h-3" /> Última Compra
                                                </h5>
                                                <span className="text-xs font-black text-white">{ref.lastPurchase?.name || 'N/A'}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[9px] text-gray-600 uppercase font-black">Precio</span>
                                                <span className="text-lg font-black text-white">${ref.lastPurchase?.price.toFixed(2) || '0.00'}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {ref.commissionCash && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); showToast(`Pago de $${ref.commissionCash} procesado`, 'success'); }}
                                                    className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-[1.8rem] flex flex-col items-center gap-2 hover:bg-emerald-500 transition-all shadow-xl"
                                                >
                                                    <span className="text-[9px] font-black uppercase text-emerald-500">Pagar Efectivo</span>
                                                    {ref.commissionPercent && <span className="text-[8px] text-gray-500 font-black">({ref.commissionPercent}% del costo)</span>}
                                                    <span className="text-xl font-black text-white">${ref.commissionCash.toFixed(2)}</span>
                                                </button>
                                            )}
                                            {ref.commissionBC && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); showToast(`Pago de ${ref.commissionBC} BC procesado`, 'success'); }}
                                                    className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-[1.8rem] flex flex-col items-center gap-2 hover:bg-amber-500 transition-all shadow-xl"
                                                >
                                                    <span className="text-[9px] font-black uppercase text-amber-500">Pagar en BlisCoins</span>
                                                    <span className="text-xl font-black text-white">{ref.commissionBC} BC</span>
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))
                )}
            </div>

            <div className="p-8 bg-black/40 border border-white/5 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col">
                    <h4 className="text-xs font-black uppercase">Marketing de Afiliados</h4>
                    <p className="text-[10px] text-gray-500 uppercase">Genera un enlace tracker para aumentar su red.</p>
                </div>
                <button className="px-8 py-4 bg-indigo-500 text-black rounded-2xl text-[10px] font-black uppercase hover:scale-105 transition-all flex items-center gap-2">
                    <Link2 className="w-4 h-4" /> Copiar Link Tracker
                </button>
            </div>
        </div>
    );
}
