"use client";

import { motion } from "framer-motion";
import { Play, Eye, TrendingUp, ShieldCheck } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useLandingCMS } from "@/context/LandingCMSContext";

export function VideoShowcase() {
    const { cmsData } = useLandingCMS();
    const videoData = cmsData.video;
    
    return (
        <section className="relative w-full min-h-screen bg-black overflow-hidden pt-12 pb-20 md:py-32 flex flex-col items-center">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blis-red/10 via-transparent to-transparent pointer-events-none z-0" />

            <div className="container mx-auto px-6 relative z-10 flex flex-col items-center gap-10 md:gap-20">
                {/* 1. Header with premium spacing */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="text-center w-full"
                >
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-white mb-6">
                        {videoData.title} <span className="text-blis-red">{videoData.subtitle}</span>
                    </h2>
                    <p className="text-gray-400 font-medium tracking-[0.2em] text-[10px] md:text-sm uppercase opacity-80 max-w-xl mx-auto border-y border-white/5 py-3 italic">
                        Explora nuestros proyectos a través de un lente cinematográfico
                    </p>
                </motion.div>

                {/* 2. Stabilized Video Player */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative w-full max-w-5xl aspect-video glass-card p-2 md:p-4 rounded-[1.5rem] md:rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.9)] group"
                >
                    <div className="relative w-full h-full bg-zinc-950 rounded-[1.2rem] md:rounded-[1.5rem] overflow-hidden border border-white/5 shadow-inner">
                        {/* THE VIDEO IFRAME */}
                        <div className="absolute inset-0 w-full h-full">
                            <iframe
                                src={videoData.embedUrl || "https://adilo.bigcommand.com/watch/LteCS2H5"}
                                className="w-full h-full border-0"
                                allowFullScreen
                                //@ts-ignore
                                allowtransparency="true"
                                scrolling="no"
                            ></iframe>
                        </div>

                        {/* Cinema Mode Indicator */}
                        <div className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-3 glass-card px-4 py-2 rounded-full border border-white/10 bg-black/80 backdrop-blur-md pointer-events-none z-20">
                            <Play className="w-3 h-3 text-blis-red fill-blis-red" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Cinema Mode</span>
                            <div className="flex gap-1 items-end h-3">
                                {[1, 2, 3, 4].map(i => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: ["40%", "100%", "40%"] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                                        className="w-[2px] bg-blis-red/60 rounded-full"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 3. Stats Section - Sole Prominent Widget */}
                <div className="w-full max-w-xl px-4 md:px-0">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-zinc-950/60 border border-white/10 p-6 md:p-8 rounded-2xl md:rounded-3xl flex flex-col gap-5 group hover:border-blis-red/30 transition-all duration-500 shadow-2xl backdrop-blur-md"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Eye className="text-blis-red w-4 h-4" />
                                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] font-bold">Vistas Únicas</span>
                                </div>
                                <h4 className="text-2xl md:text-3xl font-black text-white">
                                    <AnimatedCounter target={12450} duration={2500} />
                                </h4>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-blis-red/10 flex items-center justify-center shrink-0">
                                <Eye className="w-6 h-6 text-blis-red opacity-80" />
                            </div>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: "75%" }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                                className="bg-blis-red h-full shadow-[0_0_15px_rgba(190,11,60,0.6)]"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
