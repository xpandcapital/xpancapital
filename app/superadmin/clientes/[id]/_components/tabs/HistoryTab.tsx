"use client";

import { Clock, ArrowUpRight, ArrowDownRight, ShoppingCart, User, FileText, Mail, MessageCircle } from 'lucide-react';
import type { Client } from '../../../_types';
import { motion } from 'framer-motion';

interface HistoryTabProps {
    client: Client;
}

export function HistoryTab({ client }: HistoryTabProps) {
    const timeline = [
        { type: 'purchase', icon: ShoppingCart, label: 'Compra completada', desc: 'Maestrías Express - $1,497.00', time: 'Hace 2 horas', positive: true },
        { type: 'lead', icon: Mail, label: 'Lead captado', desc: 'Desde campaña "Verano 2026"', time: 'Ayer', positive: true },
        { type: 'note', icon: FileText, label: 'Nota añadida', desc: '"Cliente interesado en diplomados"', time: 'Hace 3 días', positive: null },
        { type: 'abandon', icon: ShoppingCart, label: 'Carro abandonado', desc: 'Carro con 3 items - Total $899', time: 'Hace 5 días', positive: false },
        { type: 'referral', icon: User, label: 'Nuevo referido', desc: 'Juan Pérez se registró con su link', time: 'Hace 1 semana', positive: true },
        { type: 'course', icon: FileText, label: 'Curso completado', desc: 'Blis Foundations - Nota: 85/100', time: 'Hace 2 semanas', positive: true },
        { type: 'message', icon: MessageCircle, label: 'Mensaje enviado', desc: 'Consultó sobre método de pago', time: 'Hace 3 semanas', positive: null },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase">Historial de Actividad</h3>
                <Clock className="w-5 h-5 text-gray-500" />
            </div>

            <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-white/5" />

                <div className="space-y-4">
                    {timeline.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="relative flex gap-4 pl-12"
                        >
                            <div className={`absolute left-3 w-4 h-4 rounded-full border-2 z-10 flex items-center justify-center ${
                                item.positive === true ? 'bg-emerald-500 border-emerald-500' :
                                item.positive === false ? 'bg-rose-500 border-rose-500' :
                                'bg-zinc-900 border-white/20'
                            }`}>
                                {item.positive === true && <ArrowUpRight className="w-2 h-2 text-black" />}
                                {item.positive === false && <ArrowDownRight className="w-2 h-2 text-black" />}
                            </div>

                            <div className="flex-1 p-5 bg-zinc-900/50 border border-white/5 rounded-2xl">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-black uppercase">{item.label}</span>
                                    <span className="text-[8px] text-gray-600 font-black uppercase">{item.time}</span>
                                </div>
                                <p className="text-[9px] text-gray-500">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
