"use client";

import { Zap, Clock, CheckCircle, XCircle, Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';

interface Automation {
    id: string;
    name: string;
    description: string;
    trigger: string;
    status: 'active' | 'paused';
    last_run?: string;
}

interface AutomationsTabProps {
    automations: Automation[];
}

export function AutomationsTab({ automations }: AutomationsTabProps) {

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase">Automatizaciones</h3>
                <Zap className="w-5 h-5 text-amber-400" />
            </div>

            <div className="grid grid-cols-1 gap-3">
                {automations.map((auto, idx) => (
                    <motion.div
                        key={auto.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-5 bg-zinc-900 border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between gap-4"
                    >
                        <div className="flex gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                auto.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                                auto.status === 'paused' ? 'bg-amber-500/10 text-amber-500' :
                                'bg-zinc-800 text-zinc-500'
                            }`}>
                                {auto.status === 'active' ? <CheckCircle className="w-5 h-5" /> :
                                 auto.status === 'paused' ? <Pause className="w-5 h-5" /> :
                                 <XCircle className="w-5 h-5" />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase">{auto.name}</span>
                                <span className="text-[9px] text-gray-500 mt-0.5">{auto.description}</span>
                                <div className="flex items-center gap-2 mt-2">
                                    <Clock className="w-3 h-3 text-gray-600" />
                                    <span className="text-[8px] text-gray-600 font-black uppercase">Última: {auto.last_run || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                            <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg ${
                                auto.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                                'bg-amber-500/10 text-amber-500'
                            }`}>
                                {auto.status === 'active' ? 'Activa' : 'Pausada'}
                            </span>
                            <button className={`mt-2 px-4 py-2 rounded-lg text-[8px] font-black uppercase transition-all ${
                                auto.status === 'active'
                                    ? 'bg-white/5 hover:bg-white/10 text-gray-400'
                                    : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500'
                            }`}>
                                {auto.status === 'active' ? 'Pausar' : 'Activar'}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="p-8 bg-zinc-900 border border-dashed border-white/10 rounded-[2.5rem] space-y-4">
                <h4 className="text-[10px] font-black uppercase text-gray-500">Trigger Personalizado</h4>
                <p className="text-[9px] text-gray-600">Crea una automatización basada en una acción específica para este cliente.</p>
                <button className="w-full py-4 bg-white/5 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" /> Nueva Automatización
                </button>
            </div>
        </div>
    );
}
