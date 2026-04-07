"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Clock, Star, Trophy, ChevronRight, Lock, CheckCircle2, Search, ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCursos } from "@/lib/hooks/useCursos";

export default function AcademyPage() {
    const { user } = useAuth();
    const { cursos, loading } = useCursos();
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [activeLesson, setActiveLesson] = useState<any>(null);

    const handleSelectCourse = (course: any) => {
        setSelectedCourse(course);
        const firstModule = course.modulos?.[0];
        const firstLesson = firstModule?.lessons?.[0];
        if (firstLesson) {
            setActiveLesson(firstLesson);
        }
    };

    if (loading) {
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
                <a href="/acceso" className="px-6 py-3 bg-blis-red text-white rounded-xl font-bold">
                    Iniciar Sesión
                </a>
            </div>
        );
    }

    const coursesWithProgress = cursos.map((curso: any) => ({
        ...curso,
        modulos: curso.modulos || [{ id: 'm1', title: 'Módulo 1', lessons: [] }],
        progreso: curso.progreso || { progreso: 0 }
    }));

    return (
        <div className="space-y-8 px-4 md:px-8 pt-8 md:pt-8 w-full mx-auto pb-20">
            <AnimatePresence mode="wait">
                {!selectedCourse ? (
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

                        {coursesWithProgress.length === 0 ? (
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
                                {coursesWithProgress.map((course, i) => (
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
                            onClick={() => setSelectedCourse(null)}
                            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-4 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Volver a mis cursos
                        </button>

                        <div className="flex flex-col xl:flex-row gap-8">
                            {/* Video Player Area */}
                            <div className="flex-1 space-y-6">
                                <div className="aspect-video bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-white/5 relative group cursor-pointer shadow-2xl">
                                    {selectedCourse.imagen_principal ? (
                                        <Image
                                            src={selectedCourse.imagen_principal}
                                            alt="Video Thumbnail"
                                            fill
                                            className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <BookOpen className="w-24 h-24 text-gray-700" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            className="w-24 h-24 rounded-full bg-blis-red flex items-center justify-center shadow-[0_0_50px_rgba(190,11,60,0.8)] z-10"
                                        >
                                            <Play className="w-10 h-10 text-white fill-white ml-2" />
                                        </motion.div>
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex items-center gap-6 text-white">
                                            <Play className="w-5 h-5 fill-current" />
                                            <div className="h-1.5 w-64 bg-white/20 rounded-full overflow-hidden">
                                                <div className="h-full w-1/3 bg-blis-red" />
                                            </div>
                                            <span className="text-[10px] font-mono opacity-60">00:00 / {activeLesson?.duration || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-black/40 border border-white/5 p-8 rounded-[2rem] backdrop-blur-md">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="text-blis-red font-black uppercase tracking-[0.2em] text-[10px] mb-2 block">Viendo Ahora</span>
                                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-4">{activeLesson?.title || 'Selecciona una lección'}</h1>
                                            <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {activeLesson?.duration || 'N/A'}</span>
                                                <span className="flex items-center gap-1.5 text-emerald-500"><Star className="w-4 h-4 fill-emerald-500" /> Premium</span>
                                            </div>
                                        </div>
                                        <button className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-blis-red hover:text-white transition-all">Siguiente Lección</button>
                                    </div>
                                    <p className="text-gray-400 font-medium leading-relaxed max-w-3xl">
                                        {selectedCourse.descripcion || 'Explora los detalles de este curso. Contenido premium para avanzar en tu carrera.'}
                                    </p>
                                </div>
                            </div>

                            {/* Playlist / Modules Sidebar */}
                            <div className="w-full xl:w-[400px] flex flex-col gap-6">
                                <div className="bg-zinc-950 border border-white/5 rounded-[2rem] overflow-hidden flex flex-col h-full shadow-xl">
                                    <div className="p-6 border-b border-white/5 bg-black/40">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-sm font-black text-white uppercase tracking-widest">Temario: {selectedCourse.nombre}</h2>
                                            <Trophy className="w-4 h-4 text-amber-500" />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-white/5 rounded-full border border-white/5">
                                                <div className="h-full bg-blis-red" style={{ width: `${selectedCourse.progreso?.progreso || 0}%` }} />
                                            </div>
                                            <span className="text-[10px] font-black text-white">{selectedCourse.progreso?.progreso || 0}%</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {(selectedCourse.modulos || []).map((module: any) => (
                                            <div key={module.id} className="space-y-2">
                                                <div className="w-full flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                                    <span className="text-[11px] font-black uppercase tracking-tight text-white">{module.title}</span>
                                                    {!module.isOpen && <Lock className="w-3.5 h-3.5 text-gray-700" />}
                                                </div>

                                                <div className="space-y-1 pl-2">
                                                    {(module.lessons || []).map((lesson: any) => (
                                                        <button
                                                            key={lesson.id}
                                                            onClick={() => setActiveLesson(lesson)}
                                                            className={`w-full flex items-center gap-4 p-3.5 rounded-xl transition-all group ${activeLesson?.id === lesson.id ? 'bg-blis-red/20 border border-blis-red/30' : 'hover:bg-white/5'}`}
                                                        >
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${lesson.completed ? 'bg-emerald-500/20 text-emerald-500' : 'bg-black/40 text-gray-500'}`}>
                                                                {lesson.completed ? <CheckCircle2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                            </div>
                                                            <div className="min-w-0 flex-1 text-left">
                                                                <h4 className={`text-xs font-bold truncate ${activeLesson?.id === lesson.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{lesson.title}</h4>
                                                                <span className="text-[9px] font-mono text-gray-600 block mt-0.5">{lesson.duration}</span>
                                                            </div>
                                                            <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${activeLesson?.id === lesson.id ? 'text-white' : 'text-gray-600'}`} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-4 border-t border-white/5 bg-black/40">
                                        <button className="w-full py-4 bg-white/5 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all">Examen de Certificación</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}