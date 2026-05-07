'use client'

import { motion } from 'framer-motion'
import { Video, ListChecks, Trash2, X, LinkIcon, Sparkles } from 'lucide-react'
import type { Module, Lesson } from '../_types'
import { RichTextEditor } from './RichTextEditor'

interface LessonEditorProps {
  module: Module
  lesson: Lesson
  lIdx: number
  isGeneratingAI: string | null
  onUpdateLesson: (moduleId: string, lessonId: string, data: Partial<Lesson>) => void
  onDeleteLesson: (moduleId: string, lessonId: string) => void
  onAddQuestion: (moduleId: string, lessonId: string) => void
  onDeleteQuestion: (moduleId: string, lessonId: string, questionId: string) => void
  onUpdateQuestion: (moduleId: string, lessonId: string, questionId: string, data: Partial<import('../_types').Question>) => void
  onGenerateQuizAI: (moduleId: string, lessonId: string) => void
  lessonRef: (el: HTMLElement | null) => void
}

export function LessonEditor({
  module, lesson, lIdx, isGeneratingAI,
  onUpdateLesson, onDeleteLesson,
  onAddQuestion, onDeleteQuestion, onUpdateQuestion,
  onGenerateQuizAI, lessonRef
}: LessonEditorProps) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      key={lesson.id}
      ref={lessonRef}
      className="bg-zinc-950/40 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 space-y-6 md:space-y-8 relative group ring-offset-black transition-all"
    >
      <div className="absolute top-8 right-8 flex gap-2"><div className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-gray-500 uppercase">Lección {lIdx + 1}</div></div>
      <div className="flex items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-blis-red/20 flex items-center justify-center text-blis-red">{lesson.type === 'video' ? <Video className="w-6 h-6" /> : <ListChecks className="w-6 h-6" />}</div>
        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Título de la Lección</label>
            <input
              value={lesson.title}
              onChange={(e) => onUpdateLesson(module.id, lesson.id, { title: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-white focus:outline-none focus:border-blis-red/50 transition-all"
              placeholder="Título de la lección..."
            />
          </div>
          <div className="flex gap-4">
            <button onClick={() => onUpdateLesson(module.id, lesson.id, { type: 'video' })} className={`text-[10px] font-black uppercase tracking-widest ${lesson.type === 'video' ? 'text-blis-red' : 'text-gray-600'}`}>Video</button>
            <button onClick={() => onUpdateLesson(module.id, lesson.id, { type: 'text' })} className={`text-[10px] font-black uppercase tracking-widest ${lesson.type === 'text' ? 'text-blis-red' : 'text-gray-600'}`}>Lectura</button>
            <button onClick={() => onUpdateLesson(module.id, lesson.id, { type: 'quiz' })} className={`text-[10px] font-black uppercase tracking-widest ${lesson.type === 'quiz' ? 'text-blis-red' : 'text-gray-600'}`}>Examen</button>
          </div>
        </div>
      </div>
      <div className="space-y-4 pt-4 border-t border-white/5">
        {lesson.type === 'video' && (
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase">URL del Video (o Embed)</label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <textarea value={lesson.videoUrl || ''} onChange={(e) => onUpdateLesson(module.id, lesson.id, { videoUrl: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm text-gray-300 focus:outline-none focus:border-blis-red min-h-[60px]" placeholder="Link YouTube/Vimeo o <iframe>..." />
            </div>
            {lesson.videoUrl && <div className="mt-4 aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/5 flex items-center justify-center">{lesson.videoUrl.includes('<iframe') ? <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: lesson.videoUrl.replace(/width=".*?"/g, 'width="100%"').replace(/height=".*?"/g, 'height="100%"') }} /> : <div className="text-[10px] font-black text-gray-600 uppercase">Vista previa cargada</div>}</div>}
          </div>
        )}
        {lesson.type === 'quiz' && (
          <div className="space-y-6 pt-4 border-b border-white/5 pb-8">
            <div className="flex justify-between items-center px-4">
              <div className="flex items-center gap-4">
                <h4 className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2"><ListChecks className="w-3.5 h-3.5" /> Estructura del Examen</h4>
                <button
                  onClick={() => onUpdateLesson(module.id, lesson.id, { isQuizEnabled: !lesson.isQuizEnabled })}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest transition-all ${lesson.isQuizEnabled ? 'bg-blis-red/10 border-blis-red/30 text-blis-red' : 'bg-white/5 border-white/10 text-gray-600'}`}
                >
                  {lesson.isQuizEnabled ? 'Activado' : 'Desactivado'}
                </button>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => onGenerateQuizAI(module.id, lesson.id)}
                  disabled={isGeneratingAI === lesson.id}
                  className={`text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:underline disabled:opacity-50 ${isGeneratingAI === lesson.id ? 'animate-pulse' : ''}`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> {isGeneratingAI === lesson.id ? 'Leyendo Video...' : 'Generar con IA'}
                </button>
                <button onClick={() => onAddQuestion(module.id, lesson.id)} className="text-blis-red text-[10px] font-black uppercase tracking-widest hover:underline">+ Agregar Pregunta</button>
              </div>
            </div>
            <div className="space-y-6">
              {(lesson.questions || []).map((q, qIdx) => (
                <div key={q.id} className="p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] space-y-6 relative group/q">
                  <button onClick={() => onDeleteQuestion(module.id, lesson.id, q.id)} className="absolute top-6 right-6 p-2 text-gray-600 hover:text-red-500 opacity-0 group-hover/q:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                  <div className="flex gap-4"><span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-500 flex-shrink-0">{qIdx + 1}</span><input className="bg-transparent border-none p-0 text-white font-bold placeholder:text-gray-700 focus:outline-none w-full border-b border-white/5 pb-2" placeholder="Pregunta..." value={q.text} onChange={(e) => onUpdateQuestion(module.id, lesson.id, q.id, { text: e.target.value })} /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 ml-0 md:ml-12">
                    {q.options.map((opt, oIdx) => (
                      <div key={opt.id} className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer group/opt ${opt.isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5'}`} onClick={() => { const newOptions = q.options.map((o, idx) => ({ ...o, isCorrect: idx === oIdx })); onUpdateQuestion(module.id, lesson.id, q.id, { options: newOptions }) }}>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${opt.isCorrect ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}>{opt.isCorrect && <div className="w-1.5 h-1.5 bg-white rounded-full" />}</div>
                        <input className="bg-transparent border-none text-[11px] text-gray-300 focus:outline-none w-full" value={opt.text} onClick={(e) => e.stopPropagation()} onChange={(e) => { const newOptions = [...q.options]; newOptions[oIdx] = { ...newOptions[oIdx], text: e.target.value }; onUpdateQuestion(module.id, lesson.id, q.id, { options: newOptions }) }} />
                        {q.options.length > 2 && <button onClick={(e) => { e.stopPropagation(); const newOptions = q.options.filter((_, idx) => idx !== oIdx); onUpdateQuestion(module.id, lesson.id, q.id, { options: newOptions }) }} className="opacity-0 group-hover/opt:opacity-100 p-1 hover:text-red-500 transition-all"><X className="w-3 h-3" /></button>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {lesson.type === 'text' && (
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Contenido de la Lección</label>
            <RichTextEditor
              value={lesson.content}
              onChange={(val) => onUpdateLesson(module.id, lesson.id, { content: val })}
              placeholder="Escribe el contenido detallado aquí..."
            />
          </div>
        )}
      </div>
    </motion.section>
  )
}
