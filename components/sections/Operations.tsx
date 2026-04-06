"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useLandingCMS } from "@/context/LandingCMSContext";

export function Operations() {
    const { cmsData } = useLandingCMS();
    const images = cmsData.operations.sliderImages;
    
    // We use a simplified state for reliability
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Initial Setup
    useEffect(() => {
        setIsMounted(true);
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);


    const nextSlide = useCallback(() => {
        if (images.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setProgress(0);
    }, [images.length]);

    const prevSlide = useCallback(() => {
        if (images.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setProgress(0);
    }, [images.length]);

    // 4s Progress Timer Logic (Solid Sync)
    useEffect(() => {
        if (isPaused || images.length === 0) return;

        const interval_ms = 4000;
        const frame_rate = 50;
        const step = (frame_rate / interval_ms) * 100;

        timerRef.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    nextSlide();
                    return 0;
                }
                return prev + step;
            });
        }, frame_rate);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPaused, nextSlide, images.length]);

    if (images.length === 0 || !isMounted) return null;


    return (
        <section id="operaciones" className="pt-10 md:pt-20 pb-24 bg-black overflow-hidden relative">
            {/* Header Content */}
            <div className="container mx-auto px-6 mb-12 flex justify-between items-end">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-sm font-bold tracking-[0.2em] text-blis-red uppercase mb-2">{cmsData.operations.title}</h2>
                    <h3 className="text-4xl font-black text-white uppercase tracking-wide">{cmsData.operations.subtitle}</h3>
                </motion.div>

                <div className="flex gap-3">
                    <button
                        onClick={prevSlide}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all group active:scale-90"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all group active:scale-90"
                    >
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

                {/* Main Slider Area */}
                <div
                    className="relative w-full lg:col-span-8 group/slider"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                >
                    <div className="relative h-[400px] md:h-[600px] w-full rounded-2xl overflow-hidden glass-card p-1 cursor-grab active:cursor-grabbing">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.2}
                                onDragEnd={(_, info) => {
                                    const threshold = 50;
                                    if (info.offset.x < -threshold) nextSlide();
                                    else if (info.offset.x > threshold) prevSlide();
                                }}
                                className="absolute inset-0"
                            >
                                <div
                                    className="w-full h-full bg-cover bg-center"
                                    style={{ backgroundImage: `url(${images[currentIndex]})` }}
                                />
                                {/* Scanning Lines Aesthetic Overlay */}
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] pointer-events-none" />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Progress Dots - Catalog Style */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-3 z-30 px-6">
                        {images.map((_, index) => {
                            const isActive = index === currentIndex;
                            return (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentIndex(index);
                                        setProgress(0);
                                    }}
                                    className="group relative h-1.5 transition-all duration-500 outline-none pointer-events-auto"
                                    style={{ width: isActive ? "80px" : "12px" }}
                                >
                                    <div className={`absolute inset-0 rounded-full transition-all duration-300 ${isActive ? "bg-white/10" : "bg-white/30 group-hover:bg-white/50"}`} />
                                    {isActive && (
                                        <motion.div
                                            className="absolute inset-0 bg-blis-red rounded-full shadow-[0_0_15px_rgba(190,11,60,0.6)]"
                                            initial={{ width: "0%" }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.05, ease: "linear" }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Stats Sidebar */}
                <div className="lg:col-span-4 grid grid-cols-2 gap-4 h-full md:min-h-[600px]">
                    <StatCard label="En Ventas" value={cmsData.operations.stats.sales} delay={0} />
                    <StatCard label="Urbanizaciones" value={cmsData.operations.stats.urbanizations} delay={0.1} />
                    <StatCard label="Clientes" value={cmsData.operations.stats.clients} prefix="+" delay={0.2} />
                    <StatCard label="Conferencias" value={cmsData.operations.stats.conferences} delay={0.3} />
                </div>
            </div>
        </section>
    );
}

interface StatCardProps {
    label: string;
    value: string;
    prefix?: string;
    suffix?: string;
    delay?: number;
}

function StatCard({ label, value, prefix = "", suffix = "", delay = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay }}
            className="bg-[#0A0D11] border border-white/5 rounded-2xl flex flex-col items-center justify-center p-4 transition-all hover:border-blis-red/50 hover:shadow-[0_0_30px_rgba(190,11,60,0.15)] group"
        >
            <div className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-blis-red drop-shadow-[0_0_15px_rgba(190,11,60,0.8)] flex items-center justify-center transition-all group-hover:scale-110 duration-300">
                {prefix}{value}{suffix}
            </div>
            <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-3">{label}</h4>
        </motion.div>
    );
}
