"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BarChart3, PieChart, Activity, TrendingUp } from "lucide-react";
import { useRef, useState, useEffect } from "react";

import { TrustBadges } from "./TrustBadges";
import { useLandingCMS } from "@/context/LandingCMSContext";

export function Hero() {
    const { cmsData } = useLandingCMS();
    const ref = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const yText = useTransform(scrollYProgress, [0, 1], [0, 250]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
    const marqueeOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

    return (
        <section
            ref={ref}
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950"
        >
            {/* Tech Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none" />

            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
                <div className="absolute w-[600px] h-[600px] bg-blis-red/8 rounded-full blur-[100px] opacity-50" />
            </div>

            {/* Neon text animation styles */}
            <style>{`
                @keyframes neon-trace {
                    0%   { text-shadow: 2px 0 8px rgba(190,11,60,0), -2px 0 8px rgba(190,11,60,0), 0 0 0 rgba(190,11,60,0); }
                    15%  { text-shadow: 3px 0 12px rgba(190,11,60,0.9), -1px 0 4px rgba(190,11,60,0.3), 0 0 30px rgba(190,11,60,0.4); }
                    30%  { text-shadow: -3px 0 12px rgba(190,11,60,0.9),  1px 0 4px rgba(190,11,60,0.3), 0 0 30px rgba(190,11,60,0.4); }
                    50%  { text-shadow: 0 3px 12px rgba(190,11,60,0.9),   0 -1px 4px rgba(190,11,60,0.3), 0 0 40px rgba(190,11,60,0.6); }
                    70%  { text-shadow: 0 -3px 12px rgba(190,11,60,0.9),  0  1px 4px rgba(190,11,60,0.3), 0 0 30px rgba(190,11,60,0.4); }
                    85%  { text-shadow: 3px 0 12px rgba(190,11,60,0.9), -1px 0 4px rgba(190,11,60,0.3), 0 0 30px rgba(190,11,60,0.4); }
                    100% { text-shadow: 2px 0 8px rgba(190,11,60,0), -2px 0 8px rgba(190,11,60,0), 0 0 0 rgba(190,11,60,0); }
                }
                .neon-trace-blis {
                    animation: neon-trace 3s ease-in-out infinite;
                }
                @keyframes neon-trace-corp {
                    0%   { filter: drop-shadow(0 0 0px rgba(190,11,60,0)); }
                    20%  { filter: drop-shadow(3px 0 8px rgba(190,11,60,0.8)) drop-shadow(-2px 0 4px rgba(190,11,60,0.4)); }
                    40%  { filter: drop-shadow(0 3px 8px rgba(190,11,60,0.8)) drop-shadow(0 -2px 4px rgba(190,11,60,0.4)); }
                    60%  { filter: drop-shadow(-3px 0 8px rgba(190,11,60,0.8)) drop-shadow(2px 0 4px rgba(190,11,60,0.4)); }
                    80%  { filter: drop-shadow(0 -3px 8px rgba(190,11,60,0.8)) drop-shadow(0 2px 4px rgba(190,11,60,0.4)); }
                    100% { filter: drop-shadow(0 0 0px rgba(190,11,60,0)); }
                }
                .neon-trace-corp {
                    animation: neon-trace-corp 3s ease-in-out 1.5s infinite;
                }
            `}</style>

{/* --- FLOATING UI WIDGETS --- */}
            <>
            {/* Widget 1: Ventas (Top Left) */}
            <motion.div

                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0, y: [-10, 10, -10] }}
                transition={{
                    opacity: { duration: 1 },
                    x: { duration: 1 },
                    y: { repeat: Infinity, duration: 7, ease: "easeInOut" }
                }}
                className="absolute top-[10%] left-[2%] sm:left-[8%] xl:left-[15%] flex flex-col gap-2 glass-card p-3 sm:p-4 rounded-2xl w-40 sm:w-44 md:w-40 xl:w-52 z-10 border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-black/60 backdrop-blur-xl opacity-80 sm:opacity-100"
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs sm:text-[10px] font-mono text-gray-400 uppercase tracking-widest">Ventas</span>
                    <BarChart3 className="text-[#209f89] w-4 h-4 sm:w-4 sm:h-4" />
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-2xl sm:text-2xl font-black text-white leading-none">+{cmsData.operations.stats.sales}</span>
                    <span className="text-xs sm:text-[10px] text-[#209f89] font-bold mb-0.5">+12%</span>
                </div>
                <div className="flex items-end gap-1 sm:gap-1 h-8 sm:h-8 mt-2 opacity-80">
                    {[40, 70, 45, 90, 65, 100].map((h, i) => (
                        <div key={i} className="w-full bg-white/10 rounded-t-sm" style={{ height: '100%' }}>
                            <div className="bg-[#209f89] w-full rounded-t-sm transition-all duration-1000" style={{ height: `${h}%` }} />
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Widget 3: Portafolio (Top Right) */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0, y: [-12, 12, -12] }}
                transition={{
                    opacity: { duration: 1, delay: 0.8 },
                    x: { duration: 1, delay: 0.8 },
                    y: { repeat: Infinity, duration: 9, ease: "easeInOut", delay: 0.8 }
                }}
                className="absolute top-[10%] right-[2%] sm:right-[8%] xl:right-[15%] flex items-center gap-3 sm:gap-4 glass-card p-3 sm:p-4 rounded-2xl w-40 sm:w-52 md:w-48 lg:w-52 xl:w-56 z-10 border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-black/60 backdrop-blur-xl opacity-80 sm:opacity-100"
            >
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                        <circle cx="24" cy="24" r="20" fill="none" stroke="#fbbf24" strokeWidth="6" strokeDasharray="125.6" strokeDashoffset="31.4" className="transition-all duration-1000" />
                    </svg>
                    <PieChart className="absolute w-4 h-4 sm:w-4 sm:h-4 text-amber-400" />
                </div>
                <div>
                    <span className="text-xs sm:text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-0.5">Proyectos</span>
                    <span className="text-white font-bold text-sm sm:text-sm">{cmsData.map.locations.length} Activos</span>
                </div>
            </motion.div>

            {/* Widget 4: Rendimiento (Bottom Left) */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0, y: [-15, 15, -15] }}
                onDoubleClick={() => window.location.href = '/superadmin/trading'}
                transition={{
                    opacity: { duration: 1, delay: 0.3 },
                    x: { duration: 1, delay: 0.3 },
                    y: { repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.3 }
                }}
                className="absolute bottom-[22%] left-[2%] sm:left-[5%] xl:left-[10%] flex flex-col gap-2.5 sm:gap-4 glass-card p-4 sm:p-5 rounded-2xl w-44 md:w-52 lg:w-60 xl:w-64 z-10 border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl bg-black/60 sm:bg-[#0a0a0a] opacity-80 sm:opacity-100"
            >
                <div className="flex items-center gap-2 sm:gap-3 mb-1">
                    <Activity className="text-blis-red w-4 h-4 sm:w-6 sm:h-6 animate-pulse drop-shadow-[0_0_8px_rgba(190,11,60,0.8)]" />
                    <span className="text-xs sm:text-xs font-mono text-gray-300 uppercase tracking-widest font-bold">Rendimiento</span>
                </div>
                <div className="space-y-2.5 sm:space-y-4">
                    <div className="h-2 sm:h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full w-[85%] bg-blis-red shadow-[0_0_12px_rgba(190,11,60,1)] rounded-full" />
                    </div>
                    <div className="h-2 sm:h-2.5 w-3/4 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full w-[60%] bg-[#209f89] shadow-[0_0_12px_rgba(32,159,137,1)] rounded-full" />
                    </div>
                </div>
            </motion.div>

            {/* Widget 2: Plusvalía (Bottom Right) — subido en mobile */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0, y: [-15, 15, -15] }}
                transition={{
                    opacity: { duration: 1, delay: 0.5 },
                    x: { duration: 1, delay: 0.5 },
                    y: { repeat: Infinity, duration: 8, ease: "easeInOut", delay: 0.5 }
                }}
                className="absolute bottom-[18%] right-[1%] sm:right-[5%] xl:right-[10%] flex flex-col gap-1.5 sm:gap-2 glass-card p-4 sm:p-5 rounded-2xl w-40 sm:w-56 z-10 border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-black/60 backdrop-blur-xl opacity-80 sm:opacity-100"
            >
                <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="text-blue-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-xs font-mono text-gray-400 uppercase tracking-widest">Plusvalía</span>
                </div>
                <div className="text-3xl sm:text-3xl font-black text-white tracking-tighter drop-shadow-md">
                    {cmsData.calculator.tirValue}<span className="text-blue-400 text-base sm:text-xl"></span>
                </div>
                <svg className="w-full h-8 sm:h-12 mt-1 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M0,30 L10,25 L25,28 L40,15 L55,20 L75,5 L100,2" fill="none" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M0,30 L10,25 L25,28 L40,15 L55,20 L75,5 L100,2 L100,30 L0,30 Z" fill="url(#blue-gradient-h)" opacity="0.2" />
                    <defs>
                        <linearGradient id="blue-gradient-h" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
                            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>
            </motion.div>
            </>

    {/* --- MAIN HERO CONTENT --- */}

    <motion.div

                style={{ y: yText, opacity }}
                className="relative z-30 container mx-auto px-6 flex flex-col items-center text-center mt-8 mb-20 sm:mb-32 pointer-events-none"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center w-full max-w-5xl pointer-events-auto"
                >
                    <span className="text-blis-red font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-3 md:mb-5 text-xs sm:text-[8px] md:text-[9px] xl:text-sm [@media(min-width:1024px)_and_(max-width:1366px)]:!text-[11px] [@media(min-width:1024px)_and_(max-width:1366px)]:!px-[1.2rem] [@media(min-width:1024px)_and_(max-width:1366px)]:!py-[0.5rem] [@media(min-width:1024px)_and_(max-width:1366px)]:!mb-[1.2rem] bg-black/50 px-3 py-1.5 sm:px-5 sm:py-2 rounded-full border border-blis-red/30 backdrop-blur-xl shadow-[0_0_20px_rgba(190,11,60,0.2)]">
                        {cmsData.hero.subtitle}
                    </span>

                    <h1 className="text-7xl sm:text-4xl md:text-[2.7rem] lg:text-[3.9rem] xl:text-[10rem] [@media(min-width:1024px)_and_(max-width:1366px)]:!text-[9rem] [@media(min-width:1024px)_and_(max-width:1366px)]:!mb-[2rem] [@media(min-width:1024px)_and_(max-width:1366px)]:!gap-[2rem] font-black tracking-tighter text-white mb-4 md:mb-5 uppercase flex flex-row items-center gap-3 md:gap-4 xl:gap-6 leading-none">
                        <span className="neon-trace-blis">{cmsData.hero.title1}</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-300 to-gray-600 neon-trace-corp">{cmsData.hero.title2}</span>
                    </h1>

                    <div className="mt-4 mb-6 md:mt-2 md:mb-8 px-4">
                        <p className="text-sm sm:text-sm md:text-base lg:text-lg xl:text-2xl [@media(min-width:1024px)_and_(max-width:1366px)]:!text-[1rem] [@media(min-width:1024px)_and_(max-width:1366px)]:!max-w-[550px] font-light text-gray-300 tracking-wide max-w-xl xl:max-w-4xl mx-auto leading-relaxed">
                            {cmsData.hero.description}
                        </p>
                    </div>

                    <div className="flex flex-row gap-3 sm:gap-4 w-full max-w-[90vw] sm:max-w-none sm:w-auto justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.location.href = cmsData.hero.primaryBtnLink}
                            className="group relative flex-1 sm:flex-none flex items-center justify-center px-4 py-3 sm:px-8 sm:py-4 md:px-7 md:py-4 lg:px-9 lg:py-5 [@media(min-width:1024px)_and_(max-width:1366px)]:!px-[1.2rem] [@media(min-width:1024px)_and_(max-width:1366px)]:!py-[0.65rem] [@media(min-width:1024px)_and_(max-width:1366px)]:!text-[9px] bg-blis-red text-white font-black tracking-normal sm:tracking-[0.2em] uppercase rounded-xl overflow-hidden transition-all shadow-[0_0_30px_rgba(190,11,60,0.4)] hover:shadow-[0_0_50px_rgba(190,11,60,0.8)] text-[10px] sm:text-xs md:text-sm lg:text-base whitespace-nowrap"
                        >
                            <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                                {cmsData.hero.primaryBtnText}
                                <ArrowRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform shrink-0" />
                            </span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                const target = cmsData.hero.secondaryBtnLink;
                                if (target.startsWith("#")) {
                                    const el = document.getElementById(target.substring(1));
                                    if (el) {
                                        const scrollOffset = 70;
                                        const top = el.getBoundingClientRect().top + window.scrollY - scrollOffset;
                                        window.scrollTo({ top, behavior: "smooth" });
                                    }
                                } else {
                                    window.location.href = target;
                                }
                            }}
                            className="group relative flex-1 sm:flex-none flex items-center justify-center px-4 py-3 sm:px-8 sm:py-4 md:px-7 md:py-4 lg:px-9 lg:py-5 [@media(min-width:1024px)_and_(max-width:1366px)]:!px-[1.2rem] [@media(min-width:1024px)_and_(max-width:1366px)]:!py-[0.65rem] [@media(min-width:1024px)_and_(max-width:1366px)]:!text-[9px] bg-black/50 border border-white/20 text-white font-bold tracking-normal sm:tracking-[0.2em] uppercase rounded-xl overflow-hidden transition-all hover:bg-white/10 hover:border-white/50 backdrop-blur-md text-[10px] sm:text-xs md:text-sm lg:text-base shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] whitespace-nowrap"
                        >
                            <span className="relative z-10">
                                {cmsData.hero.secondaryBtnText}
                            </span>
                        </motion.button>
                    </div>
                    </motion.div>
            </motion.div>


            {/* --- TRUST BADGES (Hero Footer) --- */}
            <motion.div style={{ opacity: marqueeOpacity }} className="absolute bottom-10 sm:bottom-2 left-0 right-0 z-30 pointer-events-auto">
                <TrustBadges />
            </motion.div>

        </section>
    );
}
