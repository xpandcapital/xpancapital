"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lock, Clock, Sparkles, BookOpen, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePublicBlog } from "@/lib/hooks/usePublicBlog";
import { useLandingCMS } from "@/context/LandingCMSContext";

// Floating decorative icons
const floatingIcons = [
    { icon: BookOpen, style: "top-16 right-24 text-white/5", size: "w-20 h-20", delay: 0.5 },
    { icon: Sparkles, style: "bottom-24 left-16 text-yellow-500/10", size: "w-14 h-14", delay: 1.2 },
    { icon: TrendingUp, style: "top-1/3 left-10 text-white/5", size: "w-16 h-16", delay: 0 },
];

// Fallback articles if Supabase is empty
const fallbackArticles: Array<{
    titulo: string;
    extracto: string;
    categoria: string;
    readTime: string;
    imagen_portada: string;
    es_premium: boolean;
    slug: string;
}> = [
    {
        titulo: "Inversión Inmobiliaria: 5 Claves para el Éxito",
        extracto: "Descubre las claves fundamentales para tener éxito en tus inversiones inmobiliarias.",
        categoria: "Inversiones",
        readTime: "5 min",
        imagen_portada: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800",
        es_premium: false,
        slug: "inversion-inmobiliaria-5-claves-exito-2026"
    }
];

export function BlogPremium() {
    const { cmsData } = useLandingCMS();
    const { title, subtitle, description } = cmsData.blog;
    const { posts, loading } = usePublicBlog();

    // Transform Supabase posts for display
    const displayPosts = posts.length > 0 
        ? posts.slice(0, 3).map(post => ({
            titulo: post.titulo,
            extracto: post.extracto || '',
            categoria: typeof post.categoria === 'object' && post.categoria?.nombre ? post.categoria.nombre : 'General',
            readTime: `${post.tiempo_lectura_minutos || 5} min`,
            imagen_portada: post.imagen_portada || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
            es_premium: post.es_premium,
            slug: post.slug
        }))
        : fallbackArticles;

    return (
        <section className="pt-10 md:pt-20 pb-24 bg-black relative overflow-hidden">
            {/* Floating Icons */}
            {floatingIcons.map(({ icon: Icon, style, size, delay }, i) => (
                <motion.div
                    key={i}
                    className={`absolute pointer-events-none ${style}`}
                    animate={{ y: [-8, 8, -8] }}
                    transition={{ repeat: Infinity, duration: 5 + i, ease: "easeInOut", delay }}
                >
                    <Icon className={size} />
                </motion.div>
            ))}

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-6 text-center md:text-left">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-sm font-bold tracking-[0.2em] text-gray-500 uppercase mb-2">{title || 'Conocimiento'}</h2>
                        <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wide">
                            {subtitle || 'Blog'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-300">Premium</span>
                        </h3>
                    </motion.div>

                    <Link 
                        href="/blog" 
                        className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white font-bold uppercase text-sm hover:bg-white hover:text-black transition-colors"
                    >
                        Ver Todos los Artículos <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-60 bg-white/5 rounded-2xl mb-4" />
                                <div className="h-4 bg-white/5 rounded mb-2" />
                                <div className="h-4 bg-white/5 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {displayPosts.map((article, index) => (
                            <Link key={article.slug || index} href={`/blog/articulo/${article.slug}`}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className={`relative glass-card rounded-2xl overflow-hidden group hover:border-white/20 transition-all flex flex-col h-full cursor-pointer ${article.es_premium ? 'hover:shadow-[0_0_40px_rgba(202,138,4,0.2)]' : ''}`}
                                >
                                    {/* Pulsing golden glow for Premium articles */}
                                    {article.es_premium && (
                                        <motion.div
                                            className="absolute inset-0 rounded-2xl pointer-events-none z-0"
                                            animate={{
                                                boxShadow: [
                                                    "0 0 0px rgba(202,138,4,0)",
                                                    "0 0 30px rgba(202,138,4,0.3)",
                                                    "0 0 0px rgba(202,138,4,0)"
                                                ]
                                            }}
                                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                        />
                                    )}

                                    <div className="relative h-60 overflow-hidden z-10">
                                        <div
                                            className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 ${article.es_premium ? 'opacity-70' : 'opacity-90'}`}
                                            style={{ backgroundImage: `url(${article.imagen_portada})` }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />

                                        <div className="absolute top-4 left-4">
                                            <span className="text-xs font-bold uppercase tracking-widest text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
                                                {article.categoria}
                                            </span>
                                        </div>

                                        {article.es_premium && (
                                            <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-600 to-yellow-400 p-2 rounded-full shadow-[0_0_15px_rgba(202,138,4,0.5)]">
                                                <Lock className="w-4 h-4 text-black" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-8 flex flex-col flex-grow relative z-10">
                                        <h4 className={`text-xl font-black text-white uppercase mb-4 leading-snug ${article.es_premium ? 'group-hover:text-yellow-400' : 'group-hover:text-blis-red'} transition-colors`}>
                                            {article.titulo}
                                        </h4>
                                        <p className="text-gray-400 font-light text-sm mb-6 flex-grow line-clamp-3">
                                            {article.extracto}
                                        </p>

                                        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-gray-500 border-t border-white/10 pt-4 mt-auto">
                                            <span className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" /> {article.readTime}
                                            </span>
                                            {article.es_premium ? (
                                                <span className="text-yellow-500 font-bold flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3" /> Solo Socios
                                                </span>
                                            ) : (
                                                <span className="text-white group-hover:text-blis-red transition-colors flex items-center gap-1">
                                                    Leer <ArrowRight className="w-3 h-3" />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}