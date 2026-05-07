'use client'

import { ChevronRight, Clock, Check } from 'lucide-react'
import type { Course } from '../_types'

interface CourseEditorHeaderProps {
  course: Course
  isSaving: boolean
  onBack: () => void
  onSave: () => void
  onPublish: () => void
  onPreview: () => void
}

export function CourseEditorHeader({ course, isSaving, onBack, onSave, onPublish, onPreview }: CourseEditorHeaderProps) {
  return (
    <div className="sticky top-0 z-[60] bg-black border-b border-white/5 px-4 md:px-8 py-3 flex items-center justify-between -mx-6 -mt-6 mb-6" style={{ marginLeft: 'calc(-1 * (1.5rem + 0px))', marginRight: 'calc(-1 * (1.5rem + 0px))' }}>
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 transition-all"><ChevronRight className="w-3.5 h-3.5 rotate-180" /></button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black text-white uppercase tracking-widest">{course.title || 'Nuevo Curso'}</h1>
            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded bg-white/5 uppercase tracking-[0.2em] ${course.status === 'Publicado' ? 'text-emerald-500' : 'text-amber-500'}`}>{course.status}</span>
          </div>
          <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest flex items-center gap-2 mt-0.5">
            {isSaving ? <span className="text-amber-500 animate-pulse">Guardando...</span> : <span><Check className="w-2.5 h-2.5 inline mr-1 text-emerald-500" /> Sincronizado</span>}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-[9px] font-black text-gray-500 uppercase">
          <Clock className="w-3 h-3" /> {course.lastSaved || '--:--'}
        </div>
        <button onClick={onSave} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-white/5">Guardar</button>
        <button onClick={onPreview} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-white/5">Previsualizar</button>
        <button onClick={onPublish} className="px-5 py-2 bg-blis-red text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blis-red/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Publicar</button>
      </div>
    </div>
  )
}
