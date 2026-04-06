"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    GraduationCap, Clock, Award, Coins, 
    Loader2, BookOpen, Play, FileText, 
    CheckCircle2, ChevronDown, ChevronRight,
    Lock, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCurso } from "@/lib/hooks/useCursos";
import { useAuth } from "@/hooks/useAuth";

interface Lesson {
    id: string;
    title: string;
    type: 'video' | 'text' | 'quiz';
    content: string;
    videoUrl?: string;
}

interface Module {
    id: string;
    title: string;
    description?: string;
    lessons: Lesson[];
}

export default function CursoDetallePage() {
    const params = useParams();
    const slug = params.slug as string;
    const { user } = useAuth();
    const { curso, loading, error, updateProgress } = useCurso(slug, user?.id);

    const [activeModule, setActiveModule] = useState<string | null>(null);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);

    useEffect(() => {
        document.title = curso?.nombre ? `${curso.nombre} | BLIS Corp` : "Cargando curso...";
    }, [curso?.nombre]);

    useEffect(() => {
        const modulos = curso?.modulos as Module[] | undefined;
        if (modulos && modulos.length > 0 && !activeModule) {
            setActiveModule(modulos[0].id);
            if (modulos[0].lessons?.length > 0) {
                setActiveLesson(modulos[0].lessons[0]);
            }
        }
    }, [curso, activeModule]);

    const handleLessonComplete = (lessonId: string) => {
        if (!completedLessons.includes(lessonId)) {
            setCompletedLessons(prev => [...prev, lessonId]);
        }
    };

    const getTotalLessons = () => {
        if (!curso?.modulos) return 0;
        return curso.modulos.reduce((total, mod) => total + (mod.lessons?.length || 0), 0);
    };

    const getProgress = () => {
        const total = getTotalLessons();
        if (total === 0) return 0;
        return Math.round((completedLessons.length / total) * 100);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
            </div>
        );
    }

    if (error || !curso) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
                <GraduationCap className="w-16 h-16 text-gray-600" />
                <p className="text-red-400">{error || "Curso no encontrado"}</p>
                <Link href="/cursos" className="text-blis-red hover:underline">
                    Volver a cursos
                </Link>
            </div>
        );
    }

    const modules = curso.modulos as Module[] || [];

    return (
        <div className="min-h-screen bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-20">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Link href="/cursos" className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </Link>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-blis-red">
                                    Curso
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white uppercase">
                                {curso.nombre}
                            </h1>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Sidebar - Modules */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-bold text-white uppercase tracking-widest">
                                        Contenido
                                    </h2>
                                    <span className="text-xs text-gray-500">
                                        {getProgress()}% completado
                                    </span>
                                </div>

                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-4">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blis-red to-emerald-500 transition-all duration-500"
                                        style={{ width: `${getProgress()}%` }}
                                    />
                                </div>

                                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                    {modules.map((mod, modIndex) => (
                                        <div key={mod.id} className="border border-white/5 rounded-xl overflow-hidden">
                                            <button
                                                onClick={() => setActiveModule(activeModule === mod.id ? null : mod.id)}
                                                className="w-full flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-bold text-gray-500">
                                                        {modIndex + 1}
                                                    </span>
                                                    <span className="text-sm font-medium text-white line-clamp-1">
                                                        {mod.title}
                                                    </span>
                                                </div>
                                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${activeModule === mod.id ? 'rotate-180' : ''}`} />
                                            </button>

                                            {activeModule === mod.id && mod.lessons?.length > 0 && (
                                                <div className="border-t border-white/5">
                                                    {mod.lessons.map((lesson, lessonIndex) => (
                                                        <button
                                                            key={lesson.id}
                                                            onClick={() => setActiveLesson(lesson)}
                                                            className={`w-full flex items-center gap-3 p-3 hover:bg-white/[0.02] transition-colors ${
                                                                activeLesson?.id === lesson.id ? 'bg-white/[0.02]' : ''
                                                            }`}
                                                        >
                                                            <span className="text-[10px] font-bold text-gray-600 w-5">
                                                                {modIndex + 1}.{lessonIndex + 1}
                                                            </span>
                                                            {lesson.type === 'video' ? (
                                                                <Play className="w-4 h-4 text-blis-red" />
                                                            ) : lesson.type === 'quiz' ? (
                                                                <FileText className="w-4 h-4 text-amber-500" />
                                                            ) : (
                                                                <BookOpen className="w-4 h-4 text-blue-500" />
                                                            )}
                                                            <span className="text-sm text-gray-300 line-clamp-1">
                                                                {lesson.title}
                                                            </span>
                                                            {completedLessons.includes(lesson.id) && (
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {curso.precio_coins > 0 && !user && (
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                                    <div className="flex items-center gap-3">
                                        <Lock className="w-5 h-5 text-amber-500" />
                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                Acceso Premium
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Inicia sesión para desbloquear este curso
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content Area */}
                        <div className="lg:col-span-2 space-y-6">
                            {activeLesson ? (
                                <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
                                    {activeLesson.type === 'video' && activeLesson.videoUrl ? (
                                        <div className="aspect-video bg-black">
                                            <iframe
                                                src={activeLesson.videoUrl}
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </div>
                                    ) : (
                                        <div className="aspect-video bg-zinc-800 flex items-center justify-center">
                                            {activeLesson.type === 'video' ? (
                                                <Play className="w-16 h-16 text-gray-600" />
                                            ) : activeLesson.type === 'quiz' ? (
                                                <FileText className="w-16 h-16 text-gray-600" />
                                            ) : (
                                                <BookOpen className="w-16 h-16 text-gray-600" />
                                            )}
                                        </div>
                                    )}

                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-bold text-white">
                                                {activeLesson.title}
                                            </h2>
                                            <button
                                                onClick={() => handleLessonComplete(activeLesson.id)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                                                    completedLessons.includes(activeLesson.id)
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        : 'bg-blis-red text-white hover:bg-blis-red/80'
                                                }`}
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                {completedLessons.includes(activeLesson.id) ? 'Completado' : 'Marcar como completado'}
                                            </button>
                                        </div>

                                        {activeLesson.content && (
                                            <div className="prose prose-invert max-w-none">
                                                <div 
                                                    className="text-gray-300 space-y-4"
                                                    dangerouslySetInnerHTML={{ __html: activeLesson.content }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-12 text-center">
                                    <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400">
                                        Selecciona una lección para comenzar
                                    </p>
                                </div>
                            )}

                            {/* Course Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-zinc-900 border border-white/5 rounded-xl p-4 text-center">
                                    <BookOpen className="w-5 h-5 text-blis-red mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">{modules.length}</p>
                                    <p className="text-xs text-gray-500">Módulos</p>
                                </div>
                                <div className="bg-zinc-900 border border-white/5 rounded-xl p-4 text-center">
                                    <Play className="w-5 h-5 text-blis-red mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">{getTotalLessons()}</p>
                                    <p className="text-xs text-gray-500">Lecciones</p>
                                </div>
                                {curso.precio_coins > 0 && (
                                    <div className="bg-zinc-900 border border-white/5 rounded-xl p-4 text-center">
                                        <Coins className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-white">{curso.precio_coins}</p>
                                        <p className="text-xs text-gray-500">Coins</p>
                                    </div>
                                )}
                                {curso.nota_aprobacion > 0 && (
                                    <div className="bg-zinc-900 border border-white/5 rounded-xl p-4 text-center">
                                        <Award className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-white">{curso.nota_aprobacion}%</p>
                                        <p className="text-xs text-gray-500">Nota mínima</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}