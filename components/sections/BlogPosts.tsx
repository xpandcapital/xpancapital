"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { AutoSlider } from "@/components/ui/AutoSlider";

import { useState, useEffect } from "react";

interface BlogPostsProps {
  data?: {
    title?: string;
    description?: string;
    variant?: 'light' | 'dark';
    layout?: 'grid' | 'slider';
  };
}

export function BlogPosts({ data = {} }: BlogPostsProps) {
  const {
    title = "Artículos",
    description = "Últimas publicaciones del mercado.",
    variant = "dark",
    layout = "grid"
  } = data;

  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchBlog = async () => {
      try {
        const postsRes = await fetch(`/api/blog?empresa_id=6186f014-c8c7-4027-9f08-8acf2bae3eae`);
        const postsData = await postsRes.json();
        if (postsData.success && postsData.data && isMounted) {
          const mapped = postsData.data
            .filter((p: any) => p.estado === 'publicado')
            .map((p: any) => ({
              id: p.id,
              title: p.titulo,
              excerpt: p.extracto || "",
              category: p.categoria?.nombre || "General",
              image: p.imagen_portada || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
              isPremium: p.es_premium,
              slug: p.slug
            }));
          setArticles(mapped);
        }
      } catch (e) {
        console.error("BlogPosts fetch error:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchBlog();
    return () => { isMounted = false; };
  }, []); // Solo al montar

  const getArticleSlug = (art: any) => art.slug || art.id;

  if (loading) return <div className="py-20 flex justify-center text-gray-500">Cargando publicaciones...</div>;
  if (articles.length === 0) return null;

  if (layout === "slider") {
    return (
      <section className={`py-20 px-4 md:px-8 xl:px-16 border-b ${variant === 'dark' ? 'bg-[#050505] border-white/5 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
        <div className="max-w-[1600px] mx-auto">
          <h2 className="text-3xl font-black uppercase mb-10 flex items-center gap-3">
             <div className={`w-2 h-8 rounded-full ${variant === 'dark' ? 'bg-emerald-500' : 'bg-blis-red'}`} /> {title}
          </h2>
          <AutoSlider getArticleSlug={getArticleSlug} articles={articles} variant={variant} direction="ltr" />
        </div>
      </section>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {articles.map((art, idx) => (
        <Link 
          key={idx} 
          href={`/blog/articulo/${getArticleSlug(art)}`} 
          className={`group bg-white/5 border border-white/5 hover:border-emerald-500/40 rounded-[32px] p-6 transition-all duration-500 shadow-2xl relative ${art.isPremium ? 'border-amber-500/20 shadow-amber-500/5' : ''}`}
        >
          <div className="aspect-square rounded-2xl overflow-hidden mb-6 relative">
            <img src={art.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={art.title} />
            {art.isPremium && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 p-2.5 bg-amber-500 text-black rounded-xl font-black shadow-xl z-10">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg border 
              ${art.isPremium 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'}`}>
              {art.category}
            </span>
            {art.isPremium && <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest italic group-hover:translate-x-1 transition-transform">Premium</span>}
          </div>
          <h3 className="text-xl font-black uppercase mb-4 group-hover:text-emerald-400 transition-colors leading-tight">{art.title}</h3>
          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{art.excerpt}</p>
        </Link>
      ))}
    </div>
  );
}
