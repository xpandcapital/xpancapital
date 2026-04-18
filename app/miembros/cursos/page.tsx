"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
    GraduationCap, Award, Clock, Coins,
    BookOpen, Loader2, ExternalLink, Package,
    Users, CheckCircle2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCursos } from "@/lib/hooks/useCursos";
import { useCertificados } from "@/lib/hooks/useCertificados";

interface EquipoCurso {
    id: string;
    curso_id: string;
    advisor_id: string;
    progreso: number;
    estado: string;
    nota_final: number | null;
    asignado_en: string;
    cursos?: { nombre: string; precio_usd: number; imagen_principal: string | null; slug: string; para_equipo: boolean };
}

interface EquipoProducto {
    id: string;
    producto_id: string;
    advisor_id: string;
    estado: string;
    asignado_en: string;
    productos?: { nombre: string; precio_usd: number; imagen_principal: string | null };
}

export default function MisCursosPage() {
    const { user } = useAuth();
    const { cursos, loading: loadingCursos } = useCursos();
    const { certificados, loading: loadingCertificados } = useCertificados(user?.id || null);
    const [activeTab, setActiveTab] = useState<'cursos' | 'equipo' | 'certificados'>('cursos');
    const [equipoCursos, setEquipoCursos] = useState<EquipoCurso[]>([]);
    const [equipoProductos, setEquipoProductos] = useState<EquipoProducto[]>([]);
    const [isTeamMember, setIsTeamMember] = useState(false);
    const [loadingEquipo, setLoadingEquipo] = useState(false);

    useEffect(() => {
        document.title = "Mis Cursos | BLIS Corp";
    }, []);

    useEffect(() => {
        if (!user?.email) return;
        setLoadingEquipo(true);
        Promise.all([
            fetch(`/api/equipo-cursos/me?email=${encodeURIComponent(user.email)}`).then(r => r.json()),
            fetch(`/api/equipo-productos/me?email=${encodeURIComponent(user.email)}`).then(r => r.json()),
        ]).then(([cursosRes, productosRes]) => {
            if (cursosRes.success) {
                setEquipoCursos(cursosRes.data || []);
                setIsTeamMember(cursosRes.isTeamMember || false);
            }
            if (productosRes.success) {
                setEquipoProductos(productosRes.data || []);
            }
        }).catch(() => {}).finally(() => setLoadingEquipo(false));
    }, [user?.email]);

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

                    <div className="flex gap-2 flex-wrap">
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
                        {isTeamMember && (
                            <button
                                onClick={() => setActiveTab('equipo')}
                                className={`px-6 py-3 rounded-xl font-bold text-sm transition-colors ${
                                    activeTab === 'equipo'
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Mi Equipo
                                    {(equipoCursos.length + equipoProductos.length) > 0 && (
                                        <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            {equipoCursos.length + equipoProductos.length}
                                        </span>
                                    )}
                                </div>
                            </button>
                        )}
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
                    ) : activeTab === 'equipo' ? (
                        <div className="space-y-6">
                            {loadingEquipo ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-amber-400" />
                                            Cursos de Equipo
                                        </h2>
                                        {equipoCursos.length === 0 ? (
                                            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-8 text-center">
                                                <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                                <p className="text-gray-400">No tienes cursos de equipo asignados</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {equipoCursos.map((ec) => (
                                                    <div key={ec.id} className="bg-zinc-900 border border-amber-500/10 rounded-2xl p-5 hover:border-amber-500/30 transition-all">
                                                        <div className="flex gap-4">
                                                            <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center shrink-0">
                                                                <BookOpen className="w-7 h-7 text-amber-400/60" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h3 className="font-bold text-white line-clamp-1">
                                                                        {ec.cursos?.nombre || 'Curso'}
                                                                    </h3>
                                                                    {ec.cursos?.para_equipo && (
                                                                        <span className="text-[8px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider flex items-center gap-1">
                                                                            <Users className="w-2.5 h-2.5" />
                                                                            Equipo
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                                        ec.estado === 'completado' ? 'bg-emerald-500/10 text-emerald-400' :
                                                                        ec.estado === 'en_progreso' ? 'bg-amber-500/10 text-amber-400' :
                                                                        'bg-blue-500/10 text-blue-400'
                                                                    }`}>
                                                                        {ec.estado === 'completado' ? 'Completado' :
                                                                         ec.estado === 'en_progreso' ? 'En Progreso' :
                                                                         'Asignado'}
                                                                    </span>
                                                                    {ec.nota_final !== null && (
                                                                        <span className="text-[10px] text-gray-500">Nota: {ec.nota_final}%</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                            <Package className="w-5 h-5 text-amber-400" />
                                            Productos de Equipo
                                        </h2>
                                        {equipoProductos.length === 0 ? (
                                            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-8 text-center">
                                                <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                                <p className="text-gray-400">No tienes productos de equipo asignados</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {equipoProductos.map((ep) => (
                                                    <div key={ep.id} className="bg-zinc-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
                                                        <div className="flex gap-4">
                                                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center shrink-0">
                                                                <Package className="w-7 h-7 text-purple-400/60" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-bold text-white line-clamp-1">
                                                                    {ep.productos?.nombre || 'Producto'}
                                                                </h3>
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                                    ep.estado === 'activo' ? 'bg-emerald-500/10 text-emerald-400' :
                                                                    ep.estado === 'completado' ? 'bg-blue-500/10 text-blue-400' :
                                                                    'bg-white/5 text-gray-400'
                                                                }`}>
                                                                    {ep.estado === 'activo' ? 'Activo' :
                                                                     ep.estado === 'completado' ? 'Completado' :
                                                                     'Asignado'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
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