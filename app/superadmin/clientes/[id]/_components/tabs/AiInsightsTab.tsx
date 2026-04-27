"use client";

import { Sparkles, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

interface Insight {
    type: 'success' | 'warning' | 'info';
    label: string;
    description: string;
}

interface AiInsightsTabProps {
    insights: Insight[];
}

export function AiInsightsTab({ insights }: AiInsightsTabProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return CheckCircle2;
            case 'warning': return AlertTriangle;
            default: return Lightbulb;
        }
    };

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
                            {(() => {
                                const Icon = getIcon(insight.type);
                                return <Icon className="w-5 h-5" />;
                            })()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase">{insight.label}</span>
                            <span className="text-[10px] text-gray-500 mt-1">{insight.description}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
