'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Course, Module, Lesson, Question } from '../_types'

export function useCourseManagement() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [certificateTemplates, setCertificateTemplates] = useState<{ id: string; nombre: string }[]>([])
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null)
  const saveVersionRef = useRef(0)

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
          para_equipo?: boolean
          sequential_progress?: boolean
          require_completion?: boolean
          imagen_principal?: string
          linked_product_id?: string | null
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
          image: c.imagen_principal || null,
          certificateTemplateId: c.certificado_template_id || null,
          paraEquipo: c.para_equipo || false,
          sequentialProgress: c.sequential_progress || false,
          requireCompletion: c.require_completion || false,
          venderEnTienda: !!c.linked_product_id,
          productoId: c.linked_product_id || null
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
        setCertificateTemplates(data.data.map((t: { id: string; nombre: string }) => ({
          id: t.id,
          nombre: t.nombre
        })))
      }
    } catch (error) {
      console.error('Error fetching certificate templates:', error)
    }
  }, [])

  useEffect(() => {
    fetchCertificateTemplates()
    fetchCourses()
  }, [fetchCertificateTemplates, fetchCourses])

  useEffect(() => {
    if (currentCourse) {
      setCourses(prev => prev.map(c => c.id === currentCourse.id ? currentCourse : c))
    }
  }, [currentCourse])

  useEffect(() => {
    if (currentCourse && currentCourse.title.trim()) {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
      autoSaveRef.current = setTimeout(() => {
        saveBorrador()
      }, 5000)
    }
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    }
  }, [currentCourse?.title, currentCourse?.modules?.length, currentCourse?.price, currentCourse?.paraEquipo])

  const saveBorrador = useCallback(async (statusOverride?: 'Borrador' | 'Publicado') => {
    if (!currentCourse) return
    const currentVersion = ++saveVersionRef.current
    setIsSaving(true)

    try {
      const effectiveStatus = statusOverride || currentCourse.status
      const baseSlug = currentCourse.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'curso'

      const isNew = !currentCourse.id || currentCourse.id.startsWith('new')

      const courseData: Record<string, any> = {
        nombre: currentCourse.title || 'Sin título',
        slug: isNew ? baseSlug : undefined,
        descripcion: currentCourse.category,
        modulos: currentCourse.modules,
        precio_coins: currentCourse.bliscoins || 0,
        precio_usd: currentCourse.price || 0,
        activo: effectiveStatus === 'Publicado',
        para_equipo: currentCourse.paraEquipo || false,
        sequential_progress: currentCourse.sequentialProgress || false,
        require_completion: currentCourse.requireCompletion || false,
        vender_en_tienda: currentCourse.venderEnTienda || false,
        producto_id: currentCourse.productoId || null,
      }

      if (currentCourse.image) courseData.imagen_principal = currentCourse.image
      if (currentCourse.certificateTemplateId) courseData.certificado_template_id = currentCourse.certificateTemplateId

      Object.keys(courseData).forEach(key => courseData[key] === undefined && delete courseData[key])

      const response = await fetch('/api/admin/cursos', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isNew ? courseData : { id: currentCourse.id, ...courseData })
      })

      const data = await response.json()

      if (currentVersion !== saveVersionRef.current) return

      if (data.success) {
        const productoId = data.producto_id || currentCourse.productoId
        if (isNew && data.data?.id) {
          setCurrentCourse(prev => prev ? { ...prev, id: data.data.id, status: effectiveStatus, productoId, lastSaved: new Date().toLocaleTimeString() } : null)
          await fetchCourses()
        } else if (!isNew) {
          setCurrentCourse(prev => prev ? { ...prev, status: effectiveStatus, productoId, lastSaved: new Date().toLocaleTimeString() } : null)
        }
        return true
      } else if (data.error?.includes('slug') || data.error?.includes('duplicate')) {
        if (isNew) {
          const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`
          courseData.slug = uniqueSlug
          const retryRes = await fetch('/api/admin/cursos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(courseData)
          })
          const retryResult = await retryRes.json()
          if (retryResult.success && retryResult.data?.id) {
            setCurrentCourse(prev => prev ? { ...prev, id: retryResult.data.id, status: effectiveStatus, lastSaved: new Date().toLocaleTimeString() } : null)
            await fetchCourses()
            return true
          } else {
            alert('Error al guardar: ' + (retryResult.error || 'Error desconocido'))
          }
        } else {
          const { slug: _s, ...dataNoSlug } = courseData
          const retryRes = await fetch('/api/admin/cursos', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: currentCourse.id, ...dataNoSlug })
          })
          const retryResult = await retryRes.json()
          if (retryResult.success) {
            setCurrentCourse(prev => prev ? { ...prev, status: effectiveStatus, lastSaved: new Date().toLocaleTimeString() } : null)
            return true
          } else {
            alert('Error al guardar: ' + (retryResult.error || 'Error desconocido'))
          }
        }
      } else {
        alert('Error al guardar: ' + (data.error || 'Error desconocido'))
      }
    } catch (error) {
      console.error('Error saving course:', error)
      alert('Error de conexión al guardar')
    } finally {
      setIsSaving(false)
    }
    return false
  }, [currentCourse, fetchCourses])

  const handleCreateNew = useCallback(() => {
    const newCourse: Course = {
      id: `new-${Date.now()}`,
      title: '',
      category: 'Capacitaciones',
      price: 0,
      status: 'Borrador',
      modules: [
        { id: `M${Date.now()}`, title: 'Módulo 1', lessons: [], isOpen: true }
      ],
      hasCertificate: false,
      allowComments: true,
      bliscoins: 0,
      image: null,
      certificateTemplateId: null,
      paraEquipo: false,
      sequentialProgress: false,
      requireCompletion: false,
      venderEnTienda: false,
      productoId: null
    }
    setCourses(prev => [...prev, newCourse])
    setCurrentCourse(newCourse)
    return newCourse
  }, [])

  const handleDeleteCourse = useCallback(async (courseId: string) => {
    if (!confirm('¿Estás seguro de eliminar este curso?')) return

    try {
      const response = await fetch(`/api/admin/cursos?id=${courseId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCourses(prev => prev.filter(c => c.id !== courseId))
        if (currentCourse?.id === courseId) {
          setCurrentCourse(null)
        }
      }
    } catch (error) {
      console.error('Error deleting course:', error)
    }
  }, [currentCourse])

  return {
    courses,
    setCourses,
    loading,
    currentCourse,
    setCurrentCourse,
    isSaving,
    setIsSaving,
    certificateTemplates,
    fetchCourses,
    saveBorrador,
    handleCreateNew,
    handleDeleteCourse,
  }
}

export function useModuleActions(currentCourse: Course | null, setCurrentCourse: (course: Course | null) => void) {
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

  const generateModuleQuizWithAI = useCallback(async (moduleId: string) => {
    if (!currentCourse) return
    await new Promise(r => setTimeout(r, 2000))
    const aiQs: Question[] = Array.from({ length: 10 }).map((_, i) => ({
      id: `MQ${Date.now()}${i}`,
      text: `[IA] Pregunta de Módulo ${i + 1}: ¿Cuál es el punto clave evaluado en esta sección?`,
      options: [
        { id: 'O1', text: 'Concepto Principal', isCorrect: true },
        { id: 'O2', text: 'Opción Alternativa B', isCorrect: false },
        { id: 'O3', text: 'Opción Alternativa C', isCorrect: false },
        { id: 'O4', text: 'Opción Alternativa D', isCorrect: false }
      ]
    }))
    const mod = currentCourse.modules.find(m => m.id === moduleId)
    if (mod) {
      updateModule(moduleId, { isQuizEnabled: true, questions: [...(mod.questions || []), ...aiQs] })
    }
  }, [currentCourse, setCurrentCourse, updateModule])

  const addModuleQuestion = useCallback((moduleId: string) => {
    if (!currentCourse) return
    const mod = currentCourse.modules.find(m => m.id === moduleId)
    if (!mod) return
    const newQ: Question = {
      id: `MQ${Date.now()}`,
      text: '',
      options: [
        { id: 'O1', text: 'Opción 1', isCorrect: true },
        { id: 'O2', text: 'Opción 2', isCorrect: false },
        { id: 'O3', text: 'Opción 3', isCorrect: false },
        { id: 'O4', text: 'Opción 4', isCorrect: false }
      ]
    }
    updateModule(moduleId, { questions: [...(mod.questions || []), newQ] })
  }, [currentCourse, setCurrentCourse, updateModule])

  return { addModule, updateModule, deleteModule, moveModule, generateModuleQuizWithAI, addModuleQuestion }
}

export function useLessonActions(currentCourse: Course | null, setCurrentCourse: (course: Course | null) => void) {
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

  const moveLessonBetweenModules = useCallback((lessonId: string, fromModuleId: string, toModuleId: string, toIndex: number) => {
    if (!currentCourse) return
    const fromMod = currentCourse.modules.find(m => m.id === fromModuleId)
    const lesson = fromMod?.lessons.find(l => l.id === lessonId)
    if (!lesson) return

    setCurrentCourse({
      ...currentCourse,
      modules: currentCourse.modules.map(m => {
        if (m.id === fromModuleId) {
          return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }
        }
        if (m.id === toModuleId) {
          const newLessons = [...m.lessons]
          newLessons.splice(toIndex, 0, lesson)
          return { ...m, lessons: newLessons, isOpen: true }
        }
        return m
      })
    })
  }, [currentCourse, setCurrentCourse])

  const moveLesson = useCallback((moduleId: string, index: number, direction: 'up' | 'down') => {
    if (!currentCourse) return
    const targetModule = currentCourse.modules.find(m => m.id === moduleId)
    if (!targetModule) return

    const newLessons = [...targetModule.lessons]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newLessons.length) return;
    [newLessons[index], newLessons[targetIndex]] = [newLessons[targetIndex], newLessons[index]]

    setCurrentCourse({
      ...currentCourse,
      modules: currentCourse.modules.map(m => m.id === moduleId ? { ...m, lessons: newLessons } : m)
    })
  }, [currentCourse, setCurrentCourse])

  const generateQuizWithAI = useCallback(async (moduleId: string, lessonId: string) => {
    if (!currentCourse) return
    await new Promise(resolve => setTimeout(resolve, 2500))

    const aiQuestions: Question[] = [
      { id: `Q${Date.now()}1`, text: '¿Cuál es el concepto principal discutido en esta lección?', options: [{ id: 'O1', text: 'Fundamentos y Teoría', isCorrect: true }, { id: 'O2', text: 'Ejemplos Prácticos', isCorrect: false }, { id: 'O3', text: 'Conclusiones Avanzadas', isCorrect: false }, { id: 'O4', text: 'Casos de Estudio', isCorrect: false }] },
      { id: `Q${Date.now()}2`, text: 'Según el video, ¿qué herramienta es indispensable para este proceso?', options: [{ id: 'O1', text: 'Software de Edición', isCorrect: false }, { id: 'O2', text: 'Cámara Profesional', isCorrect: true }, { id: 'O3', text: 'Trípode Estable', isCorrect: false }, { id: 'O4', text: 'Iluminación Natural', isCorrect: false }] },
      { id: `Q${Date.now()}3`, text: '¿Qué error común se debe evitar al aplicar esta técnica?', options: [{ id: 'O1', text: 'Sobreexposición lumínica', isCorrect: true }, { id: 'O2', text: 'Falta de encuadre', isCorrect: false }, { id: 'O3', text: 'Audio entrecortado', isCorrect: false }, { id: 'O4', text: 'Movimientos bruscos', isCorrect: false }] },
      { id: `Q${Date.now()}4`, text: '¿Cuál es el tiempo recomendado para la primera fase del flujo de trabajo?', options: [{ id: 'O1', text: '15 minutos', isCorrect: false }, { id: 'O2', text: '30 minutos', isCorrect: true }, { id: 'O3', text: '1 hora', isCorrect: false }, { id: 'O4', text: '2 horas', isCorrect: false }] },
      { id: `Q${Date.now()}5`, text: '¿Qué elemento es fundamental para mantener el interés del espectador?', options: [{ id: 'O1', text: 'Música de fondo', isCorrect: false }, { id: 'O2', text: 'Ritmo narrativo', isCorrect: true }, { id: 'O3', text: 'Efectos especiales', isCorrect: false }, { id: 'O4', text: 'Duración extensa', isCorrect: false }] },
      { id: `Q${Date.now()}6`, text: '¿Cómo se debe configurar el balance de blancos en interiores?', options: [{ id: 'O1', text: 'Modo Automático siempre', isCorrect: false }, { id: 'O2', text: 'Ajuste Manual según la luz', isCorrect: true }, { id: 'O3', text: 'Preajuste de Nublado', isCorrect: false }, { id: 'O4', text: 'Modo Fluorescente', isCorrect: false }] },
      { id: `Q${Date.now()}7`, text: '¿Cuál es la regla de oro para una composición equilibrada?', options: [{ id: 'O1', text: 'Regla de los Tercios', isCorrect: true }, { id: 'O2', text: 'Simetría absoluta', isCorrect: false }, { id: 'O3', text: 'Encuadre holandés', isCorrect: false }, { id: 'O4', text: 'Primer plano extremo', isCorrect: false }] },
      { id: `Q${Date.now()}8`, text: '¿Qué tipo de micrófono se recomienda para entrevistas en exterior?', options: [{ id: 'O1', text: 'Micrófono de Condensador', isCorrect: false }, { id: 'O2', text: 'Micrófono de Solapa (Lavalier)', isCorrect: true }, { id: 'O3', text: 'Micrófono de Cámara', isCorrect: false }, { id: 'O4', text: 'Micrófono de Estudio', isCorrect: false }] },
      { id: `Q${Date.now()}9`, text: '¿Cuál es la resolución mínima sugerida para exportación premium?', options: [{ id: 'O1', text: '720p (HD)', isCorrect: false }, { id: 'O2', text: '1080p (Full HD)', isCorrect: true }, { id: 'O3', text: '480p (SD)', isCorrect: false }, { id: 'O4', text: '4K (Ultra HD)', isCorrect: false }] },
      { id: `Q${Date.now()}10`, text: '¿Qué software se mencionó como estándar para corrección de color?', options: [{ id: 'O1', text: 'Windows Movie Maker', isCorrect: false }, { id: 'O2', text: 'DaVinci Resolve', isCorrect: true }, { id: 'O3', text: 'Adobe Photoshop', isCorrect: false }, { id: 'O4', text: 'Canva Pro', isCorrect: false }] }
    ]

    const lesson = currentCourse.modules.find(m => m.id === moduleId)?.lessons.find(l => l.id === lessonId)
    if (lesson) {
      updateLesson(moduleId, lessonId, { questions: [...(lesson.questions || []), ...aiQuestions] })
    }
  }, [currentCourse, setCurrentCourse, updateLesson])

  return { addLesson, updateLesson, deleteLesson, reorderLesson, moveLessonBetweenModules, moveLesson, generateQuizWithAI }
}

export function useQuestionActions(
  currentCourse: Course | null,
  setCurrentCourse: (course: Course | null) => void,
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
