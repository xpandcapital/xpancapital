"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
    GraduationCap, Award, Clock, Coins,
    BookOpen, Loader2, ExternalLink
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCursos } from "@/lib/hooks/useCursos";
import { useCertificados } from "@/lib/hooks/useCertificados";

export default function MisCursosPage() {
    const { user } = useAuth();
    const { cursos, loading: loadingCursos } = useCursos();
    const { certificados, loading: loadingCertificados } = useCertificados(user?.id || null);
    const [activeTab, setActiveTab] = useState<'cursos' | 'certificados'>('cursos');

    useEffect(() => {
        document.title = "Mis Cursos | BLIS Corp";
    }, []);

    const loading = loadingCursos || loadingCertificados;

    if (!user) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <GraduationCap className="w-16 h-16 text-gray-600 mx-auto" />
                    <p className="text-gray-400">Inicia sesión para ver tus cursos</p>
                    <Link href="/miembros/login" className="text-blis-red hover:underline">
                        Iniciar sesión
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase">
                            Mi Aprendizaje
                        </h1>
                        <p className="text-gray-400 mt-1">
                            Administra tus cursos y certificados
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('cursos')}
                            className={`px-6 py-3 rounded-xl font-bold text-sm transition-colors ${
                                activeTab === 'cursos'
                                    ? 'bg-blis-red text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Cursos
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('certificados')}
                            className={`px-6 py-3 rounded-xl font-bold text-sm transition-colors ${
                                activeTab === 'certificados'
                                    ? 'bg-blis-red text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                Certificados
                            </div>
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
                        </div>
                    ) : activeTab === 'cursos' ? (
                        <div className="space-y-4">
                            {cursos.length === 0 ? (
                                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-12 text-center">
                                    <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400 mb-4">
                                        No estás inscrito en ningún curso
                                    </p>
                                    <Link 
                                        href="/cursos"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-blis-red text-white font-bold text-sm rounded-xl hover:bg-blis-red/80 transition-colors"
                                    >
                                        Ver cursos disponibles
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {cursos.map((curso) => (
                                        <Link key={curso.id} href={`/cursos/${curso.slug}`}>
                                            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5 hover:border-blis-red/30 transition-all">
                                                <div className="flex gap-4">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-blis-red/20 to-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                                                        <GraduationCap className="w-8 h-8 text-white/50" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-white line-clamp-1">
                                                            {curso.nombre}
                                                        </h3>
                                                        {curso.descripcion && (
                                                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                                                {curso.descripcion}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-4 mt-2">
                                                            {curso.precio_coins > 0 && (
                                                                <div className="flex items-center gap-1 text-xs text-amber-500">
                                                                    <Coins className="w-3 h-3" />
                                                                    {curso.precio_coins} coins
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {certificados.length === 0 ? (
                                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-12 text-center">
                                    <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400 mb-4">
                                        Aún no tienes certificados
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Completa un curso para obtener tu primer certificado
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {certificados.map((cert) => (
                                        <div 
                                            key={cert.id}
                                            className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 rounded-2xl overflow-hidden"
                                        >
                                            <div className="bg-gradient-to-r from-emerald-500/10 to-blis-red/10 px-4 py-2">
                                                <div className="flex items-center gap-2">
                                                    <Award className="w-4 h-4 text-emerald-500" />
                                                    <span className="text-xs font-bold text-emerald-400 uppercase">
                                                        Certificado
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <h3 className="font-bold text-white mb-1">
                                                    {cert.nombre}
                                                </h3>
                                                {cert.curso && (
                                                    <p className="text-sm text-gray-400 mb-3">
                                                        {cert.curso.nombre}
                                                    </p>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(cert.fecha_emision).toLocaleDateString('es-ES', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                    <Link
                                                        href={`/certificado/${cert.codigo_verificacion}`}
                                                        className="flex items-center gap-1 text-xs text-blis-red hover:underline"
                                                    >
                                                        Verificar
                                                        <ExternalLink className="w-3 h-3" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}