"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator as CalcIcon, TrendingUp, ShieldCheck, Clock, Activity } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useLandingCMS } from "@/context/LandingCMSContext";

export function Calculator() {
    const { cmsData } = useLandingCMS();
    const [marketValue, setMarketValue] = useState(60000);
    const [calculatedValues, setCalculatedValues] = useState({
        planos: 30000,
        preventa: 45000,
        escritura: 55000,
    });

    useEffect(() => {
        // Use ratios from CMS
        const { planosRatio, preventaRatio, escrituraRatio } = cmsData.calculator;
        
        setCalculatedValues({
            planos: Math.round(marketValue * (parseFloat(planosRatio) / 100)),
            preventa: Math.round(marketValue * (parseFloat(preventaRatio) / 100)),
            escritura: Math.round(marketValue * (parseFloat(escrituraRatio) / 100)),
        });
    }, [marketValue, cmsData.calculator]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="py-16 md:py-32 bg-black relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blis-red/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center mb-10 md:mb-16"
                >
                    <span className="text-blis-red font-bold tracking-widest text-sm uppercase flex items-center justify-center gap-2 mb-4">
                        <CalcIcon className="w-4 h-4" /> {cmsData.calculator.title}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wide">
                        {cmsData.calculator.subtitle}
                    </h2>
                    <p className="text-gray-400 font-light mt-4 max-w-xl mx-auto text-[10px] md:text-sm px-2 leading-relaxed opacity-80 italic">
                        {cmsData.calculator.description}
                    </p>
                </motion.div>

                {/* Reduced Spacer */}
                <div className="h-4 md:hidden" />

                {/* ====== MOBILE: Single-screen compact layout ====== */}
                <div className="flex lg:hidden flex-col gap-6 py-2">
                    <div className="flex flex-col gap-10">
                        {/* 3 stage cards in a row — TOP */}
                        <div className="grid grid-cols-3 gap-3">
                            {/* Etapa 1 */}
                            <div className="bg-zinc-950 rounded-xl p-4 border-t border-[#209f89]/40 relative flex flex-col justify-center min-h-[110px] shadow-2xl">
                                <p className="text-[#209f89] text-[10px] font-black uppercase tracking-widest mb-1.5">{cmsData.calculator.planosLabel || 'Planos'}</p>
                                <p className="text-white font-black text-sm leading-tight">{formatCurrency(calculatedValues.planos)}</p>
                                <div className="flex items-center gap-1 mt-2 bg-emerald-400/10 px-2 py-0.5 rounded-full w-max">
                                    <span className="text-emerald-400 text-[10px] font-mono">+{Math.round(((marketValue - calculatedValues.planos) / calculatedValues.planos) * 100)}%</span>
                                </div>
                            </div>
                            {/* Etapa 2 - Popular */}
                            <div className="bg-zinc-900 rounded-xl p-4 border-t border-blis-red/50 relative -translate-y-2 shadow-[0_15px_30px_rgba(213,193,8,0.25)] flex flex-col justify-center min-h-[110px]">
                                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blis-red text-white text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full whitespace-nowrap z-10 shadow-lg">
                                    Popular
                                </div>
                                <p className="text-blis-red text-[10px] font-black uppercase tracking-widest mb-1.5">{cmsData.calculator.preventaLabel || 'Preventa'}</p>
                                <p className="text-white font-black text-sm leading-tight">{formatCurrency(calculatedValues.preventa)}</p>
                                <div className="flex items-center gap-1 mt-2 bg-emerald-400/10 px-2 py-0.5 rounded-full w-max">
                                    <span className="text-emerald-400 text-[10px] font-mono">+{Math.round(((marketValue - calculatedValues.preventa) / calculatedValues.preventa) * 100)}%</span>
                                </div>
                            </div>
                            {/* Etapa 3 */}
                            <div className="bg-zinc-950 rounded-xl p-4 border-t border-white/10 relative flex flex-col justify-center min-h-[110px] shadow-2xl">
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5">{cmsData.calculator.escrituraLabel || 'Escritura'}</p>
                                <p className="text-white font-black text-sm leading-tight">{formatCurrency(calculatedValues.escritura)}</p>
                                <div className="flex items-center gap-1 mt-2 bg-emerald-400/10 px-2 py-0.5 rounded-full w-max">
                                    <span className="text-emerald-400 text-[10px] font-mono">+{Math.round(((marketValue - calculatedValues.escritura) / calculatedValues.escritura) * 100)}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Slider control — BOTTOM */}
                        <div className="glass-card p-8 rounded-3xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] bg-black/50 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-widest">Valor de Mercado</span>
                                <span className="text-blis-red font-black text-2xl">{formatCurrency(marketValue)}</span>
                            </div>
                            <input
                                type="range"
                                min="20000"
                                max="150000"
                                step="5000"
                                value={marketValue}
                                onChange={(e) => setMarketValue(Number(e.target.value))}
                                className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blis-red mb-4"
                            />
                            <div className="flex justify-between text-[11px] text-gray-600 font-mono uppercase tracking-tighter w-full">
                                <span>$20,000</span>
                                <span>$150,000+</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-[11px] font-normal text-gray-400 flex items-start gap-4 p-5 border border-white/10 bg-white/5 rounded-2xl mx-auto w-full">
                        <ShieldCheck className="w-5 h-5 text-blis-red shrink-0 mt-0.5 opacity-80" />
                        <p className="leading-relaxed">Proyecciones basadas en datos históricos de Xpand Capital. Valores aproximados.</p>
                    </div>

                    {/* Final Bottom Spacer to avoid cramping */}
                    <div className="h-20 md:hidden" />
                </div>

                {/* ====== DESKTOP: full two-column layout ====== */}
                <div className="hidden lg:grid grid-cols-12 gap-12 items-center">
                    {/* Range Control */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                        className="lg:col-span-4 glass-card p-8 rounded-3xl border border-white/10 relative antigravity"
                    >
                        <h3 className="text-xl font-bold text-white mb-6 uppercase">Valor de Mercado del Terreno</h3>

                        <div className="mb-8">
                            <div className="text-5xl font-black text-blis-red mb-2">{formatCurrency(marketValue)}</div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Valor Comercial Promedio</p>
                        </div>

                        <div className="relative pt-4 pb-8">
                            <input
                                type="range"
                                min="20000"
                                max="150000"
                                step="5000"
                                value={marketValue}
                                onChange={(e) => setMarketValue(Number(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blis-red relative z-10"
                            />
                            <div className="flex justify-between text-xs text-gray-600 font-mono mt-4 uppercase">
                                <span>$20k</span>
                                <span>$150k+</span>
                            </div>
                        </div>

                        <div className="text-sm font-light text-gray-400 p-4 border border-[#209f89]/20 bg-[#209f89]/5 rounded-xl flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-[#209f89] flex-shrink-0 mt-0.5" />
                            <p>Proyecciones basadas en datos históricos de Xpand Capital. Valores exactos pueden variar por macro-proyecto y etapas de urbanización.</p>
                        </div>
                    </motion.div>

                    {/* Results Cards */}
                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Etapa 1: Planos */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                            className="bg-zinc-950 rounded-2xl p-8 border-t border-white/5 relative group hover:bg-black transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#209f89]/10 rounded-bl-full transition-transform group-hover:scale-150 duration-500" />
                            <h4 className="text-[#209f89] font-bold text-sm tracking-widest uppercase mb-2 block">Etapa 1</h4>
                            <h3 className="text-2xl font-black text-white uppercase mb-6">{cmsData.calculator.planosLabel || 'En Planos'}</h3>

                            <div className="text-4xl font-black text-white mb-2">{formatCurrency(calculatedValues.planos)}</div>
                            <div className="flex items-center gap-2 text-sm text-emerald-400 font-mono bg-emerald-400/10 px-3 py-1 rounded-full w-max">
                                <TrendingUp className="w-4 h-4" />
                                +{Math.round(((marketValue - calculatedValues.planos) / calculatedValues.planos) * 100)}% ROI Est.
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10 hidden md:block">
                                <p className="text-gray-500 text-sm font-light">{cmsData.calculator.planosDesc || 'Máxima rentabilidad, mayor tiempo de espera hasta escritura.'}</p>
                            </div>
                        </motion.div>

                        {/* Etapa 2: Preventa */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                            className="bg-zinc-950 rounded-2xl p-8 border-t border-blis-red/30 relative group hover:bg-black transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.5)] lg:-translate-y-4"
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-blis-red/10 rounded-bl-full transition-transform group-hover:scale-150 duration-500" />
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blis-red text-white text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full whitespace-nowrap">
                                Más Popular
                            </div>
                            <h4 className="text-blis-red font-bold text-sm tracking-widest uppercase mb-2 block">Etapa 2</h4>
                            <h3 className="text-2xl font-black text-white uppercase mb-6">{cmsData.calculator.preventaLabel || 'Preventa'}</h3>

                            <div className="text-4xl font-black text-white mb-2">{formatCurrency(calculatedValues.preventa)}</div>
                            <div className="flex items-center gap-2 text-sm text-emerald-400 font-mono bg-emerald-400/10 px-3 py-1 rounded-full w-max">
                                <TrendingUp className="w-4 h-4" />
                                +{Math.round(((marketValue - calculatedValues.preventa) / calculatedValues.preventa) * 100)}% ROI Est.
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10 hidden md:block">
                                <p className="text-gray-500 text-sm font-light">{cmsData.calculator.preventaDesc || 'Trazado visible, inicio de obras, excelente relación costo-beneficio.'}</p>
                            </div>
                        </motion.div>

                        {/* Etapa 3: Escritura */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                            className="bg-zinc-950 rounded-2xl p-8 border-t border-white/5 relative group hover:bg-black transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full transition-transform group-hover:scale-150 duration-500" />
                            <h4 className="text-gray-400 font-bold text-sm tracking-widest uppercase mb-2 block">Etapa 3</h4>
                            <h3 className="text-2xl font-black text-white uppercase mb-6 flex flex-col">
                                {cmsData.calculator.escrituraLabel || 'Escritura'} <span className="text-xs font-light tracking-normal block mt-1">en Mano</span>
                            </h3>

                            <div className="text-4xl font-black text-white mb-2">{formatCurrency(calculatedValues.escritura)}</div>
                            <div className="flex items-center gap-2 text-sm text-emerald-400 font-mono bg-emerald-400/10 px-3 py-1 rounded-full w-max">
                                <TrendingUp className="w-4 h-4" />
                                +{Math.round(((marketValue - calculatedValues.escritura) / calculatedValues.escritura) * 100)}% ROI Est.
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10 hidden md:block">
                                <p className="text-gray-500 text-sm font-light">{cmsData.calculator.escrituraDesc || 'Saneamiento y permisos 100% listos. Entrega física inmediata.'}</p>
                            </div>
                        </motion.div>
                    </div>

                </div>  {/* end desktop grid */}

                {/* Floating Produced Widget (TIR Promedio) */}
                <motion.div
                    animate={{ y: [-12, 12, -12] }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                    className="absolute -top-12 right-0 md:-right-6 xl:-right-16 flex flex-col gap-2 glass-card p-5 rounded-2xl w-48 z-30 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] bg-black/80 backdrop-blur-xl hidden lg:flex"
                >
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="text-emerald-400 w-4 h-4" />
                        <span className="text-[10px] font-mono text-gray-300 uppercase tracking-widest">TIR Histórica</span>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tighter">
                        {cmsData.calculator.tirValue}<span className="text-emerald-400 text-xl">%</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: "85%" }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            className="bg-emerald-400 h-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                        />
                    </div>
                </motion.div>

            </div>

            {/* CTA Buttons */}
            {(cmsData.calculator.primaryBtnText || cmsData.calculator.secondaryBtnText) && (
                <div className="container mx-auto px-6 relative z-10 mt-8">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {cmsData.calculator.primaryBtnText && (
                            <motion.a
                                href={cmsData.calculator.primaryBtnLink || '/proyectos'}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="px-8 py-4 bg-blis-red text-white font-bold uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all shadow-[0_0_30px_rgba(213,193,8,0.4)] text-center"
                            >
                                {cmsData.calculator.primaryBtnText}
                            </motion.a>
                        )}
                        {cmsData.calculator.secondaryBtnText && (
                            <motion.a
                                href={cmsData.calculator.secondaryBtnLink || '#contacto'}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="px-8 py-4 bg-white/5 border border-white/20 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all text-center"
                            >
                                {cmsData.calculator.secondaryBtnText}
                            </motion.a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


