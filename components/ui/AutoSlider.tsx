"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { CalendarIcon, ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface Article {
    title: string;
    excerpt: string;
    category: string;
    date: string;
    image: string;
    slug?: string;
    [key: string]: any;
}

interface AutoSliderProps {
    articles: Article[];
    variant?: "light" | "dark";
    direction?: "ltr" | "rtl";
    getArticleSlug?: (article: Article) => string;
}

const defaultGetSlug = (art: Article): string => {
    if (!art) return '';
    if (art.slug && art.slug.length > 0) return art.slug;
    if (art.title && art.title.length > 0) {
        return art.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    return '';
};

export function AutoSlider({ articles, variant = "light", direction = "ltr", getArticleSlug = defaultGetSlug }: AutoSliderProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const slideNextRef = useRef<(() => void) | null>(null);

    const slideNext = useCallback(() => {
        if (!scrollRef.current) return;
        const scrollAmount = direction === "ltr" ? 280 : -280;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (direction === "ltr" && scrollLeft + clientWidth >= scrollWidth - 10) {
            scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else if (direction === "rtl" && scrollLeft <= 10) {
            scrollRef.current.scrollTo({ left: scrollWidth, behavior: "smooth" });
        } else {
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    }, [direction]);

    const slidePrev = useCallback(() => {
        if (!scrollRef.current) return;
        const scrollAmount = direction === "ltr" ? -280 : 280;
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }, [direction]);

    useEffect(() => {
        slideNextRef.current = slideNext;
    }, [slideNext]);

    useEffect(() => {
        let startTime = Date.now();
        let animationFrame: number;
        let accumulatedTime = 0;

        const updateProgress = () => {
            if (!isHovered) {
                const now = Date.now();
                const delta = now - startTime;
                startTime = now;
                accumulatedTime += delta;
                const currentProgress = (accumulatedTime / 4000) * 100;
                if (currentProgress >= 100) {
                    slideNextRef.current?.();
                    accumulatedTime = 0;
                    setProgress(0);
                } else {
                    setProgress(currentProgress);
                }
            } else {
                startTime = Date.now();
            }
            animationFrame = requestAnimationFrame(updateProgress);
        };

        animationFrame = requestAnimationFrame(updateProgress);
        return () => cancelAnimationFrame(animationFrame);
    }, [isHovered]);

    if (!articles || articles.length === 0) return null;

    return (
        <div
            className="relative w-full flex flex-col mt-2 group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center justify-between mb-2 px-2">
                <div className="w-24 h-1 bg-gray-500/20 rounded-full overflow-hidden relative">
                    <div
                        className="absolute top-0 left-0 h-full bg-blis-red transition-all duration-75 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex items-center gap-2 transition-opacity">
                    <button
                        onClick={slidePrev}
                        className="p-1.5 rounded-full bg-blis-red/20 border border-blis-red/50 hover:bg-blis-red text-blis-red hover:text-white transition-colors backdrop-blur-md"
                        aria-label="Anterior"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={slideNext}
                        className="p-1.5 rounded-full bg-blis-red/20 border border-blis-red/50 hover:bg-blis-red text-blis-red hover:text-white transition-colors backdrop-blur-md"
                        aria-label="Siguiente"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-5 pb-6 px-2 -mx-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                style={{ scrollBehavior: 'smooth' }}
            >
                {articles.map((article, idx) => {
                    const articleSlug = getArticleSlug(article);
                    if (!articleSlug) return null;
                    return (
                        <Link
                            key={`slide-${idx}`}
                            href={`/blog/articulo/${articleSlug}`}
                            className={`shrink-0 w-[260px] sm:w-[280px] snap-center group/card relative backdrop-blur-3xl overflow-hidden transition-all duration-500 flex flex-col no-underline hover:no-underline touch-pan-x ${variant === 'dark'
                                ? 'bg-[#0A0D11]/40 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:border-blis-red/50 rounded-3xl text-white'
                                : 'bg-white/40 border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:border-blis-red/30 rounded-3xl text-gray-900'
                                }`}
                        >
                            <div className={`relative w-full aspect-video overflow-hidden ${variant === 'dark' ? 'bg-black' : 'bg-gray-100'}`}>
                                <img src={article.image} alt={article.title} className="w-full h-full object-cover opacity-80 group-hover/card:opacity-100 group-hover/card:scale-110 transition-all duration-700" />
                                {article.isPremium && (
                                    <div className="absolute top-3 right-3 bg-amber-500 text-black p-1.5 rounded-xl shadow-2xl z-20 animate-pulse border border-amber-400">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                )}
                                <div className={`absolute inset-0 bg-gradient-to-t opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 mix-blend-overlay ${variant === 'dark' ? 'from-blis-red/40 via-transparent' : 'from-black/20 via-transparent'}`}></div>
                            </div>
                            <div className="p-5 flex flex-col flex-grow relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg border
                                        ${article.isPremium
                                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                                            : article.category === 'Legal'
                                                ? 'bg-blue-500/10 border-blue-500/30 text-blue-600'
                                                : article.category === 'Propietarios'
                                                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-600'
                                                    : article.category === 'Arquitectura' || article.category === 'Construccion'
                                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                                                        : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600'
                                        }`}>
                                        {article.category}
                                    </span>
                                    {article.isPremium && <span className="text-[9px] font-black text-amber-500 uppercase tracking-tighter">Premium</span>}
                                </div>
                                <h3 className="text-[14px] font-black leading-tight mb-3 group-hover/card:text-blis-red transition-colors line-clamp-2 uppercase tracking-tight">{article.title}</h3>
                                <p className={`text-[11px] line-clamp-2 leading-relaxed mb-4 flex-grow font-medium ${variant === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{article.excerpt}</p>
                                <div className={`flex items-center justify-between text-[10px] font-bold tracking-wide mt-auto pt-3 border-t ${variant === 'dark' ? 'text-gray-400 border-white/5' : 'text-gray-400 border-gray-100'}`}>
                                    <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {article.date}</span>
                                    <span className="text-blis-red uppercase flex items-center gap-1">Leer <ArrowRight className="w-3 h-3 group-hover/card:translate-x-1 transition-transform" /></span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
