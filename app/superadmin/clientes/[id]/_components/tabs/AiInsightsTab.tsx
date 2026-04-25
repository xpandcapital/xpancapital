"use client";

import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';
import type { Client } from '../../../_types';
import { motion } from 'framer-motion';

interface AiInsightsTabProps {
    client: Client;
}

export function AiInsightsTab({ client }: AiInsightsTabProps) {
    const insights = [
        { type: 'success', icon: CheckCircle2, label: 'Alta probabilidad de conversión', desc: 'Este cliente ha interactuado con 4 campañas en los últimos 30 días.' },
        { type: 'warning', icon: AlertTriangle, label: 'Riesgo de churn', desc: 'Sin compras en 45 días. Considera una oferta de reenganche.' },
        { type: 'info', icon: Lightbulb, label: ' upsell detectado', desc: 'Diploma "Maestrías Express" disponible — alto margen.' },
        { type: 'success', icon: TrendingUp, label: 'Comportamiento VIP', desc: 'Gasto promedio 40% mayor al baseline de su segmento.' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase">Insights IA</h3>
                <Sparkles className="w-5 h-5 text-amber-400" />
            </div>

            <div className="grid grid-cols-1 gap-4">
                {insights.map((insight, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-6 bg-zinc-900 border border-white/5 rounded-3xl flex gap-4 items-start"
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            insight.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                            insight.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-indigo-500/10 text-indigo-500'
                        }`}>
                            <insight.icon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase">{insight.label}</span>
                            <span className="text-[10px] text-gray-500 mt-1">{insight.desc}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="p-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-[2.5rem] space-y-4">
                <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h4 className="text-[10px] font-black uppercase text-amber-400">Recomendación IA</h4>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                    Basado en el historial de {client.firstName}, sugiere enviar una oferta personalizada por el curso "Maestrías Express" con 15% de descuento exclusivo. Su engagement histórico indica 73% de probabilidad de conversión.
                </p>
                <button className="w-full py-4 bg-amber-500 text-black rounded-2xl font-black uppercase text-[10px] hover:bg-amber-400 transition-all">
                    Aplicar Oferta
                </button>
            </div>
        </div>
    );
}
