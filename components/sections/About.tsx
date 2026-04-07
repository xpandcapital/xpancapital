"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { TrendingUp, X } from "lucide-react";
import { useLandingCMS } from "@/context/LandingCMSContext";

export function About() {
    const { cmsData } = useLandingCMS();
    const [isMounted, setIsMounted] = useState(false);
    const ref = useRef(null);
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const yText = useTransform(scrollYProgress, [0, 1], [50, -50]);
    const yVideo = useTransform(scrollYProgress, [0, 1], [-50, 50]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const yearsExperience = cmsData.about.yearsExperience || '10+';
    const yearsLabel = cmsData.about.yearsLabel || 'Años Exp.';
    const stat1Value = cmsData.about.stat1Value || '100%';
    const stat1Label = cmsData.about.stat1Label || 'Certeza Legal';
    const stat2Value = cmsData.about.stat2Value || '0';
    const stat2Label = cmsData.about.stat2Label || 'Lotes Entregados';

    return (
        <section ref={ref} id="trayectoria" className="relative py-16 md:pt-20 md:pb-32 bg-gradient-to-t from-black via-zinc-950 to-black overflow-hidden cyber-texture">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-900/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blis-red/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
            
            {/* Animated grid background instead of Lottie */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(32, 159, 137, 0.3) 0%, transparent 50%)'
                }} />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left Column (Text) */}
                    <motion.div
                        style={{ y: yText }}
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col space-y-4 md:space-y-8 bg-black/40 p-5 md:p-8 rounded-3xl backdrop-blur-md border border-white/5"
                    >
                        <div>
                            <h2 className="text-sm font-bold tracking-[0.2em] text-[#209f89] uppercase mb-4 flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-[#209f89]"></span> {cmsData.about.missionTitle || 'Trayectoria y Solidez'}
                            </h2>
                            <h3 className="text-2xl sm:text-3xl md:text-5xl font-black text-white leading-tight uppercase tracking-wide">
                                {cmsData.about.title1 || 'Varios Años Creando'} <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-600">
                                    {cmsData.about.title2 || 'Valor Patrimonial'}
                                </span>
                            </h3>
                        </div>

                        <p className="text-gray-400 text-sm md:text-lg leading-relaxed font-light">
                            {cmsData.about.missionText}
                        </p>

                        <div className="flex items-center gap-4 md:gap-6 pt-2 md:pt-4">
                            <div className="flex flex-col">
                                <span className="text-2xl md:text-4xl font-black text-white" suppressHydrationWarning>{yearsExperience}</span>
                                <span className="text-[10px] md:text-xs uppercase tracking-widest text-[#209f89] mt-1">{yearsLabel}</span>
                            </div>
                            <div className="h-10 w-[1px] bg-white/10" />
                            <div className="flex flex-col">
                                <span className="text-2xl md:text-4xl font-black text-blis-red" suppressHydrationWarning>{stat1Value}</span>
                                <span className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500 mt-1">{stat1Label}</span>
                            </div>
                            <div className="h-10 w-[1px] bg-white/10" />
                            <div className="flex flex-col">
                                <span className="text-2xl md:text-4xl font-black text-white">
                                    {isMounted ? <AnimatedCounter prefix="+" target={parseInt(stat2Value.replace(/\D/g, ''))} duration={2000} /> : `+${stat2Value.replace(/\D/g, '')}`}
                                </span>
                                <span className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500 mt-1">{stat2Label}</span>
                            </div>
                        </div>


                    </motion.div>


                    {/* Right Column (Floating Video Container) */}
                    <motion.div
                        style={{ y: yVideo }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="relative h-[600px] w-full"
                    >
                        {/* Antigravity floating effect via CSS class */}
                        <div
                            className="antigravity absolute inset-0 glass-card rounded-2xl overflow-hidden border border-[#209f89]/20 p-2 shadow-[0_0_30px_rgba(32,159,137,0.1)] cursor-pointer group"
                            onClick={() => setIsVideoOpen(true)}
                        >
                            <div className="relative w-full h-full bg-zinc-900 rounded-xl overflow-hidden">
                                {/* Thumbnail Image */}
                                <div 
                                    className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:opacity-50 transition-opacity duration-500 scale-105 group-hover:scale-100" 
                                    style={{ backgroundImage: cmsData.about.videoThumbnail ? `url('${cmsData.about.videoThumbnail}')` : 'none' }}
                                />
                                {(!cmsData.about.videoThumbnail || cmsData.about.videoThumbnail === '') && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                                        <span className="text-gray-600 text-sm">Sin miniatura</span>
                                    </div>
                                )}

                                {/* Play Button Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-24 h-24 rounded-full bg-[#209f89]/20 backdrop-blur-md border border-[#209f89]/50 flex items-center justify-center hover:scale-110 hover:bg-[#209f89]/40 transition-all duration-300 shadow-[0_0_20px_rgba(32,159,137,0.5)]">
                                        <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-2" />
                                    </div>
                                </div>
                                {/* Decorative Elements */}
                                <div className="absolute top-6 left-6 flex gap-2 items-center bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                                    <div className="w-2 h-2 rounded-full bg-blis-red animate-pulse" />
                                    <span className="text-[10px] font-mono tracking-widest text-white/90 uppercase">Conoce Nuestra Historia</span>
                                </div>
                            </div>
                        </div>

                        {/* Glow effect behind */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#209f89]/10 blur-[100px] -z-10" />

                        {/* Floating Produced Widget */}
                        <motion.div
                            animate={{ y: [-15, 15, -15] }}
                            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
                            className="absolute -bottom-8 -left-8 md:-left-12 flex flex-col gap-3 glass-card p-5 rounded-2xl w-56 z-20 border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.8)] bg-[#050505] backdrop-blur-xl hidden lg:flex"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="text-[#209f89] w-5 h-5" />
                                <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">{cmsData.about.stat3Label || 'Entregas'}</span>
                            </div>
                            <div className="text-3xl font-black text-white tracking-tighter">
                                <AnimatedCounter prefix="+" target={parseInt((cmsData.about.stat3Value || '0').replace(/\D/g, ''))} duration={2500} />
                            </div>
                            <div className="flex items-end gap-1 h-10 mt-2">
                                {[30, 45, 60, 50, 80, 75, 100].map((h, i) => (
                                    <div key={i} className="w-full bg-white/5 rounded-t-sm" style={{ height: '100%' }}>
                                        <motion.div
                                            initial={{ height: 0 }}
                                            whileInView={{ height: `${h}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            className="bg-[#209f89] w-full rounded-t-sm shadow-[0_0_10px_rgba(32,159,137,0.5)]"
                                        />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>

                </div>
            </div>

            {/* Video Modal */}
            <AnimatePresence>
                {isVideoOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-12"
                        onClick={() => setIsVideoOpen(false)}
                    >
                        <button
                            className="absolute top-8 right-8 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-[60]"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsVideoOpen(false);
                            }}
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="relative w-full max-w-6xl aspect-video glass-card rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <iframe
                                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                                // @ts-ignore
                                allowtransparency="true"
                                src={cmsData.about.videoUrl}
                                frameBorder="0"
                                allowFullScreen
                                scrolling="no"
                            ></iframe>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
