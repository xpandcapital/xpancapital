"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Route, X, Library, Sparkles, Clock, ArrowLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/sections/Header";
import { FooterSections as Footer } from "@/components/sections/Footer";
import { usePublicBlog } from "@/lib/hooks/usePublicBlog";

const convertToSlug = (text: string) => {
    return text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
};

export default function RouteTimelinePage() {
    const params = useParams();
    const router = useRouter();
    const routeId = params.id as string;
    
    const [selectedRoute, setSelectedRoute] = useState<any>(null);

    const { posts } = usePublicBlog();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("blis_blog_routes");
            if (saved) {
                const routes = JSON.parse(saved);
                const found = routes.find((r: any) => r.id === routeId);
                if (found) {
                    setSelectedRoute(found);
                } else {
                    router.push("/blog");
                }
            } else {
                router.push("/blog");
            }
        }
    }, [routeId]);

    if (!selectedRoute) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black tracking-widest uppercase">Cargando Hoja de Ruta...</div>;

    return (
        <div className="min-h-screen bg-[#020202] text-white">
            <Header />
            
            <main className="pt-24 pb-20 relative px-4 md:px-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="max-w-5xl mx-auto min-h-screen border-x border-white/5 flex flex-col pt-10 pb-20 relative bg-[#050505]/40 backdrop-blur-3xl rounded-[40px]">
                    <button
                        onClick={() => router.back()}
                        className="px-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 uppercase text-[10px] font-bold tracking-[0.2em] group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver al Explorador
                    </button>
                    
                    <div className="px-6 md:px-16 pt-10 pb-16 border-b border-white/5 relative z-10 text-center">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full font-black uppercase tracking-widest text-[10px] mb-8 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                             <Route className="w-4 h-4" /> Ruta de Aprendizaje Estratégica
                        </div>
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight mb-6 leading-tight max-w-3xl mx-auto">{selectedRoute.name}</h1>
                        <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-lg leading-relaxed">{selectedRoute.description}</p>
                    </div>

                    <div className="px-6 md:px-16 py-16 relative">
                        {/* Vertical Line */}
                        <div className="absolute left-6 md:left-1/2 top-16 bottom-16 w-0.5 bg-gradient-to-b from-emerald-500/40 via-emerald-500/10 to-transparent -translate-x-1/2 rounded-full hidden md:block" />
                        
                        <div className="space-y-16 relative z-10">
                            {selectedRoute.articles?.map((artTitle: string, idx: number) => {
                                let foundArt: any = posts.find(a => a.titulo === artTitle);
                                
                                if (!foundArt && typeof window !== "undefined") {
                                    const adminBlogs = JSON.parse(localStorage.getItem("admin_blogs") || "[]");
                                    foundArt = adminBlogs.find((a: any) => a.title === artTitle || a.titulo === artTitle);
                                }

                                const isEven = idx % 2 === 0;
                                
                                if (!foundArt) return null;
                                
                                return (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        key={`step-${idx}`} 
                                        className={`flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full ${isEven ? 'md:flex-row-reverse' : ''}`}
                                    >
                                        
                                        <div className="hidden md:block flex-1" />
                                        
                                        {/* Timeline Node */}
                                        <div className="relative md:absolute md:left-1/2 w-14 h-14 bg-black border-4 border-emerald-500 rounded-full flex items-center justify-center font-black text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] md:-translate-x-1/2 shrink-0 z-20 self-start md:self-auto group transition-transform hover:scale-110">
                                            {idx + 1}
                                        </div>

                                        <div className={`flex-1 w-full pl-0 ${isEven ? 'md:text-left' : 'md:text-right'}`}>
                                            <div 
                                                className="bg-[#111111]/80 backdrop-blur-md border border-white/10 hover:border-emerald-500/50 rounded-[32px] p-8 transition-all group overflow-hidden relative cursor-pointer shadow-2xl" 
                                                onClick={() => { router.push(`/blog/articulo/${convertToSlug(foundArt.title)}`); }}
                                            >
                                                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[80px] rounded-full group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
                                                
                                                <div className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4 ${isEven ? 'justify-start' : 'justify-start md:justify-end'}`}>
                                                    {foundArt.isPremium && (
                                                         <span className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded">
                                                              <Sparkles className="w-3 h-3" /> Premium
                                                         </span>
                                                    )}
                                                    <span className="bg-white/5 px-2 py-0.5 rounded text-gray-400">{foundArt.category}</span> 
                                                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {foundArt.readTime}</span>
                                                </div>
                                                
                                                <h4 className="text-xl md:text-2xl font-black text-white mb-4 leading-tight group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{foundArt.title}</h4>
                                                <p className="text-[13px] text-gray-400 line-clamp-2 leading-relaxed mb-6">{foundArt.excerpt}</p>
                                                
                                                <div className={`flex ${isEven ? 'justify-start' : 'justify-start md:justify-end'}`}>
                                                     <div className="flex items-center gap-2 text-white/40 font-black uppercase text-[10px] tracking-widest group-hover:text-emerald-500 transition-colors">
                                                          Empezar Lectura <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                                     </div>
                                                </div>
                                            </div>
                                        </div>

                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}

