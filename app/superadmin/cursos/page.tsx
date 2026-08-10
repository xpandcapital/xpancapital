'use client'

import { useState, useRef } from 'react'
import { useActionGuard } from '@/hooks/useActionGuard'
import { useRouter } from 'next/navigation'
import type { Course, EditingItem, ConfirmDelete } from './_types'
import { useCourseManagement, useModuleActions, useLessonActions, useQuestionActions } from './_hooks'
import { CourseList, CourseEditor } from './_components'

export default function AdminCourses() {
  const { guard } = useActionGuard()
  const router = useRouter()
  const [view, setView] = useState<'list' | 'editor'>('list')

  const {
    courses, loading, currentCourse, setCurrentCourse,
    isSaving, certificateTemplates,
    saveBorrador, handleCreateNew, handleDeleteCourse
  } = useCourseManagement()

  const { addModule, updateModule, deleteModule, moveModule, generateModuleQuizWithAI, addModuleQuestion } = useModuleActions(currentCourse, setCurrentCourse)
  const { addLesson, updateLesson, deleteLesson, reorderLesson, moveLessonBetweenModules, moveLesson, generateQuizWithAI } = useLessonActions(currentCourse, setCurrentCourse)
  const { addQuestion, updateQuestion, deleteQuestion } = useQuestionActions(currentCourse, setCurrentCourse, updateLesson)

  const [showToast, setShowToast] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [tempImage, setTempImage] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRefForCourse = useRef<HTMLInputElement>(null)
  const [draggedItem, setDraggedItem] = useState<{ type: 'module' | 'lesson'; id: string; moduleId?: string } | null>(null)
  const [editingItem, setEditingItem] = useState<EditingItem>(null)
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete>(null)
  const [isGeneratingAI, setIsGeneratingAI] = useState<string | null>(null)

  const handleCreate = () => {
    if (!guard('cursos', 'crear')) return
    handleCreateNew()
    setView('editor')
  }

  const handleEdit = (course: Course) => {
    setCurrentCourse(course)
    setView('editor')
  }

  const handleDelete = async (courseId: string) => {
    if (!guard('cursos', 'eliminar')) return
    await handleDeleteCourse(courseId)
  }

  const handleResetProgress = async (course: Course) => {
    if (!guard('cursos', 'editar')) return
    const incluirExamen = confirm('¿Limpiar también los intentos de examen? (Si cancelas, solo se limpian las lecciones completadas y el progreso)')
    if (!confirm(`¿Limpiar el progreso de TODOS los alumnos del curso "${course.title}"? Esto reiniciará las lecciones completadas.`)) return
    try {
      const res = await fetch('/api/admin/cursos/reset-progreso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curso_id: course.id, incluir_examen: incluirExamen })
      })
      const data = await res.json()
      if (data.success) {
        alert(`Progreso limpiado en ${data.actualizados} registro(s)`)
      } else {
        alert('Error: ' + (data.error || 'No se pudo limpiar'))
      }
    } catch {
      alert('Error de conexión')
    }
  }

  const handleSave = async (statusOverride?: 'Borrador' | 'Publicado') => {
    await saveBorrador(statusOverride)
    setShowToast(true)
  }

  const handleBack = () => setView('list')

  if (view === 'editor' && currentCourse) {
    return (
      <CourseEditor
        course={currentCourse}
        isSaving={isSaving}
        certificateTemplates={certificateTemplates}
        showToast={showToast}
        showCropper={showCropper}
        tempImage={tempImage}
        showPreview={showPreview}
        editingItem={editingItem}
        confirmDelete={confirmDelete}
        draggedItem={draggedItem}
        isGeneratingAI={isGeneratingAI}
        fileInputRef={fileInputRefForCourse}
        onSetCurrentCourse={setCurrentCourse}
        onSaveBorrador={handleSave}
        onBack={handleBack}
        onSetShowPreview={setShowPreview}
        onSetShowCropper={setShowCropper}
        onSetTempImage={setTempImage}
        onSetShowToast={setShowToast}
        onSetDraggedItem={setDraggedItem}
        onSetEditingItem={setEditingItem}
        onSetConfirmDelete={setConfirmDelete}
        onSetIsGeneratingAI={setIsGeneratingAI}
        canEdit={!!guard('cursos', 'editar')}
        onAddModule={addModule}
        onUpdateModule={updateModule}
        onDeleteModule={deleteModule}
        onMoveModule={moveModule}
        onGenerateModuleQuizAI={generateModuleQuizWithAI}
        onAddModuleQuestion={addModuleQuestion}
        onAddLesson={addLesson}
        onUpdateLesson={updateLesson}
        onDeleteLesson={deleteLesson}
        onReorderLesson={reorderLesson}
        onMoveLessonBetweenModules={moveLessonBetweenModules}
        onMoveLesson={moveLesson}
        onGenerateQuizAI={generateQuizWithAI}
        onAddQuestion={addQuestion}
        onUpdateQuestion={updateQuestion}
        onDeleteQuestion={deleteQuestion}
      />
    )
  }

  return (
    <CourseList
      courses={courses}
      loading={loading}
      onCreateNew={handleCreate}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onResetProgress={handleResetProgress}
    />
  )
}
