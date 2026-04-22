"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    ArrowLeft, GraduationCap, ChevronDown, ChevronRight, Video, FileText,
    HelpCircle, CheckCircle2, Loader2, BookOpen, Play, X, MonitorPlay,
    Clock, Award, Download, ExternalLink, ListChecks, Circle, Lock
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface Lesson {
    id: string
    title: string
    type: 'video' | 'text' | 'quiz'
    content: string
    videoUrl?: string
    attachments?: string[]
    questions?: { id: string; text: string; options: { id: string; text: string; isCorrect: boolean }[] }[]
}

interface Module {
    id: string
    title: string
    description?: string
    lessons: Lesson[]
    isQuizEnabled?: boolean
}

interface CursoData {
    id: string
    nombre: string
    descripcion?: string
    imagen_principal?: string | null
    modulos?: Module[]
    para_equipo?: boolean
    precio_usd?: number
    precio_coins?: number
    sequential_progress?: boolean
    require_completion?: boolean
}

interface EquipoCurso {
    id: string
    curso_id: string
    progreso: number
    estado: string
    lecciones_completadas: string[]
    nota_final: number | null
    cursos: CursoData | null
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
    video: { icon: MonitorPlay, color: 'text-blue-400', label: 'Video' },
    text: { icon: FileText, color: 'text-gray-400', label: 'Lectura' },
    quiz: { icon: ListChecks, color: 'text-amber-400', label: 'Quiz' },
}

export default function CursoViewerPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const cursoId = params.cursoId as string

    const [cursoData, setCursoData] = useState<CursoData | null>(null)
    const [equipoCurso, setEquipoCurso] = useState<EquipoCurso | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
    const [activeModule, setActiveModule] = useState<string | null>(null)
    const [openModules, setOpenModules] = useState<Set<string>>(new Set())
    const [togglingLesson, setTogglingLesson] = useState<string | null>(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [showVideoExpand, setShowVideoExpand] = useState(false)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const [cursoRes, meRes] = await Promise.all([
                fetch(`/api/admin/cursos?id=${cursoId}`),
                user?.email ? fetch(`/api/equipo-cursos/me?email=${encodeURIComponent(user.email)}`) : Promise.resolve({ json: () => Promise.resolve({ success: false, data: [] }) }),
            ])
            const cursoJson = await cursoRes.json()
            const meJson = await meRes.json() as any

            if (cursoRes.ok && cursoJson.data) {
                const curso = Array.isArray(cursoJson.data) ? cursoJson.data[0] : cursoJson.data
                setCursoData(curso)
                if (curso.modulos) {
                    setOpenModules(new Set(curso.modulos.slice(0, 2).map((m: Module) => m.id)))
                    setActiveModule(curso.modulos[0]?.id || null)
                    if (curso.modulos[0]?.lessons?.[0]) {
                        setActiveLesson(curso.modulos[0].lessons[0])
                    }
                }
            }

            if (meJson.success && Array.isArray(meJson.data)) {
                const found = meJson.data.find((ec: any) => ec.curso_id === cursoId)
                if (found) setEquipoCurso(found)
            }
        } catch {}
        finally { setLoading(false) }
    }, [cursoId, user?.email])

    useEffect(() => { fetchData() }, [fetchData])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && showVideoExpand) setShowVideoExpand(false)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [showVideoExpand])

    const toggleModule = (id: string) => {
        setOpenModules(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const selectLesson = (lesson: Lesson, moduleId: string) => {
        setActiveLesson(lesson)
        setActiveModule(moduleId)
        setSidebarOpen(false)
    }

    const toggleLesson = async (leccionId: string, completado: boolean) => {
        if (!equipoCurso) return
        setTogglingLesson(leccionId)
        try {
            let equipoId = equipoCurso.id
            if (equipoId.startsWith('pending-')) {
                const assignRes = await fetch('/api/equipo-cursos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ curso_id: cursoId, email: user?.email }),
                })
                const assignData = await assignRes.json()
                if (!assignData.success) return
                equipoId = assignData.data?.id
                if (!equipoId) return
                await fetchData()
            }

            const res = await fetch('/api/equipo-cursos/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ equipo_curso_id: equipoId, leccion_id: leccionId, completado }),
            })
            const data = await res.json()
            if (data.success) {
                setEquipoCurso(prev => prev ? { ...prev, ...data.data } : prev)
            }
        } catch {}
        finally { setTogglingLesson(null) }
    }

    const navigateLesson = (direction: 'prev' | 'next') => {
        if (!cursoData?.modulos || !activeLesson) return
        const allLessons = cursoData.modulos.flatMap(m => m.lessons.map(l => ({ lesson: l, moduleId: m.id })))
        const currentIndex = allLessons.findIndex(item => item.lesson.id === activeLesson.id)
        if (currentIndex === -1) return
        const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
        if (nextIndex >= 0 && nextIndex < allLessons.length) {
            setActiveLesson(allLessons[nextIndex].lesson)
            setActiveModule(allLessons[nextIndex].moduleId)
        }
    }

    const completedSet = new Set(equipoCurso?.lecciones_completadas || [])
    const modulos: Module[] = cursoData?.modulos || []
    const totalLessons = modulos.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)
    const completedCount = completedSet.size
    const isSequential = cursoData?.sequential_progress || false
    const requireCompletion = cursoData?.require_completion || false

    const isLessonLocked = (mIdx: number, lIdx: number): boolean => {
        if (!isSequential) return false
        if (mIdx === 0 && lIdx === 0) return false
        if (lIdx === 0 && mIdx > 0) {
            const prevModule = modulos[mIdx - 1]
            const prevModuleLessons = prevModule?.lessons || []
            if (prevModuleLessons.length === 0) return false
            const lastLessonOfPrev = prevModuleLessons[prevModuleLessons.length - 1]
            return !completedSet.has(lastLessonOfPrev.id)
        }
        const prevLesson = modulos[mIdx]?.lessons?.[lIdx - 1]
        if (!prevLesson) return false
        return requireCompletion ? !completedSet.has(prevLesson.id) : false
    }

    const allLessons = modulos.flatMap(m => m.lessons.map(l => ({ lesson: l, moduleId: m.id })))
    const currentIndex = activeLesson ? allLessons.findIndex(item => item.lesson.id === activeLesson.id) : -1
    const hasPrev = currentIndex > 0
    const hasNext = currentIndex >= 0 && currentIndex < allLessons.length - 1

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-black"><Loader2 className="w-8 h-8 text-blis-red animate-spin" /></div>
    }

    if (!cursoData) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black gap-4">
                <GraduationCap className="w-16 h-16 text-gray-600" />
                <p className="text-gray-400">Curso no encontrado</p>
                <button onClick={() => router.push('/superadmin/mis-capacitaciones')} className="text-blis-red text-sm hover:underline">Volver a capacitaciones</button>
            </div>
        )
    }

    const sidebarContent = (
        <>
            <div className="px-4 py-3 border-b border-white/5 shrink-0">
                <button onClick={() => router.push('/superadmin/mis-capacitaciones')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-3 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold uppercase tracking-widest text-[10px]">Volver</span>
                </button>
                <div className="flex items-center gap-3">
                    {cursoData.imagen_principal ? (
                        <img src={cursoData.imagen_principal} alt="" className="w-9 h-9 rounded-lg object-cover border border-white/10" />
                    ) : (
                        <div className="w-9 h-9 rounded-lg bg-blis-red/10 border border-blis-red/20 flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-blis-red" />
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <h2 className="text-white font-bold text-xs truncate">{cursoData.nombre}</h2>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{completedCount}/{totalLessons} lecciones</p>
                    </div>
                </div>
                <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Progreso</span>
                        <span className="text-[11px] font-bold text-white">{equipoCurso?.progreso || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${equipoCurso?.progreso || 0}%`,
                                background: (equipoCurso?.progreso || 0) >= 100 ? '#10b981' : (equipoCurso?.progreso || 0) > 0 ? '#f59e0b' : '#3b82f6'
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {modulos.map((modulo, mIdx) => {
                    const isOpen = openModules.has(modulo.id)
                    const moduleLessons = modulo.lessons || []
                    const completedInModule = moduleLessons.filter(l => completedSet.has(l.id)).length

                    return (
                        <div key={modulo.id} className="border-b border-white/[0.03]">
                            <button
                                onClick={() => toggleModule(modulo.id)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
                            >
                                <div className={`w-6 h-6 rounded-md text-[10px] font-black flex items-center justify-center shrink-0 ${
                                    completedInModule === moduleLessons.length && moduleLessons.length > 0
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-white/5 text-gray-500 border border-white/5'
                                }`}>
                                    {completedInModule === moduleLessons.length && moduleLessons.length > 0 ? <CheckCircle2 className="w-3.5 h-3.5" /> : mIdx + 1}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <p className="text-white text-xs font-bold truncate">{modulo.title}</p>
                                    <p className="text-[9px] text-gray-600">{completedInModule}/{moduleLessons.length}</p>
                                </div>
                                {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-gray-600 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-600 shrink-0" />}
                            </button>

                            {isOpen && moduleLessons.length > 0 && (
                                <div className="pb-2">
                                    {moduleLessons.map((lesson, lIdx) => {
                                        const isActive = activeLesson?.id === lesson.id
                                        const isCompleted = completedSet.has(lesson.id)
                                        const isLocked = isLessonLocked(mIdx, lIdx)
                                        const typeConfig = TYPE_CONFIG[lesson.type] || TYPE_CONFIG.text
                                        const LessonIcon = typeConfig.icon

                                        return (
                                            <button
                                                key={lesson.id}
                                                onClick={() => !isLocked && selectLesson(lesson, modulo.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all text-left group ${isLocked ? 'opacity-40 cursor-not-allowed' : isActive ? 'bg-blis-red/5 border-l-2 border-l-blis-red' : 'hover:bg-white/[0.02] border-l-2 border-l-transparent'}`}
                                            >
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                                    isCompleted
                                                        ? 'bg-emerald-500 border-emerald-500'
                                                        : isLocked
                                                            ? 'border-gray-800 bg-transparent'
                                                            : isActive
                                                                ? 'border-blis-red bg-blis-red/10'
                                                                : 'border-gray-700 bg-transparent group-hover:border-gray-500'
                                                }`}>
                                                    {isCompleted ? (
                                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                                    ) : isLocked ? (
                                                        <Lock className="w-2.5 h-2.5 text-gray-600" />
                                                    ) : (
                                                        <Circle className="w-2.5 h-2.5 hidden" />
                                                    )}
                                                </div>
                                                {isLocked ? <Lock className="w-3 h-3 text-gray-600 shrink-0" /> : <LessonIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? typeConfig.color : 'text-gray-600'}`} />}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs truncate ${isLocked ? 'text-gray-600' : isActive ? 'text-white font-bold' : 'text-gray-400 group-hover:text-white'}`}>{lesson.title}</p>
                                                    <p className={`text-[9px] ${isLocked ? 'text-gray-700' : isActive ? 'text-blis-red/60' : 'text-gray-700'}`}>{isLocked ? 'Bloqueado' : typeConfig.label}</p>
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
        </>
    )

    return (
        <div className="flex flex-col md:flex-row h-[calc(100dvh-5rem)] md:h-[calc(100vh-5rem)] bg-black overflow-hidden -mx-4 md:mx-0 -mt-4 md:mt-0 -mb-0 md:mb-0 -ml-14 md:ml-0">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-80 shrink-0 bg-zinc-950 border-r border-white/5 flex-col">
                {sidebarContent}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Bar */}
                <div className="shrink-0 px-4 md:px-6 py-3 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="hidden md:flex p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all"
                        >
                            <BookOpen className="w-4 h-4" />
                        </button>
                        {activeLesson && (
                            <div className="min-w-0">
                                <p className="text-white font-bold text-sm truncate">{activeLesson.title}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold hidden md:block">
                                    Módulo {modulos.findIndex(m => m.id === activeModule) + 1} · {TYPE_CONFIG[activeLesson.type]?.label || 'Lección'}
                                </p>
                            </div>
                        )}
                    </div>
                    {equipoCurso?.estado === 'completado' && (
                        <span className="text-[9px] font-bold px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest flex items-center gap-1 shrink-0">
                            <Award className="w-3 h-3" /> Completado
                        </span>
                    )}
                </div>

                {/* Lesson Content */}
                <div className="flex-1 overflow-y-auto pb-4 md:pb-0">
                    {activeLesson ? (
                        <div className="max-w-4xl mx-auto w-full">
                            {activeLesson.type === 'video' && activeLesson.videoUrl ? (
                                <div className="relative aspect-video bg-black w-full">
                                    {activeLesson.videoUrl.includes('<iframe') || activeLesson.videoUrl.includes('<script') ? (
                                        <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: activeLesson.videoUrl.replace(/width=".*?"/g, 'width="100%"').replace(/height=".*?"/g, 'height="100%"') }} />
                                    ) : (
                                        <iframe
                                            src={activeLesson.videoUrl}
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    )}
                                    <button
                                        onClick={() => setShowVideoExpand(true)}
                                        className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-sm rounded-lg text-white/80 hover:text-white hover:bg-black/80 transition-all"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : activeLesson.type === 'video' ? (
                                <div className="aspect-video bg-gradient-to-br from-zinc-900 to-zinc-950 flex items-center justify-center w-full">
                                    <div className="text-center px-4">
                                        <MonitorPlay className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm font-bold">Video próximamente</p>
                                        <p className="text-gray-600 text-xs mt-1">Esta lección aún no tiene video</p>
                                    </div>
                                </div>
                            ) : null}

                            <div className="p-4 md:p-8 md:pt-6 space-y-6 md:space-y-8">
                                {activeLesson.type !== 'video' && (
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${TYPE_CONFIG[activeLesson.type]?.color || 'text-gray-400'} bg-white/5 border border-white/10 flex items-center justify-center`}>
                                            {(() => { const Icon = TYPE_CONFIG[activeLesson.type]?.icon || FileText; return <Icon className="w-5 h-5 md:w-6 md:h-6" /> })()}
                                        </div>
                                        <div className="min-w-0">
                                            <h1 className="text-lg md:text-2xl font-black text-white">{activeLesson.title}</h1>
                                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-0.5">{TYPE_CONFIG[activeLesson.type]?.label || 'Lección'}</p>
                                        </div>
                                    </div>
                                )}

                                {activeLesson.type === 'video' && (
                                    <div className="flex items-start gap-3 mt-4">
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-lg md:text-xl font-black text-white">{activeLesson.title}</h2>
                                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">Lección en video</p>
                                        </div>
                                    </div>
                                )}

                                {activeLesson.content && (
                                    <div className="prose prose-invert max-w-none">
                                        <div
                                            className="text-gray-300 leading-relaxed space-y-4 [&_h1]:text-xl md:[&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-white [&_h1]:uppercase [&_h1]:tracking-tighter [&_h2]:text-lg md:[&_h2]:text-xl [&_h2]:font-black [&_h2]:text-white [&_h2]:uppercase [&_h2]:tracking-tight [&_p]:text-gray-300 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1 [&_strong]:text-white [&_a]:text-blis-red [&_a]:hover:text-blis-red/80 [&_blockquote]:border-l-4 [&_blockquote]:border-blis-red [&_blockquote]:bg-white/5 [&_blockquote]:p-4 [&_blockquote]:rounded-r-xl"
                                            dangerouslySetInnerHTML={{ __html: activeLesson.content }}
                                        />
                                    </div>
                                )}

                                {activeLesson.type === 'quiz' && activeLesson.questions && activeLesson.questions.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/10 pb-3">Preguntas del Quiz</h3>
                                        {activeLesson.questions.map((q, qi) => (
                                            <div key={q.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 md:p-5">
                                                <p className="text-white font-bold text-sm mb-3">{qi + 1}. {q.text}</p>
                                                <div className="space-y-2">
                                                    {q.options.map((opt) => (
                                                        <div key={opt.id} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-sm text-gray-300 cursor-not-allowed">
                                                            <div className="w-4 h-4 rounded-full border-2 border-gray-600 shrink-0" />
                                                            {opt.text}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Action Bar - mobile friendly */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 border-t border-white/5">
                                    <button
                                        onClick={() => toggleLesson(activeLesson.id, !completedSet.has(activeLesson.id))}
                                        disabled={togglingLesson === activeLesson.id}
                                        className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 ${
                                            completedSet.has(activeLesson.id)
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                                : 'bg-blis-red text-white hover:bg-blis-red/80 shadow-lg shadow-blis-red/20'
                                        }`}
                                    >
                                        {togglingLesson === activeLesson.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : completedSet.has(activeLesson.id) ? (
                                            <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                            <Circle className="w-4 h-4" />
                                        )}
                                        {completedSet.has(activeLesson.id) ? 'Completado' : 'Marcar como completado'}
                                    </button>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => navigateLesson('prev')}
                                            disabled={!hasPrev}
                                            className="flex-1 sm:flex-none px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            Anterior
                                        </button>
                                        <button
                                            onClick={() => navigateLesson('next')}
                                            disabled={!hasNext}
                                            className="flex-1 sm:flex-none px-4 py-3 bg-blis-red rounded-xl text-white text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-blis-red/20"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                </div>

                                {/* Mobile Course Tree - always visible below action buttons */}
                                <div className="md:hidden mt-6 border-t border-white/10 pt-4">
                                    <button
                                        onClick={() => setSidebarOpen(!sidebarOpen)}
                                        className="flex items-center justify-between w-full mb-3"
                                    >
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-blis-red" />
                                            <span className="text-xs font-black text-white uppercase tracking-widest">Contenido del curso</span>
                                            <span className="text-[10px] text-gray-500">{completedCount}/{totalLessons}</span>
                                        </div>
                                        {sidebarOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                                    </button>

                                    {sidebarOpen && (
                                        <div className="space-y-1 max-h-[50vh] overflow-y-auto">
                                            {modulos.map((modulo, mIdx) => {
                                                const isOpen = openModules.has(modulo.id)
                                                const moduleLessons = modulo.lessons || []
                                                const completedInModule = moduleLessons.filter(l => completedSet.has(l.id)).length

                                                return (
                                                    <div key={modulo.id} className="border-b border-white/[0.03] last:border-b-0">
                                                        <button
                                                            onClick={() => toggleModule(modulo.id)}
                                                            className="w-full flex items-center gap-2 py-2.5 px-2 hover:bg-white/[0.02] transition-colors"
                                                        >
                                                            <div className={`w-5 h-5 rounded text-[9px] font-black flex items-center justify-center shrink-0 ${
                                                                completedInModule === moduleLessons.length && moduleLessons.length > 0
                                                                    ? 'bg-emerald-500/10 text-emerald-400'
                                                                    : 'bg-white/5 text-gray-500'
                                                            }`}>
                                                                {completedInModule === moduleLessons.length && moduleLessons.length > 0 ? <CheckCircle2 className="w-3 h-3" /> : mIdx + 1}
                                                            </div>
                                                            <div className="flex-1 text-left min-w-0">
                                                                <p className="text-white text-[11px] font-bold truncate">{modulo.title}</p>
                                                                <p className="text-[9px] text-gray-600">{completedInModule}/{moduleLessons.length}</p>
                                                            </div>
                                                            {isOpen ? <ChevronDown className="w-3 h-3 text-gray-600 shrink-0" /> : <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />}
                                                        </button>

                                                        {isOpen && moduleLessons.length > 0 && (
                                                            <div className="pb-1">
                                                                {moduleLessons.map((lesson, lIdx) => {
                                                                    const isActive = activeLesson?.id === lesson.id
                                                                    const isCompleted = completedSet.has(lesson.id)
                                                                    const isLocked = isLessonLocked(mIdx, lIdx)
                                                                    const typeConfig = TYPE_CONFIG[lesson.type] || TYPE_CONFIG.text

                                                                    return (
                                                                        <button
                                                                            key={lesson.id}
                                                                            onClick={() => !isLocked && selectLesson(lesson, modulo.id)}
                                                                            className={`w-full flex items-center gap-2 px-3 py-2 transition-all text-left ${isLocked ? 'opacity-40 cursor-not-allowed' : isActive ? 'bg-blis-red/10' : 'hover:bg-white/[0.02]'}`}
                                                                        >
                                                                            {isCompleted ? (
                                                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                                                            ) : isLocked ? (
                                                                                <Lock className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                                                                            ) : (
                                                                                <Circle className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                                                                            )}
                                                                            <span className={`text-[11px] truncate flex-1 ${isLocked ? 'text-gray-600' : isActive ? 'text-white font-bold' : 'text-gray-400'}`}>{lesson.title}</span>
                                                                            <span className={`text-[9px] shrink-0 ${isLocked ? 'text-gray-700' : isActive ? 'text-blis-red' : 'text-gray-700'}`}>{isLocked ? '' : typeConfig.label}</span>
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full p-4">
                            <div className="text-center">
                                <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-400 font-bold">Selecciona una lección</p>
                                <p className="text-gray-600 text-sm mt-1">
                                    <span className="md:hidden">Toca el botón de menú</span>
                                    <span className="hidden md:inline">Elige una lección del menú lateral</span>
                                </p>
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="md:hidden mt-4 px-4 py-2 bg-blis-red text-white text-xs font-bold rounded-lg"
                                >
                                    Ver lecciones
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Fullscreen Video Overlay */}
            {showVideoExpand && activeLesson?.videoUrl && (
                <div className="fixed inset-0 z-[9999] bg-black flex flex-col" onClick={() => setShowVideoExpand(false)}>
                    <div className="flex items-center justify-between px-4 py-2 bg-zinc-950 border-b border-white/10 shrink-0">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest truncate">{activeLesson.title}</span>
                        <button onClick={() => setShowVideoExpand(false)} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                        {activeLesson.videoUrl.includes('<iframe') || activeLesson.videoUrl.includes('<script') ? (
                            <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: activeLesson.videoUrl.replace(/width=".*?"/g, 'width="100%"').replace(/height=".*?"/g, 'height="100%"') }} />
                        ) : (
                            <iframe
                                src={activeLesson.videoUrl}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}