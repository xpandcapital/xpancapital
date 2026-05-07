'use client'

import { Plus, GraduationCap, Loader2 } from 'lucide-react'
import type { Course } from '../_types'
import { CourseCard } from './CourseCard'

interface CourseListProps {
  courses: Course[]
  loading: boolean
  onCreateNew: () => void
  onEdit: (course: Course) => void
  onDelete: (id: string) => void
}

export function CourseList({ courses, loading, onCreateNew, onEdit, onDelete }: CourseListProps) {
  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 px-4 md:px-8 pt-8 md:pt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
        <div className="space-y-1 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-blis-red font-black text-[10px] uppercase tracking-[0.3em]"><GraduationCap className="w-3.5 h-3.5" /> Education HQ</div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">Gestión de Academia</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl leading-tight">Crea, edita y sincroniza tus cursos de alto impacto.</p>
        </div>
        <button onClick={onCreateNew} className="w-full sm:w-auto bg-blis-red text-white px-8 py-4 sm:px-8 sm:py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_10px_40px_rgba(190,11,60,0.3)] mt-4 sm:mt-0"><Plus className="w-5 h-5" /> Nuevo Curso</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-12 text-center">
          <GraduationCap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No tienes cursos creados</p>
          <button onClick={onCreateNew} className="bg-blis-red text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blis-red/80 transition-all">
            Crear primer curso
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
