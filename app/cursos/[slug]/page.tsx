"use client";

import { useState, useEffect } from "react";
import {
    GraduationCap, Loader2, BookOpen, Play, FileText,
    CheckCircle2, ChevronDown, ChevronRight, MonitorPlay,
    ListChecks, Circle, X, Award, ArrowLeft, ExternalLink
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
    attachments?: string[];
    questions?: { id: string; text: string; options: { id: string; text: string; isCorrect: boolean }[] }[];
}

interface Module {
    id: string;
    title: string;
    description?: string;
    lessons: Lesson[];
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
    video: { icon: MonitorPlay, color: 'text-blue-400', label: 'Video' },
    text: { icon: FileText, color: 'text-gray-400', label: 'Lectura' },
    quiz: { icon: ListChecks, color: 'text-amber-400', label: 'Quiz' },
};

export default function CursoDetallePage() {
    const params = useParams();
    const slug = params.slug as string;
    const { user } = useAuth();
    const { curso, loading, error, updateProgress } = useCurso(slug, user?.id);

    const [activeModule, setActiveModule] = useState<string | null>(null);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [openModules, setOpenModules] = useState<Set<string>>(new Set());

    useEffect(() => {
        document.title = curso?.nombre ? `${curso.nombre} | Xpand Capital` : "Cargando curso...";
    }, [curso?.nombre]);

    useEffect(() => {
        const modulos = curso?.modulos as Module[] | undefined;
        if (modulos && modulos.length > 0 && !activeModule) {
            setActiveModule(modulos[0].id);
            setOpenModules(new Set([modulos[0].id]));
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
            <div className="flex items-center justify-center h-screen bg-black">
                <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
            </div>
        );
    }

    if (error || !curso) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black gap-4">
                <GraduationCap className="w-16 h-16 text-gray-600" />
                <p className="text-red-400">{error || "Curso no encontrado"}</p>
                <Link href="/cursos" className="text-blis-red hover:underline">Volver a cursos</Link>
            </div>
        );
    }

    const modules = curso.modulos as Module[] || [];
    const allLessons = modules.flatMap(m => m.lessons.map(l => ({ lesson: l, moduleId: m.id })));
    const currentIndex = activeLesson ? allLessons.findIndex(item => item.lesson.id === activeLesson.id) : -1;
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex >= 0 && currentIndex < allLessons.length - 1;

    return (
        <div className="flex h-screen bg-black overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 shrink-0 bg-zinc-950 border-r border-white/5 flex flex-col">
                <div className="px-5 py-4 border-b border-white/5 shrink-0">
                    <Link href="/cursos" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-4 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold uppercase tracking-widest text-[10px]">Volver</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        {curso.imagen_principal ? (
                            <img src={curso.imagen_principal} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-blis-red/10 border border-blis-red/20 flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-blis-red" />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <h2 className="text-white font-bold text-sm truncate">{curso.nombre}</h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{completedLessons.length}/{getTotalLessons()} lecciones</p>
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Progreso</span>
                            <span className="text-xs font-bold text-white">{getProgress()}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blis-red to-emerald-500"
                                style={{ width: `${getProgress()}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {modules.map((mod, mIdx) => {
                        const isOpen = openModules.has(mod.id)
                        const moduleLessons = mod.lessons || []
                        const completedInModule = moduleLessons.filter(l => completedLessons.includes(l.id)).length

                        return (
                            <div key={mod.id} className="border-b border-white/[0.03]">
                                <button
                                    onClick={() => {
                                        setOpenModules(prev => {
                                            const next = new Set(prev)
                                            if (next.has(mod.id)) next.delete(mod.id)
                                            else next.add(mod.id)
                                            return next
                                        })
                                    }}
                                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className={`w-6 h-6 rounded-md text-[10px] font-black flex items-center justify-center shrink-0 ${
                                        completedInModule === moduleLessons.length && moduleLessons.length > 0
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-white/5 text-gray-500 border border-white/5'
                                    }`}>
                                        {completedInModule === moduleLessons.length && moduleLessons.length > 0 ? <CheckCircle2 className="w-3.5 h-3.5" /> : mIdx + 1}
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-white text-xs font-bold truncate">{mod.title}</p>
                                        <p className="text-[9px] text-gray-600">{completedInModule}/{moduleLessons.length}</p>
                                    </div>
                                    {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-gray-600 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-600 shrink-0" />}
                                </button>

                                {isOpen && moduleLessons.length > 0 && (
                                    <div className="pb-2">
                                        {moduleLessons.map((lesson) => {
                                            const isActive = activeLesson?.id === lesson.id
                                            const isCompleted = completedLessons.includes(lesson.id)
                                            const typeConfig = TYPE_CONFIG[lesson.type] || TYPE_CONFIG.text
                                            const LessonIcon = typeConfig.icon

                                            return (
                                                <button
                                                    key={lesson.id}
                                                    onClick={() => { setActiveLesson(lesson); setActiveModule(mod.id) }}
                                                    className={`w-full flex items-center gap-3 px-5 py-2.5 transition-all text-left group ${
                                                        isActive ? 'bg-blis-red/5 border-l-2 border-l-blis-red' : 'hover:bg-white/[0.02] border-l-2 border-l-transparent'
                                                    }`}
                                                >
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                                        isCompleted ? 'bg-emerald-500 border-emerald-500' : isActive ? 'border-blis-red bg-blis-red/10' : 'border-gray-700 bg-transparent group-hover:border-gray-500'
                                                    }`}>
                                                        {isCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <LessonIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? typeConfig.color : 'text-gray-600'}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-xs truncate ${isActive ? 'text-white font-bold' : 'text-gray-400 group-hover:text-white'}`}>{lesson.title}</p>
                                                        <p className={`text-[9px] ${isActive ? 'text-blis-red/60' : 'text-gray-700'}`}>{typeConfig.label}</p>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="shrink-0 px-6 py-3 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="min-w-0">
                            {activeLesson && (
                                <>
                                    <p className="text-white font-bold text-sm truncate">{activeLesson.title}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                        Modulo {modules.findIndex(m => m.id === activeModule) + 1} · {TYPE_CONFIG[activeLesson.type]?.label || 'Leccion'}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                            {completedLessons.length}/{getTotalLessons()}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {activeLesson ? (
                        <div className="max-w-4xl mx-auto w-full">
                            {activeLesson.type === 'video' && activeLesson.videoUrl ? (
                                <div className="aspect-video bg-black w-full">
                                    {activeLesson.videoUrl.includes('<iframe') || activeLesson.videoUrl.includes('<script') ? (
                                        <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: activeLesson.videoUrl.replace(/width=".*?"/g, 'width="100%"').replace(/height=".*?"/g, 'height="100%"') }} />
                                    ) : (
                                        <iframe src={activeLesson.videoUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                                    )}
                                </div>
                            ) : activeLesson.type === 'video' ? (
                                <div className="aspect-video bg-gradient-to-br from-zinc-900 to-zinc-950 flex items-center justify-center w-full">
                                    <div className="text-center">
                                        <MonitorPlay className="w-16 h-16 text-gray-700 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm font-bold">Video proximamente</p>
                                    </div>
                                </div>
                            ) : null}

                            <div className="p-8 md:p-12 space-y-8">
                                {activeLesson.type !== 'video' && (
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`w-12 h-12 rounded-2xl ${TYPE_CONFIG[activeLesson.type]?.color || 'text-gray-400'} bg-white/5 border border-white/10 flex items-center justify-center`}>
                                            {(() => { const Icon = TYPE_CONFIG[activeLesson.type]?.icon || FileText; return <Icon className="w-6 h-6" />; })()}
                                        </div>
                                        <div>
                                            <h1 className="text-2xl md:text-3xl font-black text-white">{activeLesson.title}</h1>
                                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">{TYPE_CONFIG[activeLesson.type]?.label || 'Leccion'}</p>
                                        </div>
                                    </div>
                                )}

                                {activeLesson.type === 'video' && (
                                    <h2 className="text-xl font-black text-white">{activeLesson.title}</h2>
                                )}

                                {activeLesson.content && (
                                    <div className="prose prose-invert max-w-none">
                                        <div className="text-gray-300 leading-relaxed space-y-4" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                                    </div>
                                )}

                                {activeLesson.type === 'quiz' && activeLesson.questions && activeLesson.questions.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/10 pb-3">Preguntas del Quiz</h3>
                                        {activeLesson.questions.map((q, qi) => (
                                            <div key={q.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                                                <p className="text-white font-bold text-sm mb-3">{qi + 1}. {q.text}</p>
                                                <div className="space-y-2">
                                                    {q.options.map((opt) => (
                                                        <div key={opt.id} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-sm text-gray-300">
                                                            <div className="w-4 h-4 rounded-full border-2 border-gray-600 shrink-0" />
                                                            {opt.text}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <button
                                        onClick={() => handleLessonComplete(activeLesson.id)}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                                            completedLessons.includes(activeLesson.id)
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                                : 'bg-blis-red text-white hover:bg-blis-red/80 shadow-lg shadow-blis-red/20'
                                        }`}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        {completedLessons.includes(activeLesson.id) ? 'Completado' : 'Marcar como completado'}
                                    </button>

                                    <div className="flex items-center gap-2">
                                        <button onClick={() => { const i = allLessons.findIndex(item => item.lesson.id === activeLesson.id); if (i > 0) { setActiveLesson(allLessons[i-1].lesson); setActiveModule(allLessons[i-1].moduleId) }}} disabled={!hasPrev} className="px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">Anterior</button>
                                        <button onClick={() => { const i = allLessons.findIndex(item => item.lesson.id === activeLesson.id); if (i < allLessons.length - 1) { setActiveLesson(allLessons[i+1].lesson); setActiveModule(allLessons[i+1].moduleId) }}} disabled={!hasNext} className="px-4 py-2.5 bg-blis-red rounded-xl text-white text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-blis-red/20">Siguiente</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-400 font-bold">Selecciona una leccion</p>
                                <p className="text-gray-600 text-sm mt-1">Elige una leccion del menu lateral</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
