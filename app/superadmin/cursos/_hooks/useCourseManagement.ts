'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Course, Module, Lesson, Question } from '../_types'

export function useCourseManagement() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [certificateTemplates, setCertificateTemplates] = useState<{ id: string; nombre: string }[]>([])

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/cursos')
      const data = await response.json()
      if (data.success && data.data) {
        const mappedCourses: Course[] = data.data.map((c: {
          id: string
          nombre: string
          slug: string
          descripcion?: string
          modulos?: Module[]
          precio_coins?: number
          precio_usd?: number
          activo?: boolean
          certificado_template_id?: string
          creado_en?: string
        }) => ({
          id: c.id,
          title: c.nombre,
          category: 'Capacitaciones',
          price: c.precio_usd || 0,
          status: c.activo ? 'Publicado' : 'Borrador',
          modules: c.modulos || [],
          hasCertificate: !!c.certificado_template_id,
          allowComments: true,
          bliscoins: c.precio_coins || 0,
          image: null,
          certificateTemplateId: c.certificado_template_id || null
        }))
        setCourses(mappedCourses)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCertificateTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/certificados/plantillas')
      const data = await response.json()
      if (data.success && data.data) {
        setCertificateTemplates(data.data.map((t: { id: string; nombre: string }) => ({ id: t.id, nombre: t.nombre })))
      }
    } catch (error) {
      console.error('Error fetching certificate templates:', error)
    }
  }, [])

  useEffect(() => {
    fetchCertificateTemplates()
    fetchCourses()
  }, [fetchCertificateTemplates, fetchCourses])

  const saveCourse = useCallback(async (course: Course) => {
    if (!course) return false
    setIsSaving(true)
    
    try {
      const slug = course.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `curso-${Date.now()}`

      const courseData = {
        nombre: course.title || 'Sin título',
        slug,
        descripcion: course.category,
        modulos: course.modules,
        precio_coins: course.bliscoins || 0,
        precio_usd: course.price || 0,
        activo: course.status === 'Publicado',
        certificado_template_id: course.certificateTemplateId || null
      }

      const isNew = course.id.startsWith('new') || course.id.length < 10
      
      const response = await fetch('/api/admin/cursos', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isNew ? courseData : { id: course.id, ...courseData })
      })

      const data = await response.json()
      
      if (data.success) {
        if (isNew && data.data) {
          setCurrentCourse(prev => prev ? { ...prev, id: data.data.id } : null)
          await fetchCourses()
        }
        return true
      }
    } catch (error) {
      console.error('Error saving course:', error)
    } finally {
      setIsSaving(false)
    }
    return false
  }, [fetchCourses])

  const createNewCourse = useCallback(() => {
    const newCourse: Course = {
      id: `new-${Date.now()}`,
      title: '',
      category: 'Capacitaciones',
      price: 0,
      status: 'Borrador',
      modules: [{ id: `M${Date.now()}`, title: 'Módulo 1', lessons: [], isOpen: true }],
      hasCertificate: false,
      allowComments: true,
      bliscoins: 0,
      image: null,
      certificateTemplateId: null
    }
    setCourses(prev => [...prev, newCourse])
    setCurrentCourse(newCourse)
    return newCourse
  }, [])

  const deleteCourse = useCallback(async (courseId: string) => {
    if (!confirm('¿Estás seguro de eliminar este curso?')) return false
    
    try {
      const response = await fetch(`/api/admin/cursos?id=${courseId}`, { method: 'DELETE' })
      
      if (response.ok) {
        setCourses(prev => prev.filter(c => c.id !== courseId))
        if (currentCourse?.id === courseId) {
          setCurrentCourse(null)
        }
        return true
      }
    } catch (error) {
      console.error('Error deleting course:', error)
    }
    return false
  }, [currentCourse])

  return {
    courses,
    setCourses,
    loading,
    currentCourse,
    setCurrentCourse,
    isSaving,
    certificateTemplates,
    fetchCourses,
    saveCourse,
    createNewCourse,
    deleteCourse
  }
}

export function useModuleActions(currentCourse: Course | null, setCurrentCourse: (course: Course) => void) {
  const addModule = useCallback(() => {
    if (!currentCourse) return
    const newModule: Module = { id: `M${Date.now()}`, title: 'Nuevo Módulo', lessons: [], questions: [], isOpen: true }
    setCurrentCourse({ ...currentCourse, modules: [...currentCourse.modules, newModule] })
    return newModule.id
  }, [currentCourse, setCurrentCourse])

  const updateModule = useCallback((id: string, data: Partial<Module>) => {
    if (!currentCourse) return
    setCurrentCourse({ ...currentCourse, modules: currentCourse.modules.map(m => m.id === id ? { ...m, ...data } : m) })
  }, [currentCourse, setCurrentCourse])

  const deleteModule = useCallback((id: string) => {
    if (!currentCourse) return
    setCurrentCourse({ ...currentCourse, modules: currentCourse.modules.filter(m => m.id !== id) })
  }, [currentCourse, setCurrentCourse])

  const moveModule = useCallback((fromIndex: number, toIndex: number) => {
    if (!currentCourse) return
    const newModules = [...currentCourse.modules]
    const [moved] = newModules.splice(fromIndex, 1)
    newModules.splice(toIndex, 0, moved)
    setCurrentCourse({ ...currentCourse, modules: newModules })
  }, [currentCourse, setCurrentCourse])

  return { addModule, updateModule, deleteModule, moveModule }
}

export function useLessonActions(currentCourse: Course | null, setCurrentCourse: (course: Course) => void) {
  const addLesson = useCallback((moduleId: string) => {
    if (!currentCourse) return
    const newLesson: Lesson = { id: `L${Date.now()}`, title: 'Nueva Lección', type: 'video', content: '', attachments: [], questions: [] }
    setCurrentCourse({
      ...currentCourse,
      modules: currentCourse.modules.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson], isOpen: true } : m)
    })
    return newLesson.id
  }, [currentCourse, setCurrentCourse])

  const updateLesson = useCallback((moduleId: string, lessonId: string, data: Partial<Lesson>) => {
    if (!currentCourse) return
    setCurrentCourse({
      ...currentCourse,
      modules: currentCourse.modules.map(m => m.id === moduleId ? {
        ...m,
        lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...data } : l)
      } : m)
    })
  }, [currentCourse, setCurrentCourse])

  const deleteLesson = useCallback((moduleId: string, lessonId: string) => {
    if (!currentCourse) return
    setCurrentCourse({
      ...currentCourse,
      modules: currentCourse.modules.map(m => m.id === moduleId ? {
        ...m,
        lessons: m.lessons.filter(l => l.id !== lessonId)
      } : m)
    })
  }, [currentCourse, setCurrentCourse])

  const reorderLesson = useCallback((moduleId: string, fromIndex: number, toIndex: number) => {
    if (!currentCourse) return
    setCurrentCourse({
      ...currentCourse,
      modules: currentCourse.modules.map(m => {
        if (m.id !== moduleId) return m
        const newLessons = [...m.lessons]
        const [moved] = newLessons.splice(fromIndex, 1)
        newLessons.splice(toIndex, 0, moved)
        return { ...m, lessons: newLessons }
      })
    })
  }, [currentCourse, setCurrentCourse])

  return { addLesson, updateLesson, deleteLesson, reorderLesson }
}

export function useQuestionActions(
  currentCourse: Course | null,
  setCurrentCourse: (course: Course) => void,
  updateLesson: (moduleId: string, lessonId: string, data: Partial<Lesson>) => void
) {
  const addQuestion = useCallback((moduleId: string, lessonId: string) => {
    if (!currentCourse) return
    const newQuestion: Question = {
      id: `Q${Date.now()}`,
      text: '',
      options: [
        { id: 'O1', text: 'Opción 1', isCorrect: true },
        { id: 'O2', text: 'Opción 2', isCorrect: false }
      ]
    }
    const lesson = currentCourse.modules.find(m => m.id === moduleId)?.lessons.find(l => l.id === lessonId)
    if (!lesson) return
    updateLesson(moduleId, lessonId, { questions: [...(lesson.questions || []), newQuestion] })
  }, [currentCourse, updateLesson])

  const updateQuestion = useCallback((moduleId: string, lessonId: string, questionId: string, data: Partial<Question>) => {
    if (!currentCourse) return
    const lesson = currentCourse.modules.find(m => m.id === moduleId)?.lessons.find(l => l.id === lessonId)
    if (!lesson) return
    updateLesson(moduleId, lessonId, { questions: lesson.questions?.map(q => q.id === questionId ? { ...q, ...data } : q) })
  }, [currentCourse, updateLesson])

  const deleteQuestion = useCallback((moduleId: string, lessonId: string, questionId: string) => {
    if (!currentCourse) return
    const lesson = currentCourse.modules.find(m => m.id === moduleId)?.lessons.find(l => l.id === lessonId)
    if (!lesson) return
    updateLesson(moduleId, lessonId, { questions: lesson.questions?.filter(q => q.id !== questionId) })
  }, [currentCourse, updateLesson])

  return { addQuestion, updateQuestion, deleteQuestion }
}