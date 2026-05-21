"use client";

import { motion, useMotionValue, useAnimationFrame } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { useLandingCMS } from "@/context/LandingCMSContext";

const floatingIcons = [
    { icon: Quote, style: "top-10 left-10 text-white/5", size: "w-20 h-20", delay: 0 },
    { icon: Star, style: "bottom-20 right-16 text-blis-red/10", size: "w-12 h-12", delay: 1.5 },
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

    const [isPaused, setIsPaused] = useState(false);
    const [mobileIndex, setMobileIndex] = useState(0);
    const x = useMotionValue(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const speedRef = useRef(0.6);

    // Marquee continua — pausa con hover/tap
    useAnimationFrame(() => {
        if (isPaused) return;
        const currentX = x.get();
        const nextX = currentX - speedRef.current;
        // Cuando se ha desplazado media tira, reiniciamos (loop infinito)
        if (nextX <= -50) {
            x.set(nextX + 50);
        } else {
            x.set(nextX);
        }
    });

    if (!testimonials || testimonials.length === 0) return null;

    // Duplicamos para loop infinito
    const doubled = [...testimonials, ...testimonials];

    const handleMobileTap = useCallback(() => {
        setIsPaused(p => !p);
    }, []);

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

                    {/* Pause indicator */}
                    <div className="flex items-center gap-3">
                        {isPaused && (
                            <span className="text-[10px] uppercase text-blis-red/60 tracking-widest font-mono animate-pulse">
                                ⏸ Pausado
                            </span>
                        )}
                    </div>
                </div>

                {/* ====== MOBILE: tarjeta única + navegación táctil ====== */}
                <div className="block md:hidden">
                    <motion.div
                        key={mobileIndex}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        onClick={handleMobileTap}
                        className="glass-card rounded-2xl p-6 relative border border-white/8 bg-black/60 cursor-pointer select-none min-h-[380px] flex flex-col justify-between"
                    >
                        <Quote className="w-8 h-8 text-white/5 absolute top-4 right-4" />
                        <NeonStars />
                        <p className="text-gray-300 font-light italic leading-relaxed mb-6 text-sm relative z-10">
                            &ldquo;{testimonials[mobileIndex % testimonials.length].quote}&rdquo;
                        </p>
                        <div className="flex flex-col items-center">
                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/15 mb-3">
                                {testimonials[mobileIndex % testimonials.length].image ? (
                                    <img
                                        src={testimonials[mobileIndex % testimonials.length].image}
                                        alt={testimonials[mobileIndex % testimonials.length].author}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-blis-red/20 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-white/50">{testimonials[mobileIndex % testimonials.length].author?.charAt(0) || '?'}</span>
                                    </div>
                                )}
                            </div>
                            <h5 className="text-white font-bold uppercase tracking-wide text-sm">{testimonials[mobileIndex % testimonials.length].author}</h5>
                            <span className="text-blis-red/80 font-mono text-xs uppercase tracking-widest mt-0.5">{testimonials[mobileIndex % testimonials.length].role}</span>
                        </div>
                    </motion.div>

                    {/* Mobile dots */}
                    <div className="flex justify-center gap-1.5 mt-6">
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => { setMobileIndex(i); setIsPaused(false); }}
                                className="transition-all duration-300"
                            >
                                <div className={`rounded-full transition-all duration-300 ${i === (mobileIndex % testimonials.length) ? 'w-5 h-2 bg-blis-red shadow-[0_0_6px_rgba(190,11,60,0.8)]' : 'w-2 h-2 bg-white/20'}`} />
                            </button>
                        ))}
                    </div>
                    <p className="text-center text-[10px] font-mono text-blis-red/50 uppercase tracking-widest mt-3 md:hidden">
                        Toca para {isPaused ? 'reanudar' : 'pausar'}
                    </p>
                </div>

                {/* ====== DESKTOP: marquee infinito ====== */}
                <div
                    ref={containerRef}
                    className="hidden md:block relative overflow-hidden"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <motion.div
                        style={{ x }}
                        className="flex gap-8"
                    >
                        {doubled.map((testimonial, idx) => (
                            <div
                                key={idx}
                                className="glass-card rounded-2xl p-8 relative flex-shrink-0 antigravity group hover:border-white/20 transition-all border-t border-white/5 bg-black/60 hover:bg-black/80"
                                style={{ width: "calc(33.33% - 1.35rem)" }}
                            >
                                <Quote className="w-10 h-10 text-white/5 absolute top-6 right-6 group-hover:text-blis-red/20 transition-colors" />
                                <div className="flex gap-1 mb-3">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} className="w-3.5 h-3.5 fill-blis-red text-blis-red drop-shadow-[0_0_4px_rgba(190,11,60,0.7)]" />
                                    ))}
                                </div>
                                <p className="text-gray-300 font-light italic leading-relaxed mb-8 relative z-10">
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
                </div>
            </div>
        </section>
    );
}
