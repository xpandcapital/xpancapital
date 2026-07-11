"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Lock, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { DEFAULT_EMPRESA_ID } from "@/lib/empresa";

interface BlogHeroProps {
  data?: {
    title?: string;
    subtitle?: string;
  };
}

export function BlogHero({ data = {} }: BlogHeroProps) {
  const {
    title = "BlisBlog",
    subtitle = "Inteligencia de Mercado & Revista Digital",
  } = data;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchBlog = async () => {
      try {
        const postsRes = await fetch(`/api/blog?empresa_id=${DEFAULT_EMPRESA_ID}`);
        const postsData = await postsRes.json();
        if (postsData.success && postsData.data && isMounted) {
          const mapped = postsData.data
            .filter((p: any) => p.estado === 'publicado' && p.visibilidad !== 'oculto')
            .slice(0, 5)
            .map((p: any) => ({
              id: p.id,
              title: p.titulo,
              excerpt: p.extracto || "",
              category: p.categoria?.nombre || "General",
              image: p.imagen_portada || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
              isPremium: p.es_premium,
              slug: p.slug
            }));
          setFeaturedArticles(mapped);
        }
      } catch (e) {
        console.error("BlogHero fetch error:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchBlog();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (featuredArticles.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredArticles.length);
      }, 8000);
      return () => clearInterval(timer);
    }
  }, [featuredArticles.length]);

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white/50">Cargando la revista digital...</div>;
  if (featuredArticles.length === 0) return null;

  const currentArt = featuredArticles[currentSlide];

  return (
    <div className="relative w-full min-h-screen bg-[#050505] text-white overflow-hidden flex flex-col justify-between pt-20 pb-0 border-b border-white/5">
      <div className="relative flex-grow flex items-center w-full py-10">
        <motion.div
          className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.15] pointer-events-none"
          animate={{ opacity: [0.12, 0.2, 0.12] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: "radial-gradient(circle, rgba(245,225,0,0.4) 0%, transparent 60%)" }}
        />
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 xl:px-16 flex flex-col md:flex-row items-center gap-12 lg:gap-20 w-full relative z-10">
          <div className="w-full md:w-5/12 flex flex-col justify-center min-h-[500px]">
            <div className="mb-10 cursor-default">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter">
                {title.replace("Blog", "")}<span className="text-blis-red drop-shadow-[0_0_15px_rgba(213,193,8,0.8)]">Blog</span>
              </h1>
              <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mt-3">{subtitle}</p>
            </div>
            
            <div className="relative min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentSlide} 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col justify-start"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-emerald-400">
                      {currentArt?.category}
                    </span>
                    {currentArt?.isPremium && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-black rounded-lg font-black text-[9px] uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-400">
                        <Sparkles className="w-3.5 h-3.5" /> Contenido Premium
                      </div>
                    )}
                  </div>
                  <h2 className="text-3xl md:text-4xl lg:text-6xl font-black uppercase tracking-tight mb-8 leading-[1.1]">{currentArt?.title}</h2>
                  <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed max-w-xl mb-12">{currentArt?.excerpt}</p>
                  
                  <div className="flex items-center gap-6">
                    <Link 
                      href={`/blog/articulo/${currentArt?.slug || currentArt?.id}`} 
                      className={`px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 transition-all shadow-2xl active:scale-95 group ${currentArt?.isPremium ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-900/40'}`}
                    >
                      {currentArt?.isPremium ? <Lock className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                      {currentArt?.isPremium ? 'Desbloquear Análisis' : 'Empezar Lectura'}
                    </Link>
                    
                    <div className="flex items-center gap-2">
                      <button onClick={() => setCurrentSlide(p => (p - 1 + featuredArticles.length) % featuredArticles.length)} className="p-3 border border-white/10 rounded-full hover:bg-white/5 hover:border-blis-red/30 transition-all"><ChevronLeft className="w-5 h-5" /></button>
                      <button onClick={() => setCurrentSlide(p => (p + 1) % featuredArticles.length)} className="p-3 border border-white/10 rounded-full hover:bg-white/5 hover:border-blis-red/30 transition-all"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="w-full md:w-7/12 relative h-[350px] md:h-[500px] lg:h-[600px] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlide}
                src={currentArt?.image}
                className="w-full h-full object-cover absolute inset-0"
                alt="Hero"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}

