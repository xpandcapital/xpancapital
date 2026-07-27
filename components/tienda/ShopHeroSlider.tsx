"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Zap, ArrowRight } from "lucide-react";
import type { ProductDef } from "@/lib/types/shop";

interface ShopHeroSliderProps {
    products?: ProductDef[];
    data?: any;
}

export function ShopHeroSlider({ products }: ShopHeroSliderProps) {
    const banners = useMemo(() => {
        if (products && products.length > 0) {
            return products.slice(0, 5).filter(p => p.title).map((p, i) => ({
                id: i,
                title: p.title,
                subtitle: p.description || p.category || "",
                price: p.price ? `$${p.price.toLocaleString()}` : "",
                bgImage: p.image || "/images/arkadia-1.webp",
                tag: p.category || "Producto",
                accent: "blis-red"
            }));
        }
        return [
            {
                id: 1, title: "Plan Anual", subtitle: "Acceso completo a todos los cursos, herramientas y mentorías por un año.",
                price: "$599/año", bgImage: "/images/arkadia-1.webp", tag: "PLAN ANUAL", accent: "blis-red"
            },
            {
                id: 2, title: "Plan Trimestral", subtitle: "3 meses de acceso completo a cursos, herramientas y comunidad.",
                price: "$199/trimestre", bgImage: "/images/Cumbres-1.webp", tag: "PLAN TRIMESTRAL", accent: "blis-red"
            }
        ];
    }, [products]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0); // 1 for next, -1 for prev

    const next = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, []);

    const prev = useCallback(() => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }, []);

    useEffect(() => {
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [next]);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? "20%" : "-20%",
            opacity: 0,
            scale: 1.05
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            transition: {
                x: { type: "spring" as const, stiffness: 300, damping: 30 },
                opacity: { duration: 0.4 },
                scale: { duration: 0.8, ease: "easeOut" as const }
            }
        },
        exit: (direction: number) => ({
            x: direction < 0 ? "20%" : "-20%",
            opacity: 0,
            scale: 0.95,
            transition: {
                x: { type: "spring" as const, stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 }
            }
        })
    };

    const contentVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.2 + i * 0.1,
                duration: 0.6,
                ease: [0.215, 0.61, 0.355, 1] as const
            }
        })
    };

    return (
        <div className="relative w-full h-[320px] md:h-[400px] lg:h-[480px] rounded-[2rem] overflow-hidden group border border-white/5 shadow-2xl bg-[#050608]">
            <AnimatePresence initial={false} custom={direction} mode="sync">
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0"
                >
                    <Image
                        src={banners[currentIndex].bgImage}
                        alt="Promo Background"
                        fill
                        className="object-cover opacity-70 scale-105"
                        priority
                    />

                    {/* Sophisticated Gradient Mesh */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050608] via-[#050608]/80 to-transparent z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-transparent opacity-90 z-10" />

                    {/* Animated Accent Orb */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                            x: [0, 50, 0],
                            y: [0, -30, 0]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/4 -right-20 w-96 h-96 bg-blis-red/20 blur-[120px] rounded-full z-0"
                    />

                    <div className="absolute inset-0 p-6 md:p-16 lg:p-20 flex flex-col justify-center z-20">
                        <motion.div
                            custom={0}
                            variants={contentVariants}
                            initial="hidden"
                            animate="visible"
                            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white text-[9px] md:text-xs font-black uppercase tracking-[0.3em] px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-4 md:mb-6 w-max backdrop-blur-2xl"
                        >
                            <Zap className="w-3 h-3 text-blis-red fill-blis-red animate-pulse" />
                            <span className="opacity-80">{banners[currentIndex].tag}</span>
                        </motion.div>

                        <motion.h2
                            custom={1}
                            variants={contentVariants}
                            initial="hidden"
                            animate="visible"
                            className="text-[1.5rem] md:text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter mb-4 max-w-2xl leading-[1.15] drop-shadow-2xl line-clamp-3"
                        >
                            {banners[currentIndex].title.includes(':') ? (
                                banners[currentIndex].title.split(':').map((part, i) => (
                                    <span key={i} className={i === 0 ? "text-blis-red" : ""}>
                                        {i === 0 ? part + ': ' : part}
                                    </span>
                                ))
                            ) : (
                                <span>{banners[currentIndex].title}</span>
                            )}
                        </motion.h2>

                        <motion.p
                            custom={2}
                            variants={contentVariants}
                            initial="hidden"
                            animate="visible"
                            className="text-gray-300 text-xs md:text-base font-medium max-w-xl mb-6 md:mb-8 leading-relaxed line-clamp-2"
                        >
                            {banners[currentIndex].subtitle.split(' ').map((word, i) => (
                                <span key={i} className="inline-block mr-1">
                                    {word.toLowerCase().includes('prospección') || word.toLowerCase().includes('financiera') ? (
                                        <span className="relative inline-block">
                                            {word}
                                            <span className="absolute left-0 bottom-0.5 w-full h-0.5 bg-blis-red/60" />
                                        </span>
                                    ) : word}
                                </span>
                            ))}
                        </motion.p>

                        <motion.div
                            custom={3}
                            variants={contentVariants}
                            initial="hidden"
                            animate="visible"
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6"
                        >
                            <button className="group/btn relative overflow-hidden bg-white text-black font-black uppercase tracking-widest px-6 py-4 md:px-10 md:py-5 rounded-2xl transition-all duration-500 hover:pr-14 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)] text-[10px] md:text-sm">
                                <span className="relative z-10 flex items-center gap-2">
                                    Adquirir Licencia <span className="text-blis-red opacity-50 mr-2">|</span> {banners[currentIndex].price}
                                </span>
                                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 opacity-0 group-hover/btn:opacity-100 transition-all duration-300 translate-x-4 group-hover/btn:translate-x-0" />
                                <div className="absolute inset-0 bg-blis-red/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                            </button>

                            <div className="flex flex-col">
                                <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">Certeza Legal</span>
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-[#050608] bg-gray-800 flex items-center justify-center text-[7px] md:text-[8px] font-bold">
                                            IA
                                        </div>
                                    ))}
                                    <div className="px-2 md:px-3 h-6 md:h-8 rounded-full border-2 border-[#050608] bg-blis-red text-[7px] md:text-[8px] font-bold flex items-center justify-center">
                                        +500 VENTAS
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Premium Controls */}
            <div className="absolute right-8 bottom-8 flex items-center gap-4 z-30">
                <div className="flex gap-2">
                    <button
                        onClick={prev}
                        className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-blis-red hover:border-blis-red transition-all backdrop-blur-2xl group/prev active:scale-90"
                    >
                        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={next}
                        className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-blis-red hover:border-blis-red transition-all backdrop-blur-2xl group/next active:scale-90"
                    >
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Minimalist Progress Indicators */}
            <div className="absolute top-8 right-8 flex flex-col gap-3 z-30">
                {banners.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setDirection(idx > currentIndex ? 1 : -1);
                            setCurrentIndex(idx);
                        }}
                        className="relative w-1.5 h-12 bg-white/10 rounded-full overflow-hidden group/dot"
                    >
                        <div className={`absolute inset-0 bg-white/40 transition-opacity duration-500 ${idx === currentIndex ? 'opacity-0' : 'group-hover/dot:opacity-100 opacity-0'}`} />
                        {idx === currentIndex && (
                            <motion.div
                                initial={{ height: "0%" }}
                                animate={{ height: "100%" }}
                                transition={{ duration: 5, ease: "linear" }}
                                className="absolute top-0 left-0 w-full bg-blis-red shadow-[0_0_15px_rgba(213,193,8,0.8)]"
                            />
                        )}
                        {idx < currentIndex && <div className="absolute inset-0 bg-white/60" />}
                    </button>
                ))}
            </div>
        </div>
    );
}


