"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShoppingCart, ChevronLeft, ChevronRight, Loader2, Package } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useLandingCMS } from "@/context/LandingCMSContext";
import { useProducts } from "@/lib/hooks/useProducts";
import Link from "next/link";

export function Catalog() {
    const { cmsData } = useLandingCMS();
    const { products: dbProducts, categories, loading, fetchProducts, fetchCategories } = useProducts();
    const [activeCategoryId, setActiveCategoryId] = useState<string>("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isScrollingRef = useRef(false);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts, fetchCategories]);

    const sortedCategories = [...categories].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

    const visibleCategories = sortedCategories.filter(cat => {
        const count = dbProducts.filter(p => p.categoria_id === cat.id).length;
        if (cat.nombre.toLowerCase().includes('asesor')) return true;
        return count >= 4;
    });

    useEffect(() => {
        if (visibleCategories.length > 0 && !activeCategoryId) {
            setActiveCategoryId(visibleCategories[0].id);
        }
    }, [visibleCategories, activeCategoryId]);

    const activeCategory = visibleCategories.find(c => c.id === activeCategoryId);
    const activeCatIndex = visibleCategories.findIndex(c => c.id === activeCategoryId);

    const nextCategory = useCallback(() => {
        if (visibleCategories.length <= 1) return;
        const nextIdx = (activeCatIndex + 1) % visibleCategories.length;
        setActiveCategoryId(visibleCategories[nextIdx].id);
        setCurrentIndex(0);
        setProgress(0);
    }, [visibleCategories, activeCatIndex]);

    const prevCategory = useCallback(() => {
        if (visibleCategories.length <= 1) return;
        const prevIdx = (activeCatIndex - 1 + visibleCategories.length) % visibleCategories.length;
        setActiveCategoryId(visibleCategories[prevIdx].id);
        setCurrentIndex(0);
        setProgress(0);
    }, [visibleCategories, activeCatIndex]);

    const isAsesoria = activeCategory?.nombre.toLowerCase().includes('asesor');

    const filteredProducts = dbProducts
        .filter(p => {
            if (!activeCategoryId) return true;
            return p.categoria_id === activeCategoryId;
        })
        .slice(0, 8)
        .map(p => ({
            id: p.id,
            slug: p.slug || p.id,
            type: p.categoria?.nombre || activeCategory?.nombre || 'Producto',
            name: p.nombre,
            price: `$${p.precio_usd || 0}`,
            image: p.imagen_principal || ''
        }));

    const displayProducts = filteredProducts;
    const baseItems = [...displayProducts, { id: "cta", isCTA: true }];
    const totalBaseItems = baseItems.length;
    const displayItems = [...baseItems, ...baseItems, ...baseItems];

    const syncIndexOnScroll = () => {
        if (!scrollContainerRef.current || isScrollingRef.current) return;
        const container = scrollContainerRef.current;
        const scrollLeft = container.scrollLeft;
        const cardElement = container.querySelector('[data-card]') as HTMLElement;
        if (cardElement) {
            const width = cardElement.offsetWidth + 24;
            const internalIndex = Math.round(scrollLeft / width);
            const activeIdx = internalIndex % totalBaseItems;
            if (activeIdx !== currentIndex) {
                setCurrentIndex(activeIdx);
                setProgress(0);
            }
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
            const width = cardElement.offsetWidth + 24;
            const targetIndex = Math.round(container.scrollLeft / width) + 1;
            container.scrollTo({ left: targetIndex * width, behavior: "smooth" });
            setCurrentIndex(targetIndex % totalBaseItems);
            setProgress(0);
            setTimeout(() => {
                isScrollingRef.current = false;
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
            const width = cardElement.offsetWidth + 24;
            const targetIndex = Math.round(container.scrollLeft / width) - 1;
            container.scrollTo({ left: targetIndex * width, behavior: "smooth" });
            setCurrentIndex((targetIndex % totalBaseItems + totalBaseItems) % totalBaseItems);
            setProgress(0);
            setTimeout(() => {
                isScrollingRef.current = false;
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
            const width = cardElement.offsetWidth + 24;
            const targetIndex = totalBaseItems + index;
            container.scrollTo({ left: targetIndex * width, behavior: "smooth" });
            setCurrentIndex(index);
            setProgress(0);
            setTimeout(() => { isScrollingRef.current = false; }, 500);
        }
    };

    useEffect(() => {
        if (scrollContainerRef.current && !isAsesoria) {
            const container = scrollContainerRef.current;
            const timer = setTimeout(() => {
                const cardElement = container.querySelector('[data-card]') as HTMLElement;
                if (cardElement) {
                    const width = cardElement.offsetWidth + 24;
                    container.scrollLeft = totalBaseItems * width;
                    setCurrentIndex(0);
                }
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [activeCategoryId, isAsesoria]);

    const [isInView, setIsInView] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIsInView(entry.isIntersecting),
            { threshold: 0.1 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    // Auto-scroll entre CATEGORIAS (no entre productos)
    const catBarRef = useRef<HTMLDivElement>(null);
    const catScrollHeight = 4500; // ms por categoría

    useEffect(() => {
        if (!isInView || visibleCategories.length <= 1) return;
        const refreshRate = 50;
        const step = (refreshRate / catScrollHeight) * 100;
        timerRef.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    nextCategory();
                    return 0;
                }
                return prev + step;
            });
        }, refreshRate);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isInView, activeCategoryId, visibleCategories]);

    const hasProducts = dbProducts.length > 0;

    if (loading) {
        return (
            <section ref={sectionRef} className="pt-10 md:pt-20 pb-24 bg-black relative">
                <div className="container mx-auto px-6 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blis-red mx-auto" />
                </div>
            </section>
        );
    }

    if (!hasProducts && !loading) {
        return (
            <section ref={sectionRef} className="pt-10 md:pt-20 pb-24 bg-black relative">
                <div className="container mx-auto px-6 flex flex-col items-center justify-center h-[400px]">
                    <Package className="w-16 h-16 text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No hay productos disponibles</h3>
                    <p className="text-gray-500 text-center">Los productos se cargarán próximamente.</p>
                </div>
            </section>
        );
    }

    const CtaCard = () => (
        <motion.a
            key="cta-static"
            href="/tienda"
            className="md:min-w-[380px] md:max-w-[380px] rounded-2xl overflow-hidden relative group border-2 border-dashed border-blis-red/20 bg-gradient-to-br from-blis-red/5 via-transparent to-transparent hover:border-blis-red/40 transition-all duration-500 flex flex-col items-center justify-center text-center p-6 md:p-12 h-full"
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
    );

    const ProductCard = ({ item, idx }: { item: any; idx: number }) => (
        <Link
            key={`${item.id}-${idx}`}
            href={`/tienda/producto/${item.slug || item.id}`}
            data-card
            className={`min-w-[260px] w-[75vw] md:w-auto md:min-w-[380px] max-h-[60vh] md:max-h-none glass-card transition-all duration-500 rounded-2xl overflow-hidden relative group snap-center snap-always border border-white/5 block flex-shrink-0 ${currentIndex === (idx % totalBaseItems) ? "ring-2 ring-blis-red/40 opacity-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)]" : "opacity-50 grayscale-[0.5] hover:opacity-100 hover:grayscale-0"}`}
        >
            <div className="aspect-square w-full relative overflow-hidden bg-black border-b border-white/5">
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
    );

    // Asesoría: layout horizontal (imagen izq, texto der) + CTA
    const RenderAsesoria = () => {
        if (filteredProducts.length === 0) return null;
        const item = filteredProducts[0];
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeCategoryId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch"
                >
                    {/* Producto horizontal */}
                    <Link
                        href={`/tienda/producto/${item.slug || item.id}`}
                        className="flex-1 glass-card rounded-2xl overflow-hidden border border-white/5 group flex flex-col md:flex-row"
                    >
                        <div className="w-full md:w-[45%] aspect-video md:aspect-auto relative overflow-hidden flex-shrink-0">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                                style={{ backgroundImage: `url('${item.image}')` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/40" />
                        </div>
                        <div className="flex-1 p-4 md:p-8 flex flex-col justify-between">
                            <div>
                                <div className="mb-2 md:mb-4">
                                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-white bg-blis-red/20 backdrop-blur-md px-2 py-1 md:px-3 md:py-1.5 rounded-md border border-white/10 shadow-[0_0_15px_rgba(190,11,60,0.1)]">
                                        {item.type}
                                    </span>
                                </div>
                                <h4 className="text-lg md:text-2xl font-black text-white uppercase mb-2 md:mb-4 leading-tight group-hover:text-blis-red transition-colors tracking-tight">
                                    {item.name}
                                </h4>
                            </div>
                            <div className="flex items-center justify-between border-t border-white/5 pt-3 md:pt-6 mt-2">
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
                    {/* CTA Card al lado */}
                    <div className="md:w-[380px] md:min-w-[320px]">
                        <CtaCard />
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    };

    return (
        <section ref={sectionRef} className="pt-10 md:pt-20 pb-24 bg-black relative">
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
                        <div
                            ref={catBarRef}
                            className="flex bg-white/5 p-0.5 rounded-full border border-white/10 overflow-x-auto hide-scrollbar w-full sm:w-auto max-w-full"
                        >
                            {visibleCategories.map(cat => {
                                const isActive = activeCategoryId === cat.id;
                                const count = dbProducts.filter(p => p.categoria_id === cat.id).length;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => { setActiveCategoryId(cat.id); setCurrentIndex(0); setProgress(0); }}
                                        className={`flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 rounded-full text-[9px] md:text-xs font-black uppercase transition-all tracking-widest whitespace-nowrap flex-shrink-0 ${isActive ? "bg-white text-black shadow-lg" : "text-gray-400 hover:text-white"}`}
                                    >
                                        {cat.nombre}
                                        {count > 0 && (
                                            <span className={`text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-black/10" : "bg-white/10"}`}>
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Arrows navegan entre categorías */}
                        <div className="hidden md:flex gap-2 flex-shrink-0">
                            <button
                                onClick={prevCategory}
                                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors group bg-zinc-900/50 backdrop-blur-sm"
                            >
                                <ChevronLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={nextCategory}
                                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors group bg-zinc-900/50 backdrop-blur-sm"
                            >
                                <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contenido según categoría */}
                {displayProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px]">
                        <Package className="w-12 h-12 text-gray-600 mb-3" />
                        <p className="text-gray-500 text-sm">No hay productos en esta categoría aún.</p>
                    </div>
                ) : isAsesoria && filteredProducts.length <= 1 ? (
                    <RenderAsesoria />
                ) : (
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
                                    <div key={`cta-${idx}`} data-card className="md:min-w-[380px] min-w-[260px] w-[75vw] snap-center snap-always flex-shrink-0">
                                        <CtaCard />
                                    </div>
                                ) : (
                                    <ProductCard key={`${item.id}-${idx}`} item={item} idx={idx} />
                                )
                            ))}
                        </div>

                        {/* Mobile Arrows */}
                        <div className="absolute top-[35%] -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none px-4 z-20 md:hidden">
                            <button onClick={prevCategory} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center pointer-events-auto active:scale-90 transition-transform shadow-lg">
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                            <button onClick={nextCategory} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center pointer-events-auto active:scale-90 transition-transform shadow-lg">
                                <ChevronRight className="w-6 h-6 text-white" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Progress dots por categoría */}
                <div className="flex justify-center items-center gap-3 md:gap-4 mt-6 md:mt-12">
                    {visibleCategories.map((cat, i) => (
                        <button
                            key={cat.id}
                            onClick={() => { setActiveCategoryId(cat.id); setCurrentIndex(0); setProgress(0); }}
                            className="group relative h-1.5 transition-all duration-700 outline-none"
                            style={{ width: activeCatIndex === i ? "80px" : "24px" }}
                        >
                            <div className={`absolute inset-0 rounded-full transition-all duration-300 ${activeCatIndex === i ? "bg-white/10" : "bg-white/5 group-hover:bg-white/20"}`} />
                            {activeCatIndex === i && (
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
