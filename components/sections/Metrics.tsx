"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

const metrics = [
    { value: 5, prefix: "+", suffix: "M", label: "En Ventas", decimals: false },
    { value: 6, prefix: "", suffix: "", label: "Urbanizaciones", decimals: false },
    { value: 235, prefix: "+", suffix: "", label: "Clientes", decimals: false },
    { value: 34, prefix: "", suffix: "", label: "Conferencias", decimals: false },
];

export function Metrics() {
    return (
        <section className="py-24 relative overflow-hidden bg-zinc-950">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blis-red/40 via-black to-black" />
            <div className="absolute inset-0 cyber-texture opacity-10 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                    {metrics.map((metric, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="relative flex flex-col items-center justify-center p-6 sm:p-8 glass-card rounded-2xl border-t border-white/20 group hover:border-blis-red/50 transition-colors overflow-hidden"
                        >
                            {/* Glow shimmer after counter settles */}
                            <motion.div
                                className="absolute inset-0 pointer-events-none rounded-2xl"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: [0, 0.15, 0] }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{ duration: 1.2, delay: 2 + index * 0.15 }}
                                style={{
                                    background: "radial-gradient(circle at 50% 50%, rgba(245,225,0,0.3) 0%, transparent 70%)",
                                }}
                            />

                            <span className="text-5xl md:text-7xl font-black neon-text mb-2 transition-all group-hover:scale-105">
                                <AnimatedCounter target={metric.value} prefix={metric.prefix} suffix={metric.suffix} />
                            </span>
                            <span className="text-sm md:text-base text-gray-400 font-bold uppercase tracking-widest text-center">
                                {metric.label}
                            </span>

                            {/* Mini progress bar under each metric */}
                            <div className="w-full h-[2px] bg-white/5 rounded-full mt-4 overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full bg-blis-red/60 shadow-[0_0_6px_rgba(213,193,8,0.4)]"
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${Math.min(100, 20 + (index + 1) * 22)}%` }}
                                    viewport={{ once: true, amount: 0.5 }}
                                    transition={{ duration: 1, delay: 2.2 + index * 0.1, ease: "easeOut" }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

