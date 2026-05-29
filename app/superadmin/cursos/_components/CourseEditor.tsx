'use client'

import { useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import type { Course, EditingItem, ConfirmDelete, CertificateTemplate } from '../_types'
import { CourseEditorHeader } from './CourseEditorHeader'
import { CourseInfoPanel } from './CourseInfoPanel'
import { CourseDetailsForm } from './CourseDetailsForm'
import { ModuleEditor } from './ModuleEditor'
import { LessonEditor } from './LessonEditor'
import { PreviewModal } from './PreviewModal'
import { ConfirmationModal } from './ConfirmationModal'
import { ImageCropper } from './ImageCropper'
import { TiendaSection } from './TiendaSection'

interface CourseEditorProps {
  course: Course
  isSaving: boolean
  certificateTemplates: CertificateTemplate[]
  showToast: boolean
  showCropper: boolean
  tempImage: string | null
  showPreview: boolean
  editingItem: EditingItem
  confirmDelete: ConfirmDelete
  draggedItem: { type: 'module' | 'lesson'; id: string; moduleId?: string } | null
  isGeneratingAI: string | null
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onSetCurrentCourse: React.Dispatch<React.SetStateAction<Course | null>>
  onSaveBorrador: (statusOverride?: 'Borrador' | 'Publicado') => void
  onBack: () => void
  onSetShowPreview: (show: boolean) => void
  onSetShowCropper: (show: boolean) => void
  onSetTempImage: (img: string | null) => void
  onSetShowToast: (show: boolean) => void
  onSetDraggedItem: (item: { type: 'module' | 'lesson'; id: string; moduleId?: string } | null) => void
  onSetEditingItem: (item: EditingItem) => void
  onSetConfirmDelete: (item: ConfirmDelete) => void
  onSetIsGeneratingAI: (id: string | null) => void
  canEdit: boolean
  // Module actions
  onAddModule: () => string | undefined
  onUpdateModule: (id: string, data: Partial<import('../_types').Module>) => void
  onDeleteModule: (id: string) => void
  onMoveModule: (fromIdx: number, toIdx: number) => void
  onGenerateModuleQuizAI: (moduleId: string) => Promise<void>
  onAddModuleQuestion: (moduleId: string) => void
  // Lesson actions
  onAddLesson: (moduleId: string) => string | undefined
  onUpdateLesson: (moduleId: string, lessonId: string, data: Partial<import('../_types').Lesson>) => void
  onDeleteLesson: (moduleId: string, lessonId: string) => void
  onReorderLesson: (moduleId: string, fromIdx: number, toIdx: number) => void
  onMoveLessonBetweenModules: (lessonId: string, fromModuleId: string, toModuleId: string, toIdx: number) => void
  onMoveLesson: (moduleId: string, idx: number, dir: 'up' | 'down') => void
  onGenerateQuizAI: (moduleId: string, lessonId: string) => Promise<void>
  // Question actions
  onAddQuestion: (moduleId: string, lessonId: string) => void
  onUpdateQuestion: (moduleId: string, lessonId: string, questionId: string, data: Partial<import('../_types').Question>) => void
  onDeleteQuestion: (moduleId: string, lessonId: string, questionId: string) => void
}

export function CourseEditor({
  course, isSaving, certificateTemplates,
  showToast, showCropper, tempImage, showPreview,
  editingItem, confirmDelete, draggedItem, isGeneratingAI,
  fileInputRef,
  onSetCurrentCourse, onSaveBorrador, onBack,
  onSetShowPreview, onSetShowCropper, onSetTempImage, onSetShowToast,
  onSetDraggedItem, onSetEditingItem, onSetConfirmDelete, onSetIsGeneratingAI,
  canEdit,
  onAddModule, onUpdateModule, onDeleteModule, onMoveModule,
  onGenerateModuleQuizAI, onAddModuleQuestion,
  onAddLesson, onUpdateLesson, onDeleteLesson, onReorderLesson,
  onMoveLessonBetweenModules, onMoveLesson, onGenerateQuizAI,
  onAddQuestion, onUpdateQuestion, onDeleteQuestion
}: CourseEditorProps) {
  const itemRefs = useRef<{ [key: string]: HTMLElement | null }>({})

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPreview) {
        e.preventDefault()
        onSetShowPreview(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showPreview, onSetShowPreview])

  useEffect(() => {
    if (showToast) {
      const t = setTimeout(() => onSetShowToast(false), 2000)
      return () => clearTimeout(t)
    }
  }, [showToast, onSetShowToast])

  const scrollToItem = (id: string) => {
    const element = itemRefs.current[id]
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      element.classList.add('ring-2', 'ring-blis-red', 'ring-offset-4', 'ring-offset-black')
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-blis-red', 'ring-offset-4', 'ring-offset-black')
      }, 2000)
    }
  }

  const handleSave = async (statusOverride?: 'Borrador' | 'Publicado') => {
    await onSaveBorrador(statusOverride)
    onSetShowToast(true)
  }

  return (
    <div className="w-full space-y-8 pb-32 px-4 md:px-8 pt-8 md:pt-8">
      <style jsx global>{`
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type='number'] {
          -moz-appearance: textfield;
        }
      `}</style>

      {showPreview && <PreviewModal course={course} onClose={() => onSetShowPreview(false)} />}

      <CourseEditorHeader
        course={course}
        isSaving={isSaving}
        onBack={onBack}
        onSave={() => handleSave('Borrador')}
        onPublish={() => handleSave('Publicado')}
        onPreview={() => onSetShowPreview(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <CourseInfoPanel
          course={course}
          editingItem={editingItem}
          draggedItem={draggedItem}
          onSetDraggedItem={onSetDraggedItem}
          onSetEditingItem={onSetEditingItem}
          onSetConfirmDelete={onSetConfirmDelete}
          onAddModule={() => {
            const newId = onAddModule()
            if (!canEdit) return
            if (newId) onSetEditingItem({ type: 'module', id: newId })
          }}
          onAddLesson={(moduleId) => {
            onAddLesson(moduleId)
            if (!canEdit) return
          }}
          onToggleModule={(id, isOpen) => onUpdateModule(id, { isOpen })}
          onMoveModule={onMoveModule}
          onReorderLesson={onReorderLesson}
          onMoveLessonBetweenModules={onMoveLessonBetweenModules}
          onScrollToItem={scrollToItem}
          canEdit={canEdit}
        />

        <div className="lg:col-span-2 space-y-8">
          <CourseDetailsForm
            course={course}
            certificateTemplates={certificateTemplates}
            onUpdate={(c) => onSetCurrentCourse(c)}
            onImageFileSelect={(file) => {
              const reader = new FileReader()
              reader.onload = (prev) => { onSetTempImage(prev.target?.result as string); onSetShowCropper(true) }
              reader.readAsDataURL(file)
            }}
            fileInputRef={fileInputRef}
          />

          <TiendaSection
            course={course}
            onUpdate={(c) => onSetCurrentCourse(c)}
          />

          {course.modules.map((module, mIdx) => (
            <div key={module.id} className="space-y-8" ref={el => { itemRefs.current[module.id] = el }}>
              {editingItem?.type === 'module' && editingItem.id === module.id && (
                <ModuleEditor
                  module={module}
                  mIdx={mIdx}
                  isGeneratingAI={isGeneratingAI}
                  onUpdate={onUpdateModule}
                  onDelete={() => onSetConfirmDelete({ type: 'module', id: module.id, title: module.title })}
                  onGenerateQuizAI={(moduleId) => {
                    onSetIsGeneratingAI(`MOD_${moduleId}`)
                    onGenerateModuleQuizAI(moduleId).then(() => onSetIsGeneratingAI(null))
                  }}
                  onAddQuestion={(moduleId) => {
                    const existingQuestions = course.modules.find(m => m.id === moduleId)?.questions
                    const newQ = { id: `MQ${Date.now()}`, text: '', options: [{ id: 'O1', text: 'Opción 1', isCorrect: true }, { id: 'O2', text: 'Opción 2', isCorrect: false }, { id: 'O3', text: 'Opción 3', isCorrect: false }, { id: 'O4', text: 'Opción 4', isCorrect: false }] }
                    onUpdateModule(moduleId, { questions: [...(existingQuestions || []), newQ] })
                  }}
                  moduleRef={(el) => { itemRefs.current[module.id] = el }}
                />
              )}

              {module.lessons.map((lesson, lIdx) => (
                editingItem?.type === 'lesson' && editingItem.id === lesson.id && (
                  <LessonEditor
                    key={lesson.id}
                    module={module}
                    lesson={lesson}
                    lIdx={lIdx}
                    isGeneratingAI={isGeneratingAI}
                    onUpdateLesson={onUpdateLesson}
                    onDeleteLesson={(mid, lid) => onSetConfirmDelete({ type: 'lesson', id: lid, moduleId: mid, title: lesson.title })}
                    onAddQuestion={onAddQuestion}
                    onDeleteQuestion={onDeleteQuestion}
                    onUpdateQuestion={onUpdateQuestion}
                    onGenerateQuizAI={(moduleId, lessonId) => {
                      onSetIsGeneratingAI(lessonId)
                      onGenerateQuizAI(moduleId, lessonId).then(() => onSetIsGeneratingAI(null))
                    }}
                    lessonRef={(el) => { itemRefs.current[lesson.id] = el }}
                  />
                )
              ))}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {(showToast || !isSaving) && course.lastSaved && (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed bottom-10 right-10 bg-emerald-500/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-[0_10px_30px_rgba(16,185,129,0.3)] z-[100] flex items-center gap-3 border border-emerald-400/50">
            <CheckCircle2 className="w-4 h-4" /> Progreso Guardado Localmente
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCropper && tempImage && (
          <ImageCropper
            src={tempImage}
            onCrop={(cropped) => { onSetCurrentCourse(prev => prev ? { ...prev, image: cropped } : null); onSetShowCropper(false) }}
            onCancel={() => onSetShowCropper(false)}
          />
        )}
      </AnimatePresence>

      <ConfirmationModal
        confirmDelete={confirmDelete}
        onConfirm={() => {
          if (confirmDelete?.type === 'module') onDeleteModule(confirmDelete.id)
          else if (confirmDelete?.moduleId) onDeleteLesson(confirmDelete.moduleId, confirmDelete.id)
          onSetConfirmDelete(null)
        }}
        onCancel={() => onSetConfirmDelete(null)}
      />
    </div>
  )
}
