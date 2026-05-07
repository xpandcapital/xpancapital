'use client'

import { X, Layers, Video, ListChecks, DollarSign, FileText } from 'lucide-react'
import type { Course } from '../_types'

interface PreviewModalProps {
  course: Course
  onClose: () => void
}

export function PreviewModal({ course, onClose }: PreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden" style={{ zIndex: 999999 }}>
      <div className="flex items-center justify-between px-8 py-4 bg-zinc-950 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">Vista Previa del Curso</span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-5 py-2 bg-blis-red hover:bg-blis-red/80 rounded-xl text-white transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <X className="w-4 h-4" /> Cerrar Vista Previa
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-8 md:p-16 max-w-4xl mx-auto w-full space-y-10">
        {course.image && (
          <img src={course.image} alt="Portada" className="w-full max-h-80 object-cover rounded-3xl shadow-2xl" />
        )}
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[9px] font-black px-3 py-1 rounded-lg bg-blis-red/10 text-blis-red border border-blis-red/20 uppercase tracking-widest">{course.category}</span>
            <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border ${course.status === 'Publicado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{course.status}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">{course.title || 'Sin Título'}</h1>
          <div className="flex items-center gap-6 text-gray-500 font-bold text-xs uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Layers className="w-4 h-4" /> {course.modules.length} Módulos</span>
            <span className="flex items-center gap-1.5"><Video className="w-4 h-4" /> {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lecciones</span>
            <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-emerald-500" /> ${course.price} USD</span>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] border-b border-white/5 pb-3">Contenido del Curso</h2>
          {course.modules.map((mod, i) => (
            <div key={mod.id} className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 bg-white/[0.02] flex items-center gap-4">
                <span className="text-[9px] font-black text-blis-red bg-blis-red/10 rounded-lg px-2 py-1 border border-blis-red/20">M{i + 1}</span>
                <h3 className="font-black text-white text-sm">{mod.title}</h3>
                <span className="ml-auto text-[9px] text-gray-600 font-bold uppercase">{mod.lessons.length} lecciones</span>
              </div>
              {mod.description && (
                <div className="px-6 py-3 border-t border-white/5 text-sm text-gray-400 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: mod.description }} />
              )}
              <div className="divide-y divide-white/5">
                {mod.lessons.map((les, j) => (
                  <div key={les.id} className="px-6 py-3 flex items-center gap-4">
                    <span className="text-[9px] text-gray-600 font-black w-5 text-center">{j + 1}</span>
                    {les.type === 'video' ? <Video className="w-3.5 h-3.5 text-gray-600" /> : les.type === 'quiz' ? <ListChecks className="w-3.5 h-3.5 text-gray-600" /> : <FileText className="w-3.5 h-3.5 text-gray-600" />}
                    <span className="text-sm text-gray-300 font-bold">{les.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


