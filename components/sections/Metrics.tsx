"use client";

import { useEffect, useRef, useState } from "react";
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

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                    {metrics.map((metric, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="flex flex-col items-center justify-center p-6 sm:p-8 glass-card rounded-2xl border-t border-white/20 group hover:border-blis-red/50 transition-colors"
                        >
                            <span className="text-5xl md:text-7xl font-black neon-text mb-2 transition-all">
                                <AnimatedCounter target={metric.value} prefix={metric.prefix} suffix={metric.suffix} />
                            </span>
                            <span className="text-sm md:text-base text-gray-400 font-bold uppercase tracking-widest text-center">
                                {metric.label}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
