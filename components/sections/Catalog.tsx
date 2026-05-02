"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShoppingCart, Star, ChevronLeft, ChevronRight, Loader2, Package } from "lucide-react";
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
        if (visibleCategories.length > 0) {
            const isActiveVisible = visibleCategories.some(c => c.id === activeCategoryId);
            if (!isActiveVisible) {
                setActiveCategoryId(visibleCategories[0].id);
                setCurrentIndex(0);
            }
        }
    }, [visibleCategories, activeCategoryId]);

    const activeCategory = visibleCategories.find(c => c.id === activeCategoryId);
    const activeCatIndex = visibleCategories.findIndex(c => c.id === activeCategoryId);

    const nextCategory = useCallback(() => {
        if (visibleCategories.length <= 1) return;
        const nextIdx = (activeCatIndex + 1) % visibleCategories.length;
        setActiveCategoryId(visibleCategories[nextIdx].id);
        setCurrentIndex(0);
    }, [visibleCategories, activeCatIndex]);

    const prevCategory = useCallback(() => {
        if (visibleCategories.length <= 1) return;
        const prevIdx = (activeCatIndex - 1 + visibleCategories.length) % visibleCategories.length;
        setActiveCategoryId(visibleCategories[prevIdx].id);
        setCurrentIndex(0);
    }, [visibleCategories, activeCatIndex]);

    const isAsesoria = activeCategory?.nombre.toLowerCase().includes('asesor');

    const rawProducts = dbProducts.filter(p => {
        if (!activeCategoryId) return true;
        return p.categoria_id === activeCategoryId;
    });

    const filteredProducts = rawProducts.slice(0, 4).map(p => ({
        id: p.id,
        slug: p.slug || p.id,
        type: p.categoria?.nombre || activeCategory?.nombre || 'Producto',
        name: p.nombre,
        price: `$${p.precio_usd || 0}`,
        image: p.imagen_principal || '',
        bliscoins: p.precio_coins || 0,
        rating: ((p.id.charCodeAt(0) % 10) / 20 + 4.3).toFixed(1),
        reviews: (p.id.charCodeAt(1) % 200) + 50,
    }));

    const displayProducts = filteredProducts;
    const displayItems = displayProducts;

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

    // Auto-scroll entre categorías con progreso por categoría
    const catScrollMs = 4500;
    useEffect(() => {
        if (!isInView || visibleCategories.length <= 1) return;
        const refreshRate = 50;
        const step = (refreshRate / catScrollMs) * 100;
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
    }, [isInView, activeCategoryId, visibleCategories, nextCategory]);

    // Reset scroll al cambiar categoría
    useEffect(() => {
        setProgress(0);
        if (scrollContainerRef.current && !isAsesoria && displayProducts.length > 0) {
            const container = scrollContainerRef.current;
            container.scrollLeft = 0;
            setCurrentIndex(0);
        }
    }, [activeCategoryId]);

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

    return (
        <section ref={sectionRef} id="catalog" className="pt-10 md:pt-20 pb-24 bg-black relative">
            <div className="container mx-auto px-6 relative flex flex-col justify-center h-full max-h-[900px]">
                {/* Header + Tabs */}
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
                        <div className="flex bg-white/5 p-0.5 rounded-full border border-white/10 overflow-x-auto hide-scrollbar w-full sm:w-auto max-w-full">
                            {visibleCategories.map(cat => {
                                const isActive = activeCategoryId === cat.id;
                                const count = dbProducts.filter(p => p.categoria_id === cat.id).length;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => { setActiveCategoryId(cat.id); setCurrentIndex(0); }}
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

                        <div className="hidden md:flex gap-2 flex-shrink-0">
                            <button onClick={prevCategory} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors group bg-zinc-900/50 backdrop-blur-sm">
                                <ChevronLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <button onClick={nextCategory} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors group bg-zinc-900/50 backdrop-blur-sm">
                                <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {displayProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px]">
                        <Package className="w-12 h-12 text-gray-600 mb-3" />
                        <p className="text-gray-500 text-sm">No hay productos en esta categoría aún.</p>
                    </div>
                ) : isAsesoria && rawProducts.length <= 1 ? (
                    /* Asesoría: layout horizontal (imagen izq, texto der) + CTA */
                    <div key={activeCategoryId} className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch">
                        {/* Producto horizontal */}
                        <Link
                            href={`/tienda/producto/${filteredProducts[0].slug || filteredProducts[0].id}`}
                            className="flex-1 glass-card rounded-2xl overflow-hidden border border-white/5 group flex flex-col md:flex-row min-h-[320px]"
                        >
                            <div className="w-full md:w-[45%] aspect-video md:aspect-auto relative overflow-hidden flex-shrink-0 min-h-[180px]">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                                    style={{ backgroundImage: `url('${filteredProducts[0].image}')` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 via-transparent to-transparent md:from-transparent md:to-black/40" />
                            </div>
                            <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                                <div>
                                    <span className="inline-block text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-blis-red bg-blis-red/10 px-2 py-0.5 rounded mb-2">
                                        {filteredProducts[0].type}
                                    </span>
                                    <div className="flex items-center gap-1 mb-1.5">
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-3 h-3 ${star <= Math.round(Number(filteredProducts[0].rating)) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-bold text-amber-400">{filteredProducts[0].rating}</span>
                                        <span className="text-[10px] text-gray-500">({filteredProducts[0].reviews})</span>
                                    </div>
                                    <h4 className="text-lg md:text-2xl font-black text-white uppercase mb-2 md:mb-4 leading-tight group-hover:text-blis-red transition-colors tracking-tight">
                                        {filteredProducts[0].name}
                                    </h4>
                                </div>
                                <div className="flex items-end justify-between border-t border-white/5 pt-3 mt-2">
                                    <div>
                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Desde</span>
                                        <div className="flex items-baseline gap-1.5 mb-0.5">
                                            <span className="text-base font-black text-emerald-400">⚡{filteredProducts[0].bliscoins}</span>
                                            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">BlisCoins</span>
                                        </div>
                                        <span className="text-lg font-black text-white">{filteredProducts[0].price}</span>
                                    </div>
                                    <span className="flex items-center gap-1.5 px-3.5 md:px-5 py-2 rounded-full bg-white/5 group-hover:bg-blis-red text-[9px] font-black text-white uppercase tracking-widest transition-all shadow-lg">
                                        Ver Detalles <ArrowRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                        {/* CTA al lado */}
                        <Link
                            href="/tienda"
                            className="md:w-[380px] md:min-w-[320px] w-full rounded-2xl overflow-hidden relative group border-2 border-dashed border-blis-red/20 bg-gradient-to-br from-blis-red/5 via-transparent to-transparent hover:border-blis-red/40 transition-all duration-500 flex flex-col items-center justify-center text-center p-8 md:p-12 min-h-[320px]"
                        >
                            <div className="w-14 h-14 md:w-24 md:h-24 rounded-full bg-blis-red/10 border border-blis-red/20 flex items-center justify-center mb-3 md:mb-8 shadow-[0_0_50px_rgba(190,11,60,0.1)] group-hover:bg-blis-red transition-all duration-500">
                                <ShoppingCart className="text-blis-red group-hover:text-white w-7 h-7 md:w-10 md:h-10 transition-colors" />
                            </div>
                            <h4 className="text-xl md:text-3xl font-black text-white uppercase mb-1 md:mb-4 tracking-tighter">Explora la Tienda</h4>
                            <p className="text-gray-400 text-xs md:text-base font-medium mb-5 md:mb-10 max-w-[200px]">Accede a más de 50 herramientas exclusivas.</p>
                            <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest bg-blis-red px-6 md:px-10 py-3.5 md:py-5 rounded-full shadow-[0_10px_30px_rgba(190,11,60,0.3)] group-hover:shadow-blis-red/50 transition-all active:scale-95">
                                Tienda Completa <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </div>
                        </Link>
                    </div>
                ) : (
                    /* Productos + CTA separada siempre visible */
                    <div className="flex flex-col gap-4 md:gap-6">
                        {/* Productos - scrollable en móvil, sin overflow en desktop */}
                        <div
                            ref={scrollContainerRef}
                            className="flex gap-3 md:gap-4 overflow-x-auto md:overflow-visible pb-2 hide-scrollbar snap-x px-2 md:px-0 md:justify-center"
                        >
                            <style jsx global>{`
                            .hide-scrollbar::-webkit-scrollbar { display: none; }
                            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                        `}</style>
                            {displayItems.map((item: any, idx: number) => (
                                    <Link
                                        key={`${item.id}-${idx}`}
                                        href={`/tienda/producto/${item.slug || item.id}`}
                                        className={`w-[280px] sm:w-[280px] md:w-[280px] lg:w-[300px] xl:w-[290px] glass-card transition-all duration-500 rounded-2xl overflow-hidden relative group snap-center border border-white/5 block flex-shrink-0 opacity-100`}
                                    >
                                        <div className="aspect-square w-full relative overflow-hidden bg-black">
                                            <div
                                                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                                                style={{ backgroundImage: `url('${item.image}')` }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                        </div>
                                        <div className="p-3 md:p-4">
                                            <span className="inline-block text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-blis-red bg-blis-red/10 px-2 py-0.5 rounded mb-2">
                                                {item.type}
                                            </span>

                                            <div className="flex items-center gap-1 mb-1.5">
                                                <div className="flex items-center gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`w-3 h-3 ${star <= Math.round(Number(item.rating)) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-bold text-amber-400">{item.rating}</span>
                                                <span className="text-[10px] text-gray-500">({item.reviews})</span>
                                            </div>

                                            <h4 className="text-sm md:text-[15px] font-bold text-white leading-tight group-hover:text-blis-red transition-colors line-clamp-2 h-[2.4rem] tracking-tight">
                                                {item.name}
                                            </h4>

                                            <div className="flex items-end justify-between pt-3 mt-2 border-t border-white/5">
                                                <div>
                                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Desde</span>
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className="text-base md:text-lg font-black text-emerald-400">⚡{item.bliscoins || 0}</span>
                                                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">BlisCoins</span>
                                                    </div>
                                                    <span className="text-lg md:text-xl font-black text-white">{item.price}</span>
                                                </div>
                                                <span className="flex items-center gap-1 px-3 md:px-4 py-2 rounded-full bg-white/5 group-hover:bg-blis-red text-[9px] font-black text-white uppercase tracking-widest transition-all shadow-lg">
                                                    Ver <ArrowRight className="w-3 h-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                            ))}
                        </div>

                        {/* Flechas categoría móvil */}
                        <div className="md:hidden flex justify-center gap-4">
                            <button onClick={prevCategory} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
                                <ChevronLeft className="w-5 h-5 text-white" />
                            </button>
                            <button onClick={nextCategory} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
                                <ChevronRight className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* CTA Explora la Tienda - siempre visible debajo */}
                        <Link
                            href="/tienda"
                            className="w-full rounded-2xl overflow-hidden relative group border-2 border-dashed border-blis-red/20 bg-gradient-to-r from-blis-red/5 via-transparent to-blis-red/5 hover:border-blis-red/40 transition-all duration-500 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left p-5 md:p-6 gap-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blis-red/10 border border-blis-red/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_50px_rgba(190,11,60,0.1)] group-hover:bg-blis-red transition-all duration-500">
                                    <ShoppingCart className="text-blis-red group-hover:text-white w-5 h-5 md:w-6 md:h-6 transition-colors" />
                                </div>
                                <div>
                                    <h4 className="text-base md:text-xl font-black text-white uppercase tracking-tighter">Explora la Tienda</h4>
                                    <p className="text-gray-400 text-[10px] md:text-xs font-medium">Accede a más de 50 herramientas exclusivas.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest bg-blis-red px-5 md:px-8 py-3 md:py-4 rounded-full shadow-[0_10px_30px_rgba(190,11,60,0.3)] group-hover:shadow-blis-red/50 transition-all active:scale-95 flex-shrink-0">
                                Tienda Completa <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                            </div>
                        </Link>
                    </div>
                )}

                {/* Progress dots por categoría */}
                <div className="flex justify-center items-center gap-3 md:gap-4 mt-6 md:mt-12">
                    {visibleCategories.map((cat, i) => (
                        <button
                            key={cat.id}
                            onClick={() => { setActiveCategoryId(cat.id); setCurrentIndex(0); }}
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
