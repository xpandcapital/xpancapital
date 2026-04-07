"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Star, TrendingUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLandingCMS } from "@/context/LandingCMSContext";



const floatingIcons = [
    { icon: Quote, style: "top-10 left-10 text-white/5", size: "w-20 h-20", delay: 0 },
    { icon: Star, style: "bottom-20 right-16 text-blis-red/10", size: "w-12 h-12", delay: 1.5 },
    { icon: TrendingUp, style: "top-1/2 right-10 text-white/5", size: "w-16 h-16", delay: 0.8 },
];

const NeonStars = () => (
    <div className="flex gap-1 justify-center mb-3">
        {[1, 2, 3, 4, 5].map(i => (
            <Star
                key={i}
                className="w-4 h-4 fill-blis-red text-blis-red drop-shadow-[0_0_6px_rgba(190,11,60,0.9)]"
            />
        ))}
    </div>
);

export function Testimonials() {
    const { cmsData } = useLandingCMS();
    const { title, subtitle, items: testimonials } = cmsData.testimonials;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isCooldown, setIsCooldown] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | NodeJS.Timeout | null>(null);

    const handleManualNavigation = (direction: 'next' | 'prev') => {
        setIsCooldown(true);
        setIsPaused(false);
        if (!testimonials || testimonials.length === 0) return;
        if (direction === 'next') {
            setCurrentIndex((prev) => (prev + 1 >= testimonials.length ? 0 : prev + 1));
        } else {
            setCurrentIndex((prev) => (prev - 1 < 0 ? testimonials.length - 1 : prev - 1));
        }
    };

    const next = () => handleManualNavigation('next');
    const prev = () => handleManualNavigation('prev');

    const handleMobileTap = () => {
        setIsPaused(p => !p);
    };

    useEffect(() => {
        if (!testimonials || testimonials.length === 0) return;
        
        if (isPaused) {
            if (timerRef.current) clearInterval(timerRef.current as any);
            return;
        }

        if (isCooldown) {
            timerRef.current = setTimeout(() => {
                setIsCooldown(false);
                setCurrentIndex((prev) => (prev + 1 >= testimonials.length ? 0 : prev + 1));
            }, 5000);
        } else {
            timerRef.current = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1 >= testimonials.length ? 0 : prev + 1));
            }, 3000);
        }

        return () => {
            if (timerRef.current) {
                isCooldown
                    ? clearTimeout(timerRef.current as NodeJS.Timeout)
                    : clearInterval(timerRef.current as ReturnType<typeof setInterval>);
            }
        };
    }, [isPaused, isCooldown, currentIndex, testimonials?.length]);

    if (!testimonials || testimonials.length === 0) return null;

    const visibleTestimonials = [...testimonials, ...testimonials].slice(currentIndex, currentIndex + 3);
    const mobileTestimonial = testimonials[currentIndex];

    return (
        <section className="pt-10 md:pt-20 pb-24 bg-gradient-to-br from-zinc-950 via-black to-blis-red/5 relative cyber-texture overflow-hidden">
            {floatingIcons.map(({ icon: Icon, style, size, delay }, i) => (
                <motion.div
                    key={i}
                    className={`absolute pointer-events-none ${style}`}
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ repeat: Infinity, duration: 5 + i, ease: "easeInOut", delay }}
                >
                    <Icon className={size} />
                </motion.div>
            ))}

            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-zinc-950 to-transparent z-0" />

            <div className="container mx-auto px-6 relative z-10 w-full overflow-hidden pb-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <span className="text-blis-red font-bold tracking-widest text-sm uppercase">{title}</span>
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase mt-2">
                            {subtitle}
                        </h2>
                    </motion.div>

                    {/* Desktop arrows */}
                    <div className="hidden md:flex flex-col gap-4 items-end">
                        <div className="flex items-center gap-4">
                            <button onClick={prev} className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-blis-red hover:border-blis-red transition-all z-20">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button onClick={next} className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-blis-red hover:border-blis-red transition-all z-20">
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                        {isPaused && (
                            <span className="text-[10px] uppercase text-blis-red/60 tracking-widest font-mono animate-pulse">⏸ Pausado</span>
                        )}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="relative mb-8">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        {!isPaused && (
                            <motion.div
                                key={currentIndex}
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: isCooldown ? 5 : 3, ease: "linear" }}
                                className="h-full bg-blis-red shadow-[0_0_10px_rgba(190,11,60,0.8)]"
                            />
                        )}
                        {isPaused && <div className="h-full bg-blis-red/30 w-full" />}
                    </div>
                    {isPaused && (
                        <p className="text-center text-[10px] font-mono text-blis-red/70 uppercase tracking-widest mt-2 animate-pulse md:hidden">
                            ⏸ Toca para reanudar
                        </p>
                    )}
                </div>

                {/* ====== MOBILE: Single card, tap to pause ====== */}
                <div className="block md:hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.5 }}
                            onClick={handleMobileTap}
                            className="glass-card rounded-2xl p-6 relative border border-white/8 bg-black/60 cursor-pointer select-none min-h-[380px] flex flex-col justify-between"
                        >
                            <Quote className="w-8 h-8 text-white/5 absolute top-4 right-4" />

                            {/* Neon stars */}
                            <NeonStars />

                            <p className="text-gray-300 font-light italic leading-relaxed mb-6 text-sm relative z-10">
                                &ldquo;{mobileTestimonial.quote}&rdquo;
                            </p>

                            <div className="flex flex-col items-center">
                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/15 mb-3">
                                    {mobileTestimonial.image ? (
                                        <img
                                            src={mobileTestimonial.image}
                                            alt={mobileTestimonial.author}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-blis-red/20 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-white/50">{mobileTestimonial.author?.charAt(0) || '?'}</span>
                                        </div>
                                    )}
                                </div>
                                <h5 className="text-white font-bold uppercase tracking-wide text-sm">{mobileTestimonial.author}</h5>
                                <span className="text-blis-red/80 font-mono text-xs uppercase tracking-widest mt-0.5">{mobileTestimonial.role}</span>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Mobile navigation */}
                    <div className="flex justify-center items-center gap-5 mt-6 relative z-20">
                        <button
                            onClick={prev}
                            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-blis-red hover:border-blis-red transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        {/* Dots */}
                        <div className="flex gap-1.5">
                            {testimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setCurrentIndex(i); setIsPaused(false); setIsCooldown(true); }}
                                    className="transition-all duration-300"
                                >
                                    <div className={`rounded-full transition-all duration-300 ${i === currentIndex ? 'w-5 h-2 bg-blis-red shadow-[0_0_6px_rgba(190,11,60,0.8)]' : 'w-2 h-2 bg-white/20'}`} />
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={next}
                            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-blis-red hover:border-blis-red transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* ====== DESKTOP: 3 cards ====== */}
                <div
                    className="hidden md:block relative min-h-[440px]"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="grid grid-cols-3 gap-8 absolute inset-0 w-full"
                        >
                            {visibleTestimonials.map((testimonial, index) => (
                                <div
                                    key={`${currentIndex}-${index}`}
                                    className="glass-card rounded-2xl p-8 relative antigravity group hover:border-white/20 transition-all border-t border-white/5 h-[350px] flex flex-col bg-black/60 hover:bg-black/80"
                                >
                                    <Quote className="w-10 h-10 text-white/5 absolute top-6 right-6 group-hover:text-blis-red/20 transition-colors" />
                                    {/* Neon stars */}
                                    <div className="flex gap-1 mb-3">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star key={i} className="w-3.5 h-3.5 fill-blis-red text-blis-red drop-shadow-[0_0_4px_rgba(190,11,60,0.7)]" />
                                        ))}
                                    </div>
                                    <p className="text-gray-300 font-light italic leading-relaxed mb-8 relative z-10 flex-grow">
                                        &ldquo;{testimonial.quote}&rdquo;
                                    </p>
                                    <div className="flex items-center gap-4 opacity-80 group-hover:opacity-100 transition-opacity mt-auto">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-blis-red transition-colors flex-shrink-0">
                                            {testimonial.image ? (
                                            <img src={testimonial.image} alt={testimonial.author} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                        ) : (
                                            <div className="w-full h-full bg-blis-red/20 flex items-center justify-center">
                                                <span className="text-2xl font-bold text-white/50">{testimonial.author?.charAt(0) || '?'}</span>
                                            </div>
                                        )}
                                        </div>
                                        <div>
                                            <h5 className="text-white font-bold uppercase tracking-wide text-sm leading-tight">{testimonial.author}</h5>
                                            <span className="text-blis-red/80 font-mono text-xs uppercase tracking-widest leading-tight block mt-1">{testimonial.role}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
