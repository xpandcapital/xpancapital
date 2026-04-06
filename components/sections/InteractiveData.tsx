"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { TrendingUp, BarChart3, Infinity as InfinityIcon, Zap } from "lucide-react";
import { useRef } from "react";
import { useLandingCMS } from "@/context/LandingCMSContext";

const iconMap: Record<string, any> = {
    TrendingUp,
    BarChart3,
    Zap
};

export function InteractiveData() {
    const { cmsData } = useLandingCMS();
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const yLeft = useTransform(scrollYProgress, [0, 1], [50, -50]);
    const yRight = useTransform(scrollYProgress, [0, 1], [-50, 50]);

    const stats = cmsData.market.stats.map(s => ({
        ...s,
        icon: iconMap[s.icon] || BarChart3
    }));

    return (
        <section ref={ref} className="pt-10 md:pt-24 pb-24 bg-gradient-to-b from-black via-zinc-950 to-black relative overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-900/20 to-transparent rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#209f89]/10 to-transparent rounded-full blur-[150px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Texto e Información Módulo */}
                    <motion.div
                        style={{ y: yLeft }}
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span className="text-[#209f89] font-bold tracking-widest text-sm uppercase flex items-center gap-2 mb-4">
                            <InfinityIcon className="w-4 h-4" /> {cmsData.market.subtitle1}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase leading-tight mb-8">
                            {cmsData.market.title} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-teal-400 to-[#209f89]">{cmsData.market.subtitle2}</span>
                        </h2>

                        <p className="text-gray-400 text-lg font-light leading-relaxed mb-10">
                            {cmsData.market.description}
                        </p>

                        <div className="space-y-4">
                            {cmsData.market.insights.map((insight, idx) => (
                                <div 
                                    key={idx} 
                                    className="p-6 rounded-2xl bg-white/[0.03] border-l-4 backdrop-blur-sm"
                                    style={{ borderLeftColor: idx === 0 ? '#be0b3c' : '#209f89' }}
                                >
                                    <h4 className="text-white font-bold uppercase text-sm mb-2">{insight.title}</h4>
                                    <p className="font-light text-sm italic" style={{ color: idx === 0 ? 'rgb(209 213 219)' : '#209f89' }}>
                                        "{insight.text}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Gráficas / Cartas Interactivas */}
                    <motion.div style={{ y: yRight }} className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.2, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                className="relative group"
                                style={{ 
                                    ...(index === 2 ? { gridColumn: '1 / -1' } : {})
                                }}
                            >
                                {/* Outer glow effect on hover */}
                                <div 
                                    className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{ 
                                        background: `radial-gradient(ellipse at center, ${stat.color || '#3b82f6'}40 0%, transparent 60%)`,
                                        filter: 'blur(20px)'
                                    }}
                                />
                                
                                {/* Card */}
                                <div 
                                    className="relative rounded-2xl overflow-hidden transition-all duration-500 group-hover:scale-[1.02]"
                                    style={{ 
                                        background: `linear-gradient(145deg, rgba(20,20,20,0.9) 0%, rgba(10,10,10,0.95) 100%)`,
                                        boxShadow: `0 0 0 1px ${stat.color || '#3b82f6'}20, 0 4px 24px -12px ${stat.color || '#3b82f6'}30`
                                    }}
                                >
                                    {/* Top gradient line */}
                                    <div 
                                        className="absolute top-0 left-0 right-0 h-px"
                                        style={{ background: `linear-gradient(90deg, transparent, ${stat.color || '#3b82f6'}, transparent)` }}
                                    />
                                    
                                    {/* Inner glow */}
                                    <div 
                                        className="absolute inset-0 rounded-2xl"
                                        style={{ 
                                            background: `radial-gradient(circle at 30% 0%, ${stat.color || '#3b82f6'}15 0%, transparent 50%)`,
                                        }}
                                    />
                                    
                                    <div className="relative p-8">
                                        <stat.icon 
                                            className="w-10 h-10 mb-5 group-hover:scale-110 transition-transform" 
                                            style={{ color: stat.color || '#3b82f6' }} 
                                        />

                                        <h3 className="text-4xl md:text-5xl font-black mb-1" style={{ color: stat.color || '#3b82f6' }}>
                                            {stat.value}
                                        </h3>
                                        <h4 className="text-white font-bold uppercase text-sm mb-2 tracking-wide">{stat.title}</h4>
                                        <p className="text-gray-500 text-xs font-light">{stat.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
