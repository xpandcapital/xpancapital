"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface CursoAsignado {
  id: string
  advisor_id: string | null
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
  const { user, loading: authLoading } = useAuth()
  const [cursos, setCursos] = useState<CursoAsignado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user?.email) {
      setLoading(false)
      if (!fetched) setError('Inicia sesión para ver tus capacitaciones')
      return
    }
    if (fetched) return

    const doFetch = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/equipo-cursos/me?email=${encodeURIComponent(user.email)}`)
        const data = await res.json()
        if (data.success) {
          setCursos(data.data || [])
          setIsAdmin(data.isAdmin || false)
          setError(null)
        } else {
          setError(data.error || 'Error al cargar cursos')
        }
      } catch {
        setError('Error de conexión')
      } finally {
        setLoading(false)
        setFetched(true)
      }
    }
    doFetch()
  }, [authLoading, user?.email, fetched])

  const toggleLesson = async (equipoCursoId: string, leccionId: string, completado: boolean) => {
    if (equipoCursoId.startsWith('pending-')) {
      try {
        const cursoId = equipoCursoId.replace('pending-', '')
        const assignRes = await fetch('/api/equipo-cursos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ curso_id: cursoId, email: user?.email }),
        })
        const assignData = await assignRes.json()
        if (!assignData.success) return false
        const newId = assignData.data?.id
        if (!newId) return false
        const progRes = await fetch('/api/equipo-cursos/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ equipo_curso_id: newId, leccion_id: leccionId, completado }),
        })
        const progData = await progRes.json()
        if (progData.success) {
          const freshRes = await fetch(`/api/equipo-cursos/me?email=${encodeURIComponent(user!.email!)}`)
          const freshData = await freshRes.json()
          if (freshData.success) setCursos(freshData.data || [])
          return true
        }
        return false
      } catch { return false }
    }

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

  return { cursos, loading: loading || authLoading, error, refetch: () => { setFetched(false) }, toggleLesson, isAdmin }
}