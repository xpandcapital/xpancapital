"use client";

import { Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { AuditLog } from '../../../_types';
import { motion } from 'framer-motion';

interface HistoryTabProps {
    history: AuditLog[];
}

export function HistoryTab({ history }: HistoryTabProps) {
    const getPositive = (action: string): boolean | null => {
        if (action.includes('abandon') || action.includes('cancel')) return false;
        if (action.includes('compra') || action.includes('lead') || action.includes('referido') || action.includes('registro')) return true;
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase">Historial de Actividad</h3>
                <Clock className="w-5 h-5 text-gray-500" />
            </div>

            <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-white/5" />

                <div className="space-y-4">
                    {history.length === 0 ? (
                        <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] opacity-30 flex flex-col items-center">
                            <Clock className="w-12 h-12 mb-4" />
                            <span className="text-[10px] font-black uppercase">Sin actividad registrada</span>
                        </div>
                    ) : (
                        history.map((item, idx) => {
                            const positive = getPositive(item.action);
                            return (
                                <motion.div
                                    key={item.id || idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="relative flex gap-4 pl-12"
                                >
                                    <div className={`absolute left-3 w-4 h-4 rounded-full border-2 z-10 flex items-center justify-center ${
                                        positive === true ? 'bg-emerald-500 border-emerald-500' :
                                        positive === false ? 'bg-rose-500 border-rose-500' :
                                        'bg-zinc-900 border-white/20'
                                    }`}>
                                        {positive === true && <ArrowUpRight className="w-2 h-2 text-black" />}
                                        {positive === false && <ArrowDownRight className="w-2 h-2 text-black" />}
                                    </div>

                                    <div className="flex-1 p-5 bg-zinc-900/50 border border-white/5 rounded-2xl">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-black uppercase">{item.action}</span>
                                            <span className="text-[8px] text-gray-600 font-black uppercase">{item.date}</span>
                                        </div>
                                        <p className="text-[9px] text-gray-500">{item.details}</p>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
