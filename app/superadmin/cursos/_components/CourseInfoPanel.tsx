'use client'

import { Plus, GripVertical, Layers, Video, ListChecks, Edit, Trash2, X, EyeOff, FileText } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Course, EditingItem, ConfirmDelete } from '../_types'

interface CourseInfoPanelProps {
  course: Course
  editingItem: EditingItem
  draggedItem: { type: 'module' | 'lesson'; id: string; moduleId?: string } | null
  onSetDraggedItem: (item: { type: 'module' | 'lesson'; id: string; moduleId?: string } | null) => void
  onSetEditingItem: (item: EditingItem) => void
  onSetConfirmDelete: (item: ConfirmDelete) => void
  onAddModule: () => void
  onAddLesson: (moduleId: string) => void
  onToggleModule: (id: string, isOpen: boolean) => void
  onMoveModule: (fromIdx: number, toIdx: number) => void
  onReorderLesson: (moduleId: string, fromIdx: number, toIdx: number) => void
  onMoveLessonBetweenModules: (lessonId: string, fromModuleId: string, toModuleId: string, toIdx: number) => void
  onScrollToItem: (id: string) => void
  canEdit: boolean
}

export function CourseInfoPanel({
  course, editingItem, draggedItem,
  onSetDraggedItem, onSetEditingItem, onSetConfirmDelete,
  onAddModule, onAddLesson, onToggleModule,
  onMoveModule, onReorderLesson, onMoveLessonBetweenModules,
  onScrollToItem, canEdit
}: CourseInfoPanelProps) {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-950 border border-white/5 rounded-[2rem] p-6 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
          <h3 className="font-black text-white text-xs uppercase tracking-widest">Lecciones</h3>
          <button onClick={onAddModule} className="text-blis-red hover:scale-110 transition-transform flex items-center gap-1">
            <Plus className="w-4 h-4" /><span className="text-[9px] font-black uppercase">Módulo</span>
          </button>
        </div>
        <div className="space-y-4">
          {course.modules.map((module, mIdx) => (
            <div
              key={module.id}
              className="space-y-2"
              onDragOver={(e) => {
                e.preventDefault()
                if (draggedItem?.type === 'module') e.currentTarget.classList.add('border-t-2', 'border-blis-red')
              }}
              onDragLeave={(e) => e.currentTarget.classList.remove('border-t-2', 'border-blis-red')}
              onDrop={(e) => {
                e.preventDefault()
                e.currentTarget.classList.remove('border-t-2', 'border-blis-red')
                if (draggedItem?.type === 'module') {
                  const fromIdx = course.modules.findIndex(m => m.id === draggedItem.id)
                  onMoveModule(fromIdx, mIdx)
                }
              }}
            >
              <div
                draggable
                onDragStart={() => onSetDraggedItem({ type: 'module', id: module.id })}
                onDragEnd={() => onSetDraggedItem(null)}
                onClick={() => onToggleModule(module.id, !module.isOpen)}
                className="group p-4 bg-white/[0.04] border border-white/5 rounded-2xl flex items-center justify-between hover:border-blis-red/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <GripVertical className="w-3.5 h-3.5 text-gray-700 group-hover:text-blis-red transition-colors cursor-grab active:cursor-grabbing" />
                  <div className="relative">
                    <Layers className={`w-3.5 h-3.5 ${module.isOpen ? 'text-blis-red' : 'text-gray-600'}`} />
                    {module.questions && module.questions.length > 0 && (
                      <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-amber-500 rounded-full border border-black shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-white truncate">{module.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); onAddLesson(module.id) }} className="p-1 px-1.5 bg-blis-red/10 text-blis-red rounded-lg hover:bg-blis-red/20 transition-all" title="Nueva Lección"><Plus className="w-3 h-3" /></button>
                  <button onClick={(e) => { e.stopPropagation(); if (!canEdit) return; onSetEditingItem({ type: 'module', id: module.id }); onScrollToItem(module.id) }} className={`p-1.5 rounded-lg transition-all ${editingItem?.id === module.id ? 'bg-blis-red text-white' : 'hover:bg-white/10 text-gray-600'}`} title="Editar Módulo"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={(e) => { e.stopPropagation(); onSetConfirmDelete({ type: 'module', id: module.id, title: module.title }) }} className="p-1 px-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <AnimatePresence>
                {module.isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pl-4 space-y-2 overflow-hidden py-1"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault(); e.stopPropagation()
                      if (draggedItem?.type === 'lesson') {
                        if (draggedItem.moduleId === module.id) {
                          const fromIdx = module.lessons.findIndex(l => l.id === draggedItem.id)
                          onReorderLesson(module.id, fromIdx, module.lessons.length)
                        } else if (draggedItem.moduleId) {
                          onMoveLessonBetweenModules(draggedItem.id, draggedItem.moduleId, module.id, module.lessons.length)
                        }
                      }
                    }}
                  >
                    {module.lessons.map((lesson, lIdx) => (
                      <div
                        key={lesson.id}
                        draggable
                        onDragStart={(e) => { e.stopPropagation(); onSetDraggedItem({ type: 'lesson', id: lesson.id, moduleId: module.id }) }}
                        onDragEnd={() => onSetDraggedItem(null)}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add('border-t-2', 'border-blis-red') }}
                        onDragLeave={(e) => e.currentTarget.classList.remove('border-t-2', 'border-blis-red')}
                        onDrop={(e) => {
                          e.preventDefault(); e.stopPropagation()
                          e.currentTarget.classList.remove('border-t-2', 'border-blis-red')
                          if (draggedItem?.type === 'lesson') {
                            if (draggedItem.moduleId === module.id) {
                              const fromIdx = module.lessons.findIndex(l => l.id === draggedItem.id)
                              onReorderLesson(module.id, fromIdx, lIdx)
                            } else if (draggedItem.moduleId) {
                              onMoveLessonBetweenModules(draggedItem.id, draggedItem.moduleId, module.id, lIdx)
                            }
                          }
                        }}
                        className="group p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center gap-3 hover:border-blis-red/20 transition-all cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="w-3 h-3 text-gray-800 group-hover:text-blis-red/50 transition-colors" />
                        <div className="p-1.5 rounded-lg bg-white/5 text-gray-500 group-hover:text-blis-red">
                          {lesson.type === 'video' ? <Video className="w-3 h-3" /> : lesson.type === 'quiz' ? <ListChecks className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                        </div>
                        <p className="text-[10px] font-bold text-gray-300 truncate flex-1">{lesson.title}</p>
                        <div className="flex items-center gap-1">
                          <button onClick={(e) => { e.stopPropagation(); if (!canEdit) return; onSetEditingItem({ type: 'lesson', id: lesson.id, moduleId: module.id }); onScrollToItem(lesson.id) }} className={`p-1.5 rounded-lg transition-all ${editingItem?.id === lesson.id ? 'bg-blis-red text-white' : 'hover:bg-white/10 text-gray-600'}`} title="Editar Lección"><Edit className="w-3 h-3" /></button>
                          <button onClick={(e) => { e.stopPropagation(); onSetConfirmDelete({ type: 'lesson', id: lesson.id, moduleId: module.id, title: lesson.title }) }} className="p-1 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ))}

                    {module.questions && module.questions.length > 0 && (
                      <div
                        onClick={(e) => { e.stopPropagation(); if (!canEdit) return; onSetEditingItem({ type: 'module', id: module.id }); onScrollToItem(module.id) }}
                        className={`p-3 bg-white/[0.04] border rounded-xl flex items-center gap-3 transition-all cursor-pointer ${editingItem?.id === module.id ? 'border-amber-500/50' : 'border-white/5 hover:border-amber-500/30'} ${!module.isQuizEnabled ? 'opacity-50' : ''}`}
                      >
                        <div className={`p-1.5 rounded-lg ${module.isQuizEnabled ? 'bg-amber-500/10 text-amber-500' : 'bg-gray-500/10 text-gray-500'}`}>
                          <ListChecks className="w-3 h-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none">Examen del Módulo</p>
                          <p className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter truncate mt-1">{module.questions.length} Preguntas {!module.isQuizEnabled && '(Desactivado)'}</p>
                        </div>
                        {!module.isQuizEnabled && <EyeOff className="w-2.5 h-2.5 text-gray-600" />}
                      </div>
                    )}

                    <button
                      onClick={() => onAddLesson(module.id)}
                      className="w-full py-2 border border-dashed border-white/5 rounded-xl text-[9px] font-black text-gray-600 uppercase tracking-widest hover:bg-white/5 hover:text-blis-red transition-all"
                    >
                      + Añadir Lección
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          {course.modules.length === 0 && <div className="py-12 text-center text-gray-600 text-[10px] font-black uppercase tracking-widest">No hay módulos aún</div>}
        </div>
      </div>
    </div>
  )
}


