"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShoppingCart, BookOpen, ChevronLeft, ChevronRight, Loader2, Package } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLandingCMS } from "@/context/LandingCMSContext";
import { useProducts } from "@/lib/hooks/useProducts";
import Link from "next/link";

export function Catalog() {
    const { cmsData } = useLandingCMS();
    const { products: dbProducts, categories, loading, fetchProducts, fetchCategories } = useProducts();
    const [activeTab, setActiveTab] = useState<"courses" | "shop">("courses");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isScrollingRef = useRef(false);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts, fetchCategories]);

    const coursesFromDb = dbProducts
        .filter(p => p.tipo === 'servicio' || p.tipo === 'digital')
        .slice(0, 8)
        .map(p => ({
            id: p.id,
            slug: p.slug || p.id,
            type: p.categoria?.nombre || 'Curso Pro',
            name: p.nombre,
            price: `$${p.precio_usd || 0}`,
            image: p.imagen_principal || ''
        }));

    const shopFromDb = dbProducts
        .filter(p => p.tipo === 'fisico' || p.tipo === 'suscripcion')
        .slice(0, 8)
        .map(p => ({
            id: p.id,
            slug: p.slug || p.id,
            type: p.categoria?.nombre || 'Kit',
            name: p.nombre,
            price: `$${p.precio_usd || 0}`,
            image: p.imagen_principal || ''
        }));

    const coursesData = coursesFromDb;
    const shopProductsData = shopFromDb;

    const displayProducts = activeTab === "courses" ? coursesData : shopProductsData;
    const baseItems = [...displayProducts, { id: "cta", isCTA: true }];
    const totalBaseItems = baseItems.length;
    const displayItems = [...baseItems, ...baseItems, ...baseItems];

    // Handle scroll to sync indicators
    const syncIndexOnScroll = () => {
        if (!scrollContainerRef.current || isScrollingRef.current) return;

        const container = scrollContainerRef.current;
        const scrollLeft = container.scrollLeft;
        const cardElement = container.querySelector('[data-card]') as HTMLElement;

        if (cardElement) {
            const width = cardElement.offsetWidth + (activeTab === "courses" ? 16 : 24); // responsive gap
            const internalIndex = Math.round(scrollLeft / width);
            const activeIdx = internalIndex % totalBaseItems;

            if (activeIdx !== currentIndex) {
                setCurrentIndex(activeIdx);
                setProgress(0);
            }

            // Infinite loop jump
            if (internalIndex < totalBaseItems) {
                container.scrollLeft = scrollLeft + (totalBaseItems * width);
            } else if (internalIndex >= totalBaseItems * 2) {
                container.scrollLeft = scrollLeft - (totalBaseItems * width);
            }
        }
    };

    const handleNext = () => {
        if (!scrollContainerRef.current) return;
        isScrollingRef.current = true;
        const container = scrollContainerRef.current;
        const cardElement = container.querySelector('[data-card]') as HTMLElement;
        if (cardElement) {
            const width = cardElement.offsetWidth + (activeTab === "courses" ? 16 : 24);
            const targetIndex = Math.round(container.scrollLeft / width) + 1;

            container.scrollTo({
                left: targetIndex * width,
                behavior: "smooth"
            });

            setCurrentIndex(targetIndex % totalBaseItems);
            setProgress(0);

            setTimeout(() => {
                isScrollingRef.current = false;
                // If we reached the end set, jump back to middle set silently
                if (targetIndex >= totalBaseItems * 2) {
                    container.scrollLeft = container.scrollLeft - (totalBaseItems * width);
                }
            }, 500);
        }
    };

    const handlePrev = () => {
        if (!scrollContainerRef.current) return;
        isScrollingRef.current = true;
        const container = scrollContainerRef.current;
        const cardElement = container.querySelector('[data-card]') as HTMLElement;
        if (cardElement) {
            const width = cardElement.offsetWidth + (activeTab === "courses" ? 16 : 24);
            const targetIndex = Math.round(container.scrollLeft / width) - 1;

            container.scrollTo({
                left: targetIndex * width,
                behavior: "smooth"
            });

            setCurrentIndex((targetIndex % totalBaseItems + totalBaseItems) % totalBaseItems);
            setProgress(0);

            setTimeout(() => {
                isScrollingRef.current = false;
                // If we reached the start set, jump forward to middle set silently
                if (targetIndex < totalBaseItems) {
                    container.scrollLeft = container.scrollLeft + (totalBaseItems * width);
                }
            }, 500);
        }
    };

    const resetToIndex = (index: number) => {
        if (!scrollContainerRef.current) return;
        isScrollingRef.current = true;
        const container = scrollContainerRef.current;
        const cardElement = container.querySelector('[data-card]') as HTMLElement;
        if (cardElement) {
            const width = cardElement.offsetWidth + (activeTab === "courses" ? 16 : 24);
            // Move to the middle set (totalBaseItems + index)
            const targetIndex = totalBaseItems + index;

            container.scrollTo({
                left: targetIndex * width,
                behavior: "smooth"
            });

            setCurrentIndex(index);
            setProgress(0);

            setTimeout(() => {
                isScrollingRef.current = false;
            }, 500);
        }
    };

    const [isInView, setIsInView] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    // Track visibility for autoplay pausing
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.isIntersecting);
                if (entry.isIntersecting && progress === 0 && currentIndex === 0) {
                    // Force a small delay to ensure everything is painted
                    setTimeout(() => resetToIndex(0), 100);
                }
            },
            { threshold: 0.1 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    // Auto-play timer
    useEffect(() => {
        if (!isInView) return;

        const interval = 4000;
        const refreshRate = 50;
        const step = (refreshRate / interval) * 100;

        timerRef.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    handleNext();
                    return 0;
                }
                return prev + step;
            });
        }, refreshRate);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [currentIndex, activeTab, isInView]); // Restart timer on navigation or visibility change

    // Sync scroll position when activeTab changes or on mount
    useEffect(() => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            // Immediate jump to middle set on tab change or mount
            const timer = setTimeout(() => {
                const cardElement = container.querySelector('[data-card]') as HTMLElement;
                if (cardElement) {
                    const width = cardElement.offsetWidth + (activeTab === "courses" ? 16 : 24);
                    container.scrollLeft = totalBaseItems * width;
                    setCurrentIndex(0);
                }
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [activeTab]);

    // Show empty state if no products
    if (loading) {
        return (
            <section ref={sectionRef} className="pt-10 md:pt-20 pb-24 bg-zinc-950 relative">
                <div className="container mx-auto px-6 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blis-red mx-auto" />
                </div>
            </section>
        );
    }

    if (coursesData.length === 0 && shopProductsData.length === 0) {
        return (
            <section ref={sectionRef} className="pt-10 md:pt-20 pb-24 bg-zinc-950 relative">
                <div className="container mx-auto px-6 flex flex-col items-center justify-center h-[400px]">
                    <Package className="w-16 h-16 text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No hay productos disponibles</h3>
                    <p className="text-gray-500 text-center">Los productos se cargarán próximamente.</p>
                </div>
            </section>
        );
    }

    return (
        <section ref={sectionRef} className="pt-10 md:pt-20 pb-24 bg-zinc-950 relative">
            <div className="container mx-auto px-6 relative flex flex-col justify-center h-full max-h-[900px]">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-4 md:mb-8 gap-4 md:gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-center md:text-left"
                    >
                        <h2 className="text-[10px] md:text-sm font-bold tracking-[0.2em] text-gray-500 uppercase mb-0.5 md:mb-1">{cmsData.catalog.title}</h2>
                        <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wide leading-none">
                            {cmsData.catalog.subtitle}
                        </h3>
                    </motion.div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="flex bg-white/5 p-0.5 rounded-full border border-white/10 w-full sm:w-auto overflow-hidden">
                            <button
                                onClick={() => { setActiveTab("courses"); resetToIndex(0); }}
                                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-[9px] md:text-xs font-black uppercase transition-all tracking-widest flex-1 sm:flex-none ${activeTab === "courses" ? "bg-white text-black shadow-lg" : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4" /> Cursos
                            </button>
                            <button
                                onClick={() => { setActiveTab("shop"); resetToIndex(0); }}
                                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-[9px] md:text-xs font-black uppercase transition-all tracking-widest flex-1 sm:flex-none ${activeTab === "shop" ? "bg-blis-red text-white shadow-lg" : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                <ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform group-hover:scale-110" /> Kits
                            </button>
                        </div>

                        {/* Arrows - Desktop Only */}
                        <div className="hidden md:flex gap-2">
                            <button
                                onClick={handlePrev}
                                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors group bg-zinc-900/50 backdrop-blur-sm"
                            >
                                <ChevronLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors group bg-zinc-900/50 backdrop-blur-sm"
                            >
                                <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="relative group/slider">
                    <div
                        ref={scrollContainerRef}
                        onScroll={syncIndexOnScroll}
                        className="flex gap-4 md:gap-6 overflow-x-auto pb-8 hide-scrollbar snap-x snap-mandatory px-6 md:px-0 -mx-6 md:mx-0"
                    >
                        <style jsx global>{`
                        .hide-scrollbar::-webkit-scrollbar { display: none; }
                        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    `}</style>

                        {displayItems.map((item: any, idx: number) => (
                            'isCTA' in item ? (
                                <motion.a
                                    key={`cta-${idx}`}
                                    href="/tienda"
                                    data-card
                                    className={`min-w-[260px] w-[75vw] md:w-auto md:min-w-[380px] rounded-2xl overflow-hidden relative group snap-center snap-always border-2 border-dashed border-blis-red/20 bg-gradient-to-br from-blis-red/5 via-transparent to-transparent hover:border-blis-red/40 transition-all duration-500 flex flex-col items-center justify-center text-center p-6 md:p-12 ${currentIndex === (idx % totalBaseItems) ? "opacity-100 ring-2 ring-blis-red/40 shadow-[0_20px_50px_rgba(190,11,60,0.2)]" : "opacity-40 scale-95"}`}
                                >
                                    <div className="w-14 h-14 md:w-24 md:h-24 rounded-full bg-blis-red/10 border border-blis-red/20 flex items-center justify-center mb-3 md:mb-8 shadow-[0_0_50px_rgba(190,11,60,0.1)] group-hover:bg-blis-red transition-all duration-500">
                                        <ShoppingCart className="text-blis-red group-hover:text-white w-7 h-7 md:w-10 md:h-10 transition-colors" />
                                    </div>
                                    <h4 className="text-xl md:text-3xl font-black text-white uppercase mb-1 md:mb-4 tracking-tighter">Explora la Tienda</h4>
                                    <p className="text-gray-400 text-xs md:text-base font-medium mb-5 md:mb-10 max-w-[200px]">Accede a más de 50 herramientas exclusivas.</p>
                                    <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest bg-blis-red px-6 md:px-10 py-3.5 md:py-5 rounded-full shadow-[0_10px_30px_rgba(190,11,60,0.3)] group-hover:shadow-blis-red/50 transition-all active:scale-95">
                                        Tienda Completa <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </div>
                                </motion.a>
                            ) : (
                                <Link
                                    key={`${item.id}-${idx}`}
                                    href={`/tienda/producto/${item.slug || item.id}`}
                                    data-card
                                    className={`min-w-[260px] w-[75vw] md:w-auto md:min-w-[380px] max-h-[60vh] md:max-h-none glass-card transition-all duration-500 rounded-2xl overflow-hidden relative group snap-center snap-always border border-white/5 block ${currentIndex === (idx % totalBaseItems) ? "ring-2 ring-blis-red/40 opacity-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)]" : "opacity-50 grayscale-[0.5] hover:opacity-100 hover:grayscale-0"}`}
                                >
                                    <div className="aspect-square w-full relative overflow-hidden bg-zinc-900 border-b border-white/5">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                                            style={{ backgroundImage: `url('${item.image}')` }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                                    </div>

                                    <div className="p-4 md:p-8">
                                        <div className="mb-2 md:mb-4">
                                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-white bg-blis-red/20 backdrop-blur-md px-2 py-1 md:px-3 md:py-1.5 rounded-md border border-white/10 shadow-[0_0_15px_rgba(190,11,60,0.1)]">
                                                {item.type}
                                            </span>
                                        </div>

                                        <h4 className="text-lg md:text-2xl font-black text-white uppercase mb-3 md:mb-6 leading-tight group-hover:text-blis-red transition-colors line-clamp-2 h-[2.8rem] md:h-[4rem] tracking-tight">
                                            {item.name}
                                        </h4>

                                        <div className="flex items-center justify-between border-t border-white/5 pt-3 md:pt-6 mt-1 md:mt-2">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] md:text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-0.5 md:mb-1">Precio</span>
                                                <span className="text-lg md:text-2xl font-black text-white">{item.price}</span>
                                            </div>
                                            <span className="flex items-center gap-1.5 md:gap-3 px-3.5 md:px-6 py-2 md:py-3 rounded-full bg-white/5 group-hover:bg-blis-red text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest transition-all shadow-lg">
                                                Ver Detalles <ArrowRight className="w-3 md:w-4 h-3 md:h-4" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        ))}
                    </div>

                    {/* Mobile Arrows Overlay */}
                    <div className="absolute top-[35%] -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none px-4 z-20 md:hidden">
                        <button
                            onClick={handlePrev}
                            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center pointer-events-auto active:scale-90 transition-transform shadow-lg"
                        >
                            <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center pointer-events-auto active:scale-90 transition-transform shadow-lg"
                        >
                            <ChevronRight className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center items-center gap-3 md:gap-4 mt-6 md:mt-12">
                    {Array.from({ length: totalBaseItems }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => resetToIndex(i)}
                            className="group relative h-1.5 transition-all duration-700 outline-none"
                            style={{ width: currentIndex === i ? "100px" : "24px" }}
                        >
                            <div className={`absolute inset-0 rounded-full transition-all duration-300 ${currentIndex === i ? "bg-white/10" : "bg-white/5 group-hover:bg-white/20"}`} />
                            {currentIndex === i && (
                                <motion.div
                                    className="absolute inset-0 bg-blis-red rounded-full shadow-[0_0_20px_rgba(190,11,60,0.6)]"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.1, ease: "linear" }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
