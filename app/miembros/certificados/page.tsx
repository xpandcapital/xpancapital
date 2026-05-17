"use client";

import { motion } from "framer-motion";
import { Award, Download, Loader2, BookOpen, CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCursos, useUserCursos } from "@/lib/hooks/useCursos";
import { useCompras } from "@/lib/hooks/useCompras";

export default function CertificadosPage() {
    const { user } = useAuth();
    const { cursos, loading: cursosLoading } = useCursos();
    const { userCursos, loading: userCursosLoading } = useUserCursos(user?.id || null);
    const { compras, loading: comprasLoading } = useCompras();

    const loading = cursosLoading || userCursosLoading || comprasLoading;

    const cursosCompletados = userCursos?.filter(c => {
        const prog = c.progreso as any;
        return prog?.progrestotal === 100 || prog?.completado;
    }) || [];

    const comprasCompletadas = compras?.filter(c => c.estado === 'completado') || [];
    const totalLogros = cursosCompletados.length + comprasCompletadas.length;

    return (
        <div className="space-y-10 px-4 md:px-8 pt-8 md:pt-8 w-full mx-auto pb-20">
            <div className="w-full mx-auto">
                <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none">Mis Certificados</h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl">Tus logros académicos y certificaciones obtenidas en Blis Corp.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blis-red" /></div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-zinc-950 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
                            <Award className="w-8 h-8 text-amber-400 mb-4" />
                            <h3 className="text-4xl font-black text-white">{totalLogros}</h3>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Logros Totales</p>
                        </div>
                        <div className="bg-zinc-950 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
                            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-4" />
                            <h3 className="text-4xl font-black text-white">{cursosCompletados.length}</h3>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Cursos Completados</p>
                        </div>
                        <div className="bg-zinc-950 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
                            <BookOpen className="w-8 h-8 text-blue-400 mb-4" />
                            <h3 className="text-4xl font-black text-white">{userCursos?.length || 0}</h3>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Cursos Inscritos</p>
                        </div>
                    </div>

                    <div className="bg-zinc-950/50 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl">
                        <div className="p-8 border-b border-white/5">
                            <h2 className="text-lg font-black text-white uppercase tracking-widest">Certificados Obtenidos</h2>
                        </div>
                        {cursosCompletados.length > 0 || comprasCompletadas.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {cursosCompletados.map((curso, i) => (
                                    <motion.div
                                        key={curso.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors group"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                                                <Award className="w-6 h-6 text-amber-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-bold text-white truncate">{curso.nombre}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] text-emerald-500 font-bold uppercase flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Completado
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 opacity-50">
                                            <Download className="w-3 h-3" /> Certificado (próximamente)
                                        </button>
                                    </motion.div>
                                ))}
                                {comprasCompletadas.map((compra, i) => (
                                    <motion.div
                                        key={compra.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: (cursosCompletados.length + i) * 0.05 }}
                                        className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors group"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                <BookOpen className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-bold text-white truncate">
                                                    {compra.producto?.nombre || `Compra #${compra.id?.slice(0, 8)}`}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase">
                                                        {compra.creado_en ? new Date(compra.creado_en).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-emerald-500 font-bold uppercase bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                                            Adquirido
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <Award className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-500 font-bold uppercase text-sm">Sin certificados aún</p>
                                <p className="text-gray-600 text-xs mt-1">Completa cursos para obtener tus certificados</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
