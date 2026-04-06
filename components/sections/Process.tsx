"use client";

import { motion } from "framer-motion";
import { LineChart, PenTool, HardHat, FileText, Search, Shield, Building, CheckCircle, Users, Map, Coins, Key, Target, TrendingUp, Zap, Star, Award, Heart } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useLandingCMS } from "@/context/LandingCMSContext";

const iconMap: Record<string, any> = {
    LineChart, PenTool, HardHat, FileText, Search, Shield, Building, CheckCircle,
    Users, Map, Coins, Key, Target, TrendingUp, Zap, Star, Award, Heart
};

// Hook for Intersection Observer scroll-activation
function useScrollActive(threshold = 0.5) {
    const ref = useRef<HTMLDivElement>(null);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => setIsActive(entry.isIntersecting),
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);

    return { ref, isActive };
}

function TimelineStep({ step, index, totalSteps }: { step: any; index: number; totalSteps: number }) {
    const { ref, isActive } = useScrollActive(0.4);
    const Icon = iconMap[step.icon] || FileText;

    return (
        <div ref={ref} className="flex gap-4 items-start group">
            {/* Left: icon + vertical line */}
            <div className="flex flex-col items-center shrink-0 relative self-stretch">
                <motion.div
                    animate={{
                        borderColor: isActive ? 'rgba(190,11,60,0.9)' : 'rgba(255,255,255,0.15)',
                        backgroundColor: isActive ? 'rgba(190,11,60,0.15)' : 'rgba(0,0,0,0.6)',
                        boxShadow: isActive ? '0 0 18px rgba(190,11,60,0.7)' : 'none',
                    }}
                    transition={{ duration: 0.4 }}
                    className="relative w-12 h-12 border-2 flex items-center justify-center rounded-xl z-20"
                >
                    <Icon
                        className="w-5 h-5 transition-colors duration-400"
                        style={{ color: isActive ? '#be0b3c' : 'rgba(255,255,255,0.6)' }}
                    />
                    <div
                        className="absolute -top-2 -right-2 text-[9px] font-black text-white w-5 h-5 flex items-center justify-center rounded-sm transition-colors duration-400"
                        style={{ backgroundColor: isActive ? '#be0b3c' : 'rgba(80,80,80,0.8)' }}
                    >
                        {index + 1}
                    </div>
                </motion.div>
                {/* Vertical connector - absolutely positioned to fill the space */}
                {index < totalSteps - 1 && (
                    <motion.div
                        animate={{ backgroundColor: isActive ? 'rgba(190,11,60,0.5)' : 'rgba(255,255,255,0.08)' }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="absolute top-12 bottom-0 w-[2px] z-0"
                    />
                )}
            </div>

            {/* Right: text + image */}
            <div className="flex-1 pb-8 min-w-0">
                <h3
                    className="text-sm font-bold text-white uppercase tracking-wide mb-1 transition-colors duration-400"
                    style={{ color: isActive ? '#ffffff' : 'rgba(200,200,200,0.7)' }}
                >
                    {step.title}
                </h3>
                <p className="text-gray-500 text-xs font-light mb-3 leading-relaxed">
                    {step.description}
                </p>
                {step.image ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/8 shadow-md">
                        <img
                            src={step.image}
                            alt={step.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div
                            className="absolute inset-0 transition-colors duration-400"
                            style={{ backgroundColor: isActive ? 'rgba(190,11,60,0.05)' : 'rgba(0,0,0,0.45)' }}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export function Process() {
    const { cmsData } = useLandingCMS();
    const steps = cmsData.process.steps;

    return (
        <section className="py-24 bg-black relative">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12 lg:mb-24"
                >
                    <span className="text-blis-red font-bold tracking-widest text-sm uppercase">{cmsData.process.title}</span>
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase mt-2">
                        {cmsData.process.subtitle}
                    </h2>
                </motion.div>

                {/* ====== MOBILE: Vertical Timeline ====== */}
                <div className="block lg:hidden">
                    <div className="flex flex-col">
                        {steps.map((step, index) => (
                            <TimelineStep key={index} step={step} index={index} totalSteps={steps.length} />
                        ))}
                    </div>
                </div>

                {/* ====== DESKTOP: steps grid ====== */}
                <div className="hidden lg:block relative">
                    {/* Connector Line */}
                    <div className="absolute top-[40px] left-[50px] right-[50px] h-[1px] bg-white/10" />
                    <div className={`grid grid-cols-${Math.min(steps.length, 4)} gap-8`}>
                        {steps.map((step, index) => {
                            const Icon = iconMap[step.icon] || FileText;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.2, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                    className="relative flex flex-col group"
                                >
                                    <div className="relative w-20 h-20 bg-black border border-white/20 flex items-center justify-center rounded-xl mb-6 shadow-[0_0_15px_rgba(255,255,255,0.05)] z-10 mx-0 hover:border-blis-red/60 hover:shadow-[0_0_20px_rgba(190,11,60,0.3)] transition-all">
                                        <div className="absolute inset-0 bg-blis-red opacity-0 group-hover:opacity-20 transition-opacity rounded-xl" />
                                        <Icon className="w-8 h-8 text-white group-hover:text-blis-red transition-colors" />
                                        <div className="absolute -top-3 -right-3 text-xs font-black bg-blis-red text-white w-6 h-6 flex flex-col items-center justify-center rounded-sm">
                                            {index + 1}
                                        </div>
                                    </div>
                                    <div className="flex flex-col flex-grow text-left">
                                        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide min-h-[3.5rem] flex items-start">
                                            {step.title}
                                        </h3>
                                        <p className="text-gray-400 font-light text-sm mb-6 min-h-[2.5rem]">
                                            {step.description}
                                        </p>
                                        {step.image && (
                                            <div className="relative aspect-video rounded-xl overflow-hidden glass border-white/10 opacity-80 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_15px_rgba(32,159,137,0.2)]">
                                                <img
                                                    src={step.image}
                                                    alt={step.title}
                                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-black/40 group-hover:bg-[#209f89]/10 transition-colors duration-500" />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
