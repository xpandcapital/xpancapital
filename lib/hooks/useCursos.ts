import { useState, useEffect, useCallback } from 'react'

interface Lesson {
  id: string
  title: string
  type: 'video' | 'text' | 'quiz'
  content: string
  videoUrl?: string
  attachments: string[]
}

interface Module {
  id: string
  title: string
  description?: string
  lessons: Lesson[]
}

export interface Curso {
  id: string
  nombre: string
  slug: string
  descripcion?: string
  modulos?: Module[]
  imagen_principal?: string
  precio_coins: number
  precio_usd: number
  max_intentos: number
  nota_aprobacion: number
  activo: boolean
  para_equipo?: boolean
  creado_en: string
  progreso?: {
    id: string
    progreso: number
    lecciones_completadas?: string[]
    nota_final?: number
    intentos: number
    examen_estado: string
  }
}

export interface CursoWithProgress extends Curso {
  progreso?: {
    id: string
    progreso: number
    lecciones_completadas?: string[]
    nota_final?: number
    intentos: number
    examen_estado: string
    creado_en: string
    actualizado_en: string
  }
}

export function useCursos() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const response = await fetch('/api/cursos')
        const data = await response.json()

        if (data.success) {
          setCursos(data.data || [])
        } else {
          setError(data.error || 'Error al cargar cursos')
        }
      } catch {
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }

    fetchCursos()
  }, [])

  return { cursos, loading, error }
}

export function useCurso(slug: string | null, userId?: string | null) {
  const [curso, setCurso] = useState<Curso | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      return
    }

    const fetchCurso = async () => {
      try {
        let url = `/api/cursos?slug=${slug}`
        if (userId) {
          url += `&user_id=${userId}`
        }

        const response = await fetch(url)
        const data = await response.json()

        if (data.success) {
          setCurso(data.data)
        } else {
          setError(data.error || 'Curso no encontrado')
        }
      } catch {
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }

    fetchCurso()
  }, [slug, userId])

  const updateProgress = async (completed: boolean = false) => {
    if (!curso || !userId) return null

    try {
      const response = await fetch('/api/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          curso_id: curso.id,
          completed
        })
      })

      const data = await response.json()

      if (data.success && data.data) {
        setCurso(prev => prev ? { ...prev, progreso: data.data } : null)
        return data.data
      }

      return null
    } catch {
      return null
    }
  }

  return { curso, loading, error, updateProgress }
}

export function useUserCursos(userId: string | null) {
  const [userCursos, setUserCursos] = useState<CursoWithProgress[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserProgress = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/cursos?user_id=${userId}`)
      const data = await response.json()
      if (data.success) {
        setUserCursos(data.data || [])
      } else {
        setError(data.error || 'Error al cargar cursos')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchUserProgress()
    }
  }, [userId, fetchUserProgress])

  return { userCursos, loading, error, refetch: fetchUserProgress }
}

export default useCursos