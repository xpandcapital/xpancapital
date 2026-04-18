"use client";

import React, { useState } from 'react';
import { Percent, Hash, Divide, Zap, Maximize, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StandardCalculator } from './StandardCalculator';
import { PercentageTool, AverageTool, FractionTool, NumberGenerator } from './MathMiniTools';
import { FormulaCalc } from './FormulaCalc';

function CalculatorSuite() {
    const [activeSmartTool, setActiveSmartTool] = useState<string | null>(null);

    const smartTools = [
        { id: 'pct', name: 'Porcentaje', cat: 'Álgebra', icon: Percent, component: <PercentageTool /> },
        { id: 'avg', name: 'Promedio', cat: 'Estadística', icon: Hash, component: <AverageTool /> },
        { id: 'frac', name: 'Fracciones', cat: 'Álgebra', icon: Divide, component: <FractionTool /> },
        { id: 'gen', name: 'Generador', cat: 'Lógica', icon: Zap, component: <NumberGenerator /> },
        { id: 'area', name: 'Geometría', cat: 'Formas', icon: Maximize, component: <FormulaCalc /> },
    ];

    return (
        <div className="flex gap-6 w-full max-w-7xl mx-auto items-start p-2">
            <div className="sticky top-0 shrink-0">
                <StandardCalculator />
            </div>

            <div className="flex-1 bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-md min-h-[460px]">
                <AnimatePresence mode="wait">
                    {!activeSmartTool ? (
                        <motion.div
                            key="menu"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-6 space-y-6"
                        >
                            <div className="border-b border-white/5 pb-3">
                                <h4 className="text-[9px] font-black text-white uppercase tracking-[0.4em]">Tools Especializadas</h4>
                                <p className="text-[6px] text-zinc-600 font-black uppercase mt-1">Lógica y Cálculo Avanzado</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {smartTools.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setActiveSmartTool(t.id)}
                                        className="w-full bg-black/40 border border-white/5 p-4 rounded-xl flex items-center gap-4 hover:bg-zinc-800 transition-all group overflow-hidden"
                                    >
                                        <div className="w-9 h-9 shrink-0 rounded-lg bg-zinc-900 flex items-center justify-center border border-white/5 group-hover:border-blis-red/30 transition-all">
                                            <t.icon className="w-4 h-4 text-zinc-500 group-hover:text-blis-red" />
                                        </div>
                                        <div className="text-left truncate">
                                            <div className="text-[10px] font-black text-white uppercase tracking-wider truncate">{t.name}</div>
                                            <div className="text-[7px] font-black text-zinc-700 uppercase tracking-tighter mt-0.5 truncate">{t.cat}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="tool"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6"
                        >
                            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setActiveSmartTool(null)} className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center hover:bg-zinc-800 transition-all">
                                        <ChevronRight className="w-3 h-3 text-white rotate-180" />
                                    </button>
                                    <div>
                                        <h4 className="text-[11px] font-black text-white uppercase tracking-widest leading-none">{smartTools.find(t => t.id === activeSmartTool)?.name}</h4>
                                        <span className="text-[6px] font-black text-zinc-700 uppercase tracking-[0.3em] mt-1 block">{smartTools.find(t => t.id === activeSmartTool)?.cat}</span>
                                    </div>
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-blis-red animate-pulse" />
                            </div>
                            <div className="max-w-2xl mx-auto">
                                {smartTools.find(t => t.id === activeSmartTool)?.component}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export { CalculatorSuite };