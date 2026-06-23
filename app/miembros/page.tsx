"use client";

import { motion } from "framer-motion";
import {
    Play,
    FileText,
    Download,
    ChevronRight,
    Clock,
    Star,
    Package,
    BookOpen,
    Loader2,
    DownloadCloud,
    ShoppingBag,
    Target,
    TrendingUp
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/lib/hooks/useUserStats";
import { useCursos, useUserCursos } from "@/lib/hooks/useCursos";
import { useCompras } from "@/lib/hooks/useCompras";
import { useShop } from "@/context/ShopContext";
import { useEffect } from "react";

export default function UserDashboard() {
    const { user } = useAuth();
    const { stats, loading: statsLoading, fetchUserStats } = useUserStats();
    const { cursos: _allCursos, loading: _allCursosLoading } = useCursos();
    const { userCursos, loading: userCursosLoading, refetch: refetchUserCursos } = useUserCursos(user?.id || null);
    const { compras, loading: comprasLoading, fetchUserPurchases } = useCompras();
    const { coinsEnabled } = useShop();

    const widgetColors = [
        { icon: Package, label: "Productos Adquiridos", color: "text-purple-500", bg: "bg-purple-500/10" },
        { icon: Target, label: "Cursos Completados", color: "text-amber-500", bg: "bg-amber-500/10" },
        { icon: Play, label: "Curso Activo", color: "text-blue-500", bg: "bg-blue-500/10" },
        { icon: Star, label: "BLISCOINS", color: "text-yellow-500", bg: "bg-yellow-500/10" },
        { icon: TrendingUp, label: "Inversión Total", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    ];

    const widgetValue = (i: number) => {
        if (!stats) {
            if (i === 0) return "—"
            if (i === 1) return "— / —"
            if (i === 2) return "—"
            if (i === 3) return "—"
            if (i === 4) return "—"
            return "—"
        }
        switch (i) {
            case 0: return stats.productosAdquiridos.toString()
            case 1: return `${stats.cursosCompletados} / ${stats.cursosInscritos}`
            case 2: return stats.cursoActivo ? `${stats.cursoActivo.progreso}%` : "—"
            case 3: return stats.blisCoins.toLocaleString()
            case 4: return `$${stats.totalInvertido.toLocaleString()} USD`
        }
    }

    const widgetSub = (i: number) => {
        if (!stats) return ""
        if (i === 2 && stats.cursoActivo) return stats.cursoActivo.nombre
        if (i === 4) return `+valía ×10: $${stats.plusvaliaEstimada.toLocaleString()} USD`
        return ""
    }

    const visibleWidgets = coinsEnabled ? widgetColors : widgetColors.filter((_, i) => i !== 3);

    const enrolledCourses = userCursos.map(curso => ({
        id: curso.id,
        cursoId: curso.id,
        title: curso.nombre,
        progress: curso.progreso?.progreso || 0,
        image: curso.imagen_principal || '',
        lastAccessed: curso.progreso?.actualizado_en
            ? new Date(curso.progreso.actualizado_en).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
            : 'N/A',
        isEnrolled: true
    }));

    const purchasedCourses = compras
        .filter(c => c.estado === 'completado')
        .flatMap(c => (c.items || []).filter(item =>
          item.product_type === 'servicio' ||
          item.producto?.tipo === 'servicio' ||
          item.producto?.curso_id  // Producto vinculado a curso aunque su tipo no sea 'servicio'
        ).map(item => ({
            id: item.producto?.id || c.id,
            cursoId: item.producto?.curso_id || item.producto?.id || '',
            title: item.producto?.nombre || 'Curso',
            progress: 0,
            image: item.producto?.imagen_principal || '',
            lastAccessed: new Date(c.creado_en).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
            isEnrolled: false
        })));

    const enrolledIds = new Set(enrolledCourses.map(c => c.id));
    const newPurchasedCourses = purchasedCourses.filter(c => !enrolledIds.has(c.id));

    const allCourses = [...enrolledCourses, ...newPurchasedCourses].slice(0, 6);

    const recentPurchases = compras
        .filter(c => c.estado === 'completado')
        .slice(0, 4)
        .flatMap(c => (c.items || []).map(item => {
            const tipo = item.producto?.tipo || item.product_type || 'digital';
            const hasCursoId = !!item.producto?.curso_id;
            const isService = tipo === 'servicio' || hasCursoId;
            const isDigital = tipo === 'digital';
            const hasDownload = item.producto?.archivo_url || (isDigital && !hasCursoId);
            return {
                id: item.producto?.id || c.id,
                cursoId: item.producto?.curso_id || null,
                name: item.producto?.nombre || 'Producto',
                category: item.producto?.categoria?.nombre || (isService ? 'Curso' : isDigital ? 'Ebook' : tipo === 'fisico' ? 'Kit' : tipo === 'suscripcion' ? 'Mentoría' : 'Producto'),
                image: item.producto?.imagen_principal || '',
                date: new Date(c.creado_en).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
                isCourse: isService,
                isDownloadable: hasDownload && !isService
            };
        }));

    const recentDownloads = recentPurchases.filter(item => item.isDownloadable);

    useEffect(() => {
        if (user?.id) {
            fetchUserPurchases(user.id);
        }
    }, [user?.id, fetchUserPurchases]);

    if (statsLoading || (userCursosLoading && comprasLoading)) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
                <Package className="w-16 h-16 text-gray-600 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Inicia sesión para ver tu dashboard</h2>
                <p className="text-gray-500 mb-6">Accede a tu cuenta para ver cursos, productos y estadísticas.</p>
                <a href="/login" className="px-6 py-3 bg-blis-red text-white rounded-xl font-bold">
                    Iniciar Sesión
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20 px-4 md:px-8 pt-8 md:pt-8 w-full mx-auto">
            {/* Welcome Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 bg-gradient-to-r from-blis-red/10 to-transparent p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blis-red/20 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full sm:w-auto"
                >
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2 leading-none sm:leading-tight">
                        Bienvenido, <span className="text-blis-red">{user.name || 'Usuario'}</span>
                    </h1>
                    <p className="text-gray-400 font-medium text-xs sm:text-sm max-w-xl">
                        {stats?.cursoActivo
                            ? `Estás en "${stats.cursoActivo.nombre}" al ${stats.cursoActivo.progreso}%. ¡Sigue así!`
                            : allCourses.length > 0
                                ? `Tienes ${allCourses.filter(c => c.progress < 100).length} cursos pendientes por terminar.`
                                : 'Explora tu academia y productos disponibles.'}
                    </p>
                </motion.div>

                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                    <a href="/miembros/academia" className="w-full sm:w-auto bg-white text-black font-black uppercase tracking-widest px-6 py-4 sm:py-3 rounded-2xl hover:bg-blis-red hover:text-white transition-all text-xs flex justify-center items-center shadow-xl">
                        Ir a la Academia
                    </a>
                    <a href="/miembros/productos" className="w-full sm:w-auto bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest px-6 py-4 sm:py-3 rounded-2xl hover:bg-white/10 transition-all text-xs flex justify-center items-center">
                        Ver Productos
                    </a>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
                {visibleWidgets.map((widget, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-black/40 border border-white/5 py-3 px-4 sm:py-4 sm:px-6 rounded-xl sm:rounded-2xl group hover:border-white/10 transition-all relative overflow-hidden"
                    >
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl w-max ${widget.bg} ${widget.color} flex-shrink-0`}>
                                    <widget.icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                                </div>
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-[7px] sm:text-[9px] leading-tight line-clamp-2">{widget.label}</p>
                            </div>
                            <h3 className="text-lg sm:text-xl font-black text-white leading-none">{widgetValue(i)}</h3>
                            {widgetSub(i) ? (
                                <p className="text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase tracking-wider truncate leading-tight">{widgetSub(i)}</p>
                            ) : null}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Mis Compras Section */}
            {recentPurchases.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                            Mis Compras
                            <span className="h-px bg-white/10 flex-1 hidden md:block w-32" />
                        </h2>
                        <a href="/miembros/productos" className="text-xs text-blis-red font-black uppercase tracking-widest hover:text-white transition-colors">Ver Todo</a>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible md:grid md:grid-cols-2 lg:grid-cols-4">
                        {recentPurchases.map((item, i) => (
                            item.isCourse ? (
                                <Link key={item.id || i} href={`/miembros/academia?iniciar=${item.cursoId || ''}`} className="group cursor-pointer shrink-0 w-48 md:w-auto bg-black/40 border border-blis-red/20 rounded-2xl overflow-hidden hover:border-blis-red/40 transition-all flex flex-col">
                                    <div className="flex items-center gap-3 p-3 bg-zinc-900/50">
                                        {item.image ? (
                                            <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                                <BookOpen className="w-6 h-6 text-gray-600" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-blis-red uppercase tracking-widest mb-1">Curso</p>
                                            <h4 className="text-white font-black text-xs uppercase tracking-tight leading-tight line-clamp-2">{item.name}</h4>
                                        </div>
                                    </div>
                                    <div className="px-3 py-2 flex items-center justify-between bg-zinc-900/30">
                                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{item.date}</span>
                                        <span className="text-[9px] text-emerald-500 font-black uppercase">→ Ir al Curso</span>
                                    </div>
                                </Link>
                            ) : (
                                <Link key={item.id || i} href={`/miembros/productos/${item.id}`} className="group cursor-pointer shrink-0 w-48 md:w-auto bg-black/40 border border-white/5 rounded-2xl overflow-hidden hover:border-blis-red/30 transition-all flex flex-col">
                                    <div className="flex items-center gap-3 p-3 bg-zinc-900/50">
                                        {item.image ? (
                                            <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                                <Package className="w-6 h-6 text-gray-600" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-blis-red uppercase tracking-widest mb-1">{item.category}</p>
                                            <h4 className="text-white font-black text-xs uppercase tracking-tight leading-tight line-clamp-2">{item.name}</h4>
                                        </div>
                                    </div>
                                    <div className="px-3 py-2 flex items-center justify-between bg-zinc-900/30">
                                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{item.date}</span>
                                        <span className="text-[9px] text-blis-red font-black uppercase">→ Ver</span>
                                    </div>
                                </Link>
                            )
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Courses Progress */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                            Continuar Aprendiendo
                            <span className="h-px bg-white/10 flex-1 hidden md:block w-32" />
                        </h2>
                        <a href="/miembros/academia" className="text-xs text-blis-red font-black uppercase tracking-widest hover:text-white transition-colors">Ver Todo</a>
                    </div>

                    {/* Continuar Aprendiendo + Cursos Comprados */}
                    {allCourses.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {allCourses.map((course, i) => (
                                course.isEnrolled ? (
                                    <Link
                                        key={`enrolled-${course.id || i}`}
                                        href={`/miembros/academia?iniciar=${course.cursoId || course.id}`}
                                        className="group cursor-pointer bg-black/40 border border-white/5 rounded-[1.5rem] overflow-hidden hover:border-blis-red/30 transition-all flex flex-col"
                                    >
                                        <div className="aspect-square relative overflow-hidden bg-zinc-900">
                                            {course.image ? (
                                                <Image
                                                    src={course.image}
                                                    alt={course.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <BookOpen className="w-16 h-16 text-gray-700" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-12 h-12 rounded-full bg-blis-red flex items-center justify-center shadow-[0_0_20px_rgba(190,11,60,0.6)]">
                                                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <div className="flex justify-between items-center text-[8px] font-black text-white uppercase tracking-widest mb-1.5">
                                                    <span>Progreso</span>
                                                    <span>{course.progress}%</span>
                                                </div>
                                                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${course.progress}%` }}
                                                        className="h-full bg-blis-red shadow-[0_0_10px_rgba(190,11,60,0.8)]"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col justify-between">
                                            <h4 className="text-white font-black uppercase tracking-tight text-sm mb-2 leading-tight group-hover:text-blis-red transition-colors line-clamp-2 h-[2.5rem]">{course.title}</h4>
                                            <div className="flex items-center gap-2 text-[8px] text-gray-500 font-bold uppercase tracking-widest">
                                                <Clock className="w-2.5 h-2.5" />
                                                <span>{course.lastAccessed}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ) : (
                                    <Link
                                        key={`purchased-${course.id || i}`}
                                        href={`/miembros/academia?iniciar=${course.cursoId || course.id}`}
                                        className="group cursor-pointer bg-black/40 border border-blis-red/20 rounded-[1.5rem] overflow-hidden hover:border-blis-red/30 transition-all flex flex-col"
                                    >
                                        <div className="aspect-square relative overflow-hidden bg-zinc-900">
                                            {course.image ? (
                                                <Image
                                                    src={course.image}
                                                    alt={course.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <BookOpen className="w-16 h-16 text-gray-700" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-12 h-12 rounded-full bg-blis-red flex items-center justify-center shadow-[0_0_20px_rgba(190,11,60,0.6)]">
                                                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col justify-between">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="bg-blis-red/80 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Nuevo</span>
                                            </div>
                                            <h4 className="text-white font-black uppercase tracking-tight text-sm mb-2 leading-tight group-hover:text-blis-red transition-colors line-clamp-2 h-[2.5rem]">{course.title}</h4>
                                            <div className="mt-auto space-y-2">
                                                <div className="flex justify-between items-center text-[8px] font-black text-white uppercase tracking-widest">
                                                    <span>Progreso</span>
                                                    <span>{course.progress}%</span>
                                                </div>
                                                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${course.progress}%` }}
                                                        className="h-full bg-blis-red shadow-[0_0_10px_rgba(190,11,60,0.8)]"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            ))}
                        </div>
                    ) : (
                        <div className="bg-black/40 border border-white/5 rounded-[2rem] p-8 text-center">
                            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">No tienes cursos inscritos</h3>
                            <p className="text-gray-500 mb-6">Explora nuestra academia y comienza tu aprendizaje.</p>
                            <a href="/miembros/academia" className="inline-block px-6 py-3 bg-blis-red text-white rounded-xl font-bold">
                                Explorar Academia
                            </a>
                        </div>
                    )}
                </div>

                {/* Sidebar Column: Downloads & Perks */}
                <div className="space-y-8">
                    {/* Downloads Card */}
                    <div className="bg-zinc-950 border border-white/5 rounded-[2rem] overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">Descargas Recientes</h2>
                            <DownloadCloud className="w-4 h-4 text-blis-red" />
                        </div>
                        {recentDownloads.length === 0 ? (
                            <div className="p-8 text-center">
                                <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">Sin descargas recientes</p>
                            </div>
                        ) : (
                            <div className="p-4 space-y-2">
                                {recentDownloads.map((doc, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors group cursor-pointer">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="p-2 bg-black rounded-lg text-white group-hover:text-blis-red transition-colors">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <h5 className="text-xs font-bold text-white truncate">{doc.name}</h5>
                                                <span className="text-[10px] text-gray-500 uppercase font-black">{doc.date}</span>
                                            </div>
                                        </div>
                                        <button className="p-2 hover:text-blis-red transition-colors">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="p-4 border-t border-white/5 bg-black">
                            <a href="/miembros/productos" className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                Gestionar Recursos <ChevronRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Pro Insight Card */}
                    <div className="bg-gradient-to-br from-blis-red to-red-900 p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(190,11,60,0.2)] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform">
                            <Star className="w-24 h-24 stroke-[2px]" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 relative z-10">¿Sabías que...?</h3>
                        <p className="text-white/80 text-sm font-medium mb-8 leading-relaxed relative z-10">
                            Los inversores que utilizan el <b>Arsenal de Licitaciones</b> junto con el curso de <b>Captación</b> han reportado una tasa de cierre un 40% mayor este trimestre.
                        </p>
                        <a href="/miembros/productos" className="w-full bg-white text-black font-black uppercase tracking-widest text-[10px] py-4 rounded-xl shadow-xl hover:scale-105 transition-transform relative z-10 inline-block text-center">
                            Explorar Licitaciones
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}