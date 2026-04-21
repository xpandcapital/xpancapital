"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface CursoAsignado {
  id: string
  advisor_id: string
  curso_id: string
  progreso: number
  estado: 'asignado' | 'en_progreso' | 'completado' | 'bloqueado'
  nota_final: number | null
  lecciones_completadas: string[]
  asignado_en: string
  completado_en: string | null
  cursos: {
    nombre: string
    descripcion?: string
    precio_usd: number
    imagen_principal: string | null
    slug?: string
    para_equipo?: boolean
    modulos?: any
  } | null
}

export function useMisCapacitaciones() {
  const { user } = useAuth()
  const [cursos, setCursos] = useState<CursoAsignado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCursos = useCallback(async () => {
    if (!user?.email) { setLoading(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/equipo-cursos/me?email=${encodeURIComponent(user.email)}`)
      const data = await res.json()
      if (data.success) {
        setCursos(data.data || [])
      } else {
        setError(data.error || 'Error al cargar cursos')
      }
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
  }, [user?.email])

  useEffect(() => { fetchCursos() }, [fetchCursos])

  const toggleLesson = async (equipoCursoId: string, leccionId: string, completado: boolean) => {
    try {
      const res = await fetch('/api/equipo-cursos/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipo_curso_id: equipoCursoId, leccion_id: leccionId, completado }),
      })
      const data = await res.json()
      if (data.success) {
        setCursos(prev => prev.map(c => c.id === equipoCursoId ? { ...c, ...data.data } : c))
        return true
      }
      return false
    } catch { return false }
  }

  return { cursos, loading, error, refetch: fetchCursos, toggleLesson }
}