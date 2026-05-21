"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, CheckCircle } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useLandingCMS } from "@/context/LandingCMSContext";

export function FAQ() {
    const { cmsData } = useLandingCMS();
    const { title, subtitle, items: faqs, ctaText, ctaLink, satisfactionRate } = cmsData.faq;
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section className="pt-10 pb-24 bg-black relative overflow-hidden" style={{ isolation: 'isolate' }}>
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span className="text-[#209f89] font-bold tracking-widest text-sm uppercase flex items-center justify-start gap-2 mb-4">
                            <HelpCircle className="w-4 h-4" /> {title || 'Preguntas'}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wide text-left">
                            {subtitle || 'Frecuentes'}
                        </h2>
                    </motion.div>

                    {/* Widget Satisfacción */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        animate={{ y: [-5, 5, -5] }}
                        transition={{ opacity: { duration: 1 }, x: { duration: 1 }, y: { repeat: Infinity, duration: 7, ease: "easeInOut" } }}
                        className="flex flex-col gap-2 glass-card p-5 rounded-2xl w-full md:w-56 z-20 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.6)] bg-black/80 backdrop-blur-xl"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="text-emerald-400 w-4 h-4" />
                            <span className="text-[10px] font-mono text-gray-300 uppercase tracking-widest">Satisfacción</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <div className="text-3xl font-black text-white tracking-tighter">
                                {satisfactionRate || '4.9'}
                            </div>
                            <span className="text-gray-400 text-xs uppercase tracking-widest font-mono">/ 5.0</span>
                        </div>
                        <div className="flex gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <div key={star} className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: star === 5 ? "90%" : "100%" }}
                                        transition={{ duration: 1.5, delay: star * 0.1 }}
                                        className="bg-emerald-400 h-full shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    {faqs && faqs.length > 0 ? faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                                activeIndex === index
                                    ? 'border-blis-red bg-blis-red/10 shadow-[0_0_20px_rgba(190,11,60,0.2)]'
                                    : 'glass-card border-white/10 hover:border-blis-red/50 hover:bg-blis-red/5'
                            }`}
                        >
                            <button
                                onClick={() => toggleAccordion(index)}
                                className="w-full text-left p-6 flex items-center justify-between focus:outline-none group"
                            >
                                <h3 className={`text-sm md:text-base lg:text-lg font-bold uppercase transition-colors pr-8 leading-snug ${
                                    activeIndex === index ? 'text-white drop-shadow-[0_0_8px_rgba(190,11,60,0.3)]' : 'text-gray-300'
                                }`}>
                                    {faq.question}
                                </h3>
                                <motion.div
                                    animate={{ rotate: activeIndex === index ? 180 : 0 }}
                                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                    className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                                        activeIndex === index
                                            ? 'border-blis-red bg-blis-red text-white shadow-[0_0_10px_rgba(190,11,60,0.4)]'
                                            : 'border-white/20 text-white/50 group-hover:border-blis-red/50 group-hover:text-blis-red'
                                    }`}
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </motion.div>
                            </button>

                            <AnimatePresence initial={false}>
                                {activeIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                        <div className="px-6 pb-6 pt-0 text-gray-400 font-light leading-relaxed border-t border-white/5 mt-2 pt-4">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )) : (
                        <div className="col-span-2 text-center py-12 text-gray-500">
                            <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p>No hay preguntas frecuentes configuradas</p>
                        </div>
                    )}
                </div>

                {/* Additional contact prompt */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                    className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm"
                >
                    <p className="text-gray-500 font-light">
                        ¿Tienes una duda técnica o legal específica?
                    </p>
                    <a href={ctaLink || '#footer'} className="text-blis-red font-bold uppercase tracking-widest hover:underline whitespace-nowrap">
                        {ctaText || 'Habla con un Asesor'} →
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
