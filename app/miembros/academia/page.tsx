"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Clock, Star, Trophy, ChevronRight, Lock, CheckCircle2, Search, ArrowLeft, BookOpen, Loader2, MonitorPlay, FileText, ListChecks } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserCursos } from "@/lib/hooks/useCursos";

interface Lesson {
    id: string;
    title: string;
    type: 'video' | 'text' | 'quiz';
    content: string;
    videoUrl?: string;
    attachments?: string[];
    questions?: { id: string; text: string; options: { id: string; text: string; isCorrect: boolean }[] }[];
}

interface Module {
    id: string;
    title: string;
    description?: string;
    lessons: Lesson[];
}

interface CursoData {
    id: string;
    nombre: string;
    slug: string;
    descripcion?: string;
    imagen_principal?: string | null;
    modulos?: Module[];
    progreso?: { progreso: number };
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
    video: { icon: MonitorPlay, color: 'text-blue-400', label: 'Video' },
    text: { icon: FileText, color: 'text-gray-400', label: 'Lectura' },
    quiz: { icon: ListChecks, color: 'text-amber-400', label: 'Quiz' },
};

function AcademyContent() {
    const { user } = useAuth();
    const { userCursos, loading, refetch: refetchUserCursos } = useUserCursos(user?.id || null);
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [activeModule, setActiveModule] = useState<string | null>(null);
    const [openModules, setOpenModules] = useState<Set<string>>(new Set());
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [fullCurso, setFullCurso] = useState<CursoData | null>(null);
    const [loadingCurso, setLoadingCurso] = useState(false);
    const [purchasedCourses, setPurchasedCourses] = useState<any[]>([]);
    const [loadingPurchased, setLoadingPurchased] = useState(false);

    const fetchCursoCompleto = useCallback(async (slugOrId: string, useId: boolean = false) => {
        setLoadingCurso(true);
        try {
            const param = useId ? 'id' : 'slug';
            const url = `/api/cursos?${param}=${slugOrId}${user?.id ? `&user_id=${user.id}` : ''}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.success && data.data) {
                setFullCurso(data.data);
            }
        } catch {
        } finally {
            setLoadingCurso(false);
        }
    }, [user?.id]);

    const handleSelectCourse = async (course: any) => {
        setSelectedSlug(course.slug || course.id);
        setActiveLesson(null);
        setActiveModule(null);
        setOpenModules(new Set());
        setCompletedLessons([]);
        if (course.slug) {
            await fetchCursoCompleto(course.slug);
        } else if (course.cursoId || course.id) {
            await fetchCursoCompleto(course.cursoId || course.id, true);
        }
    };

    useEffect(() => {
        if (!fullCurso?.modulos || activeLesson) return;
        const modulos = fullCurso.modulos as Module[];
        if (modulos.length > 0) {
            setActiveModule(modulos[0].id);
            setOpenModules(new Set([modulos[0].id]));
            if (modulos[0].lessons?.length > 0) {
                setActiveLesson(modulos[0].lessons[0]);
            }
        }
    }, [fullCurso]);

    useEffect(() => {
        const fetchPurchasedCourses = async () => {
            if (!user?.id) return;
            setLoadingPurchased(true);
            try {
                const res = await fetch(`/api/compras?user_id=${user.id}`);
                const data = await res.json();
                if (data.success) {
                    const purchased = (data.data || [])
                        .filter((c: any) => c.estado === 'completado')
                        .flatMap((c: any) => (c.items || [])
                            .filter((item: any) => item.product_type === 'servicio' || item.producto?.tipo === 'servicio')
                            .filter((item: any) => item.producto?.curso_id)
                            .map((item: any) => ({
                                id: item.producto?.curso_id || item.producto?.id,
                                cursoId: item.producto?.curso_id,
                                nombre: item.producto?.nombre || 'Curso',
                                slug: item.producto?.slug || '',
                                imagen_principal: item.producto?.imagen_principal || '',
                                progreso: { progreso: 0 },
                                isPurchased: true
                            })));
                    setPurchasedCourses(purchased);
                }
            } catch {
            } finally {
                setLoadingPurchased(false);
            }
        };
        fetchPurchasedCourses();
    }, [user?.id]);

    const handleLessonComplete = useCallback((lessonId: string) => {
        if (!completedLessons.includes(lessonId)) {
            setCompletedLessons(prev => [...prev, lessonId]);
            if (fullCurso?.id && user?.id) {
                fetch('/api/cursos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: user.id,
                        curso_id: fullCurso.id,
                        lesson_id: lessonId,
                        completed: true
                    })
                });
            }
        }
    }, [completedLessons, fullCurso?.id, user?.id]);

    const modules = (fullCurso?.modulos as Module[]) || [];
    const allLessons = modules.flatMap(m => m.lessons.map(l => ({ lesson: l, moduleId: m.id })));
    const currentIndex = activeLesson ? allLessons.findIndex(item => item.lesson.id === activeLesson.id) : -1;
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < allLessons.length - 1;

    const getTotalLessons = () => {
        return modules.reduce((total, mod) => total + (mod.lessons?.length || 0), 0);
    };

    const getProgress = () => {
        const total = getTotalLessons();
        if (total === 0) return 0;
        return Math.round((completedLessons.length / total) * 100);
    };

    if (loading || loadingPurchased) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
                <BookOpen className="w-16 h-16 text-gray-600 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Inicia sesión para ver tus cursos</h2>
                <p className="text-gray-500 mb-6">Accede a tu cuenta para continuar tu formación.</p>
                <a href="/login" className="px-6 py-3 bg-blis-red text-white rounded-xl font-bold">
                    Iniciar Sesión
                </a>
            </div>
        );
    }

    // Combinar cursos del usuario (equipo_cursos) con cursos comprados sin duplicar
    const enrolledCourses = userCursos.map((curso: any) => ({
        ...curso,
        modulos: curso.modulos || [{ id: 'm1', title: 'Módulo 1', lessons: [] }],
        progreso: curso.progreso || { progreso: 0 }
    }));

    const enrolledIds = new Set(enrolledCourses.map(c => c.id));
    const newPurchasedCourses = purchasedCourses.filter(c => !enrolledIds.has(c.id));
    const allAcademyCourses = [...enrolledCourses, ...newPurchasedCourses];

    return (
        <div className="space-y-8 px-4 md:px-8 pt-8 md:pt-8 w-full mx-auto pb-20">
            <AnimatePresence mode="wait">
                {!selectedSlug ? (
                    <motion.div
                        key="course-list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
                            <div className="w-full sm:w-auto">
                                <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">Mis Cursos</h1>
                                <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl leading-tight">Continúa tu formación con tus capacitaciones adquiridas.</p>
                            </div>
                            <div className="relative w-full sm:w-80 mt-4 sm:mt-0">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Buscar en mis cursos..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 sm:py-4 text-[10px] sm:text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-blis-red focus:bg-white/10 transition-all"
                                />
                            </div>
                        </div>

                        {allAcademyCourses.length === 0 ? (
                            <div className="bg-black/40 border border-white/5 rounded-[2rem] p-12 text-center">
                                <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-white mb-2">No tienes cursos inscritos</h2>
                                <p className="text-gray-500 mb-6">Explora nuestra academia y comienza tu aprendizaje.</p>
                                <a href="/tienda" className="inline-block px-6 py-3 bg-blis-red text-white rounded-xl font-bold">
                                    Explorar Academia
                                </a>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {allAcademyCourses.map((course, i) => (
                                    course.isPurchased ? (
                                        <motion.div
                                            key={`purchased-${course.id}`}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            onClick={() => handleSelectCourse(course)}
                                            className="group cursor-pointer bg-zinc-950 border border-blis-red/20 rounded-[2rem] overflow-hidden hover:border-blis-red/30 transition-all flex flex-col h-full shadow-xl"
                                        >
                                                <div className="relative w-full pb-[100%] overflow-hidden bg-black">
                                                    {course.imagen_principal ? (
                                                        <div className="absolute inset-0">
                                                            <Image
                                                                src={course.imagen_principal}
                                                                alt={course.nombre}
                                                                fill
                                                                className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <BookOpen className="w-16 h-16 text-gray-700" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                                                    <div className="absolute top-4 left-4">
                                                        <span className="bg-emerald-500/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">Nuevo</span>
                                                    </div>
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="w-16 h-16 rounded-full bg-blis-red flex items-center justify-center shadow-[0_0_30px_rgba(190,11,60,0.6)]">
                                                            <Play className="w-6 h-6 text-white fill-white ml-1" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-6 flex-1 flex flex-col">
                                                    <p className="text-blis-red font-black uppercase tracking-widest text-[9px] mb-2">Curso</p>
                                                    <h3 className="text-white font-black uppercase tracking-tight text-lg mb-4 leading-tight group-hover:text-blis-red transition-colors line-clamp-2">
                                                        {course.nombre}
                                                    </h3>
                                                    <div className="mt-auto flex items-center gap-2 text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        <span>Comprado - Iniciar</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                    ) : (
                                        <motion.div
                                            key={course.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            onClick={() => handleSelectCourse(course)}
                                            className="group cursor-pointer bg-zinc-950 border border-white/5 rounded-[2rem] overflow-hidden hover:border-blis-red/30 transition-all flex flex-col h-full shadow-xl"
                                        >
                                            <div className="relative w-full pb-[100%] overflow-hidden bg-black">
                                                {course.imagen_principal ? (
                                                    <div className="absolute inset-0">
                                                        <Image
                                                            src={course.imagen_principal}
                                                            alt={course.nombre}
                                                            fill
                                                            className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <BookOpen className="w-16 h-16 text-gray-700" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="w-16 h-16 rounded-full bg-blis-red flex items-center justify-center shadow-[0_0_30px_rgba(190,11,60,0.6)]">
                                                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-4 left-6 right-6">
                                                    <div className="flex justify-between items-center text-[10px] font-black text-white uppercase tracking-widest mb-2">
                                                        <span>Progreso</span>
                                                        <span>{course.progreso?.progreso || 0}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blis-red shadow-[0_0_10px_rgba(190,11,60,0.8)]" style={{ width: `${course.progreso?.progreso || 0}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-6 flex-1 flex flex-col">
                                                <p className="text-blis-red font-black uppercase tracking-widest text-[9px] mb-2">Curso</p>
                                                <h3 className="text-white font-black uppercase tracking-tight text-lg mb-4 leading-tight group-hover:text-blis-red transition-colors line-clamp-2">
                                                    {course.nombre}
                                                </h3>
                                                <div className="mt-auto flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                    <Trophy className="w-3.5 h-3.5" />
                                                    <span>Blis Expert Team</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                ))}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="course-player"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <button
                            onClick={() => { setSelectedSlug(null); setFullCurso(null); setActiveLesson(null); }}
                            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-4 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Volver a mis cursos
                        </button>

                        {loadingCurso ? (
                            <div className="flex items-center justify-center h-96">
                                <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
                            </div>
                        ) : (
                            <div className="flex flex-col xl:flex-row gap-8">
                                <div className="flex-1 space-y-6">
                                    <div className="bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-white/5 relative group shadow-2xl">
                                        {activeLesson?.type === 'video' && activeLesson.videoUrl ? (
                                            <div className="aspect-video bg-black w-full">
                                                {activeLesson.videoUrl.includes('<iframe') || activeLesson.videoUrl.includes('<script') ? (
                                                    <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: activeLesson.videoUrl.replace(/width=".*?"/g, 'width="100%"').replace(/height=".*?"/g, 'height="100%"') }} />
                                                ) : (
                                                    <iframe src={activeLesson.videoUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                                                )}
                                            </div>
                                        ) : activeLesson?.type === 'video' && !activeLesson.videoUrl ? (
                                            <div className="aspect-video bg-gradient-to-br from-zinc-900 to-zinc-950 flex items-center justify-center w-full">
                                                <div className="text-center">
                                                    <MonitorPlay className="w-16 h-16 text-gray-700 mx-auto mb-3" />
                                                    <p className="text-gray-500 text-sm font-bold">Video próximo</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="aspect-video bg-gradient-to-br from-zinc-900 to-zinc-950 flex items-center justify-center w-full">
                                                <div className="text-center">
                                                    <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-3" />
                                                    <p className="text-gray-500 text-sm font-bold">Selecciona una lección</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-black/40 border border-white/5 p-8 rounded-[2rem] backdrop-blur-md">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <span className="text-blis-red font-black uppercase tracking-[0.2em] text-[10px] mb-2 block">Viendo Ahora</span>
                                                <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-4">{activeLesson?.title || 'Selecciona una lección'}</h1>
                                                <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {activeLesson?.duration || activeLesson?.type || 'N/A'}</span>
                                                    {activeLesson && (
                                                        <span className={`flex items-center gap-1.5 ${TYPE_CONFIG[activeLesson.type]?.color || 'text-gray-500'}`}>
                                                            {(() => { const Icon = TYPE_CONFIG[activeLesson.type]?.icon || FileText; return <Icon className="w-4 h-4" />; })()}
                                                            {TYPE_CONFIG[activeLesson.type]?.label || 'Lección'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { if (hasPrev) { const prev = allLessons[currentIndex - 1]; setActiveLesson(prev.lesson); setActiveModule(prev.moduleId); setOpenModules(new Set([prev.moduleId])); } }}
                                                    disabled={!hasPrev}
                                                    className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    Anterior
                                                </button>
                                                <button
                                                    onClick={() => { if (hasNext) { const next = allLessons[currentIndex + 1]; setActiveLesson(next.lesson); setActiveModule(next.moduleId); setOpenModules(new Set([next.moduleId])); } }}
                                                    disabled={!hasNext}
                                                    className="px-4 py-2.5 bg-blis-red rounded-xl text-white text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-blis-red/20"
                                                >
                                                    Siguiente
                                                </button>
                                            </div>
                                        </div>

                                        {activeLesson?.content && (
                                            <div className="prose prose-invert max-w-none">
                                                <div className="text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                                            </div>
                                        )}

                                        {activeLesson && (
                                            <button
                                                onClick={() => handleLessonComplete(activeLesson.id)}
                                                className={`mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                                                    completedLessons.includes(activeLesson.id)
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        : 'bg-blis-red text-white hover:bg-blis-red/80 shadow-lg shadow-blis-red/20'
                                                }`}
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                {completedLessons.includes(activeLesson.id) ? 'Completado' : 'Marcar como completado'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="w-full xl:w-[400px] flex flex-col gap-6">
                                    <div className="bg-zinc-950 border border-white/5 rounded-[2rem] overflow-hidden flex flex-col h-full shadow-xl">
                                        <div className="p-6 border-b border-white/5 bg-black/40">
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-sm font-black text-white uppercase tracking-widest">Temario: {fullCurso?.nombre}</h2>
                                                <Trophy className="w-4 h-4 text-amber-500" />
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-white/5 rounded-full border border-white/5">
                                                    <div className="h-full bg-blis-red" style={{ width: `${getProgress()}%` }} />
                                                </div>
                                                <span className="text-[10px] font-black text-white">{getProgress()}%</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                            {modules.map((module) => (
                                                <div key={module.id} className="space-y-2">
                                                    <button
                                                        onClick={() => {
                                                            const newSet = new Set(openModules);
                                                            if (newSet.has(module.id)) newSet.delete(module.id);
                                                            else newSet.add(module.id);
                                                            setOpenModules(newSet);
                                                        }}
                                                        className="w-full flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors"
                                                    >
                                                        <span className="text-[11px] font-black uppercase tracking-tight text-white">{module.title}</span>
                                                        {openModules.has(module.id) ? (
                                                            <ChevronRight className="w-4 h-4 text-gray-500 rotate-90 transition-transform" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4 text-gray-500 transition-transform" />
                                                        )}
                                                    </button>

                                                    {openModules.has(module.id) && (
                                                        <div className="space-y-1 pl-2">
                                                            {(module.lessons || []).map((lesson) => (
                                                                <button
                                                                    key={lesson.id}
                                                                    onClick={() => { setActiveLesson(lesson); setActiveModule(module.id); }}
                                                                    className={`w-full flex items-center gap-4 p-3.5 rounded-xl transition-all group ${activeLesson?.id === lesson.id ? 'bg-blis-red/20 border border-blis-red/30' : 'hover:bg-white/5 border border-transparent'}`}
                                                                >
                                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${completedLessons.includes(lesson.id) ? 'bg-emerald-500/20 text-emerald-500' : 'bg-black/40 text-gray-500'}`}>
                                                                        {completedLessons.includes(lesson.id) ? (
                                                                            <CheckCircle2 className="w-4 h-4" />
                                                                        ) : (
                                                                            <Play className="w-4 h-4 ml-0.5" />
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0 flex-1 text-left">
                                                                        <h4 className={`text-xs font-bold truncate ${activeLesson?.id === lesson.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{lesson.title}</h4>
                                                                        <span className="text-[9px] font-mono text-gray-600 block mt-0.5">{TYPE_CONFIG[lesson.type]?.label || lesson.type}</span>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
);
}

export default function AcademyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
            </div>
        }>
            <AcademyContent />
        </Suspense>
    );
}
