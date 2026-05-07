'use client'

import { Eye, Settings, Trash2, Layers, Video, GraduationCap, Users } from 'lucide-react'
import type { Course } from '../_types'

interface CourseCardProps {
  course: Course
  onEdit: (course: Course) => void
  onDelete: (id: string) => void
}

export function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  return (
    <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-6 space-y-5 hover:border-white/10 transition-all flex flex-col group relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blis-red/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blis-red/10 transition-colors" />
      <div className="aspect-square w-full bg-zinc-900 rounded-xl border border-white/5 overflow-hidden relative shadow-2xl group-hover:scale-[1.02] transition-transform duration-700">
        {course.image ? <img src={course.image} className="w-full h-full object-cover" alt="Course" /> : <div className="absolute inset-0 flex items-center justify-center text-zinc-800"><GraduationCap className="w-16 h-16 opacity-10" /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(course)} className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all text-black"><Eye className="w-6 h-6" /></button>
        </div>
        <div className="absolute top-6 left-6 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[8px] font-black text-white/50 uppercase tracking-widest border border-white/10 uppercase">{course.category}</div>
        {course.paraEquipo && <div className="absolute top-6 right-6 px-3 py-1 bg-amber-500/20 backdrop-blur-md rounded-lg text-[8px] font-black text-amber-400 uppercase tracking-widest border border-amber-500/30 flex items-center gap-1"><Users className="w-3 h-3" /> Equipo</div>}
      </div>
      <div className="space-y-4 flex-1">
        <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-tight group-hover:text-blis-red transition-colors">{course.title || 'Sin título'}</h3>
        <div className="flex items-center gap-4 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> {course.modules.length} Módulos</span>
          <span className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Secciones</span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-8 border-t border-white/5 mt-auto">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Inversión VIP</span>
          <span className="text-xl font-black text-white tracking-tighter">${course.price} <span className="text-[10px] text-gray-500">USD</span></span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onDelete(course.id)} className="p-4 bg-white/5 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all"><Trash2 className="w-5 h-5" /></button>
          <button onClick={() => onEdit(course)} className="p-4 bg-white/10 rounded-2xl text-white hover:bg-white/20 transition-all"><Settings className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  )
}
