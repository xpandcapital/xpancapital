"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    GraduationCap, Clock, Award, Coins, 
    Search, BookOpen, Loader2 
} from "lucide-react";
import Link from "next/link";
import { useCursos } from "@/lib/hooks/useCursos";

interface Curso {
    id: string;
    nombre: string;
    slug: string;
    descripcion?: string;
    precio_coins: number;
    precio_usd: number;
    creado_en: string;
}

export default function CursosPage() {
    const { cursos, loading, error } = useCursos();
    const [search, setSearch] = useState('');

    useEffect(() => {
        document.title = "Cursos | BLIS Corp";
    }, []);

    const filteredCursos = cursos.filter(curso =>
        !curso.para_equipo &&
        (curso.nombre.toLowerCase().includes(search.toLowerCase()) ||
        curso.descripcion?.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blis-red/10 border border-blis-red/20">
                            <GraduationCap className="w-4 h-4 text-blis-red" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blis-red">
                                Academia
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase">
                            Cursos y Certificaciones
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Aprende de los expertos y obtén certificaciones que avalen tus conocimientos
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <div className="relative w-full max-w-md">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar cursos..."
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blis-red transition-colors"
                            />
                        </div>
                    </div>

                    {filteredCursos.length === 0 ? (
                        <div className="text-center py-20">
                            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">No hay cursos disponibles</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCursos.map((curso, index) => (
                                <motion.div
                                    key={curso.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link href={`/cursos/${curso.slug}`}>
                                        <div className="group bg-zinc-900 border border-white/5 rounded-[2rem] overflow-hidden hover:border-blis-red/30 transition-all">
                                            <div className="aspect-video bg-gradient-to-br from-blis-red/20 to-zinc-800 relative">
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <GraduationCap className="w-16 h-16 text-white/20" />
                                                </div>
                                                {curso.precio_coins > 0 && (
                                                    <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full">
                                                        <Coins className="w-3 h-3 text-amber-400" />
                                                        <span className="text-[10px] font-bold text-amber-400">
                                                            {curso.precio_coins} coins
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="p-6 space-y-3">
                                                <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-blis-red transition-colors">
                                                    {curso.nombre}
                                                </h3>
                                                
                                                {curso.descripcion && (
                                                    <p className="text-sm text-gray-400 line-clamp-2">
                                                        {curso.descripcion}
                                                    </p>
                                                )}

                                                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <BookOpen className="w-3 h-3" />
                                                            <span>Curso</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {curso.precio_usd > 0 && (
                                                        <span className="text-sm font-bold text-white">
                                                            ${curso.precio_usd}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}