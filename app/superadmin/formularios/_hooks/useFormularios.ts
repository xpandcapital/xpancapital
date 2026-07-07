'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Formulario } from '../_types'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

export type { Formulario }

const EMPRESA_ID = DEFAULT_EMPRESA_ID

interface UseFormulariosReturn {
  formularios: Formulario[]
  loading: boolean
  error: string | null
  create: (data: Omit<Formulario, 'id' | 'creado_en' | 'actualizado_en'>) => Promise<Formulario | null>
  update: (id: string, data: Partial<Formulario>) => Promise<void>
  remove: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useFormularios(): UseFormulariosReturn {
  const [formularios, setFormularios] = useState<Formulario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/formularios?empresa_id=${EMPRESA_ID}`)
      const data = await res.json()
      if (data.success && data.data) {
        setFormularios(data.data)
      } else {
        setError(data.error || 'Error al cargar formularios')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar formularios')
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (
    data: Omit<Formulario, 'id' | 'creado_en' | 'actualizado_en'>
  ): Promise<Formulario | null> => {
    try {
      const res = await fetch('/api/formularios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await res.json()
      if (!result.success) {
        throw new Error(result.error || 'Error al crear formulario')
      }
      await refetch()
      return result.data as Formulario
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear formulario')
      return null
    }
  }, [refetch])

  const update = useCallback(async (id: string, data: Partial<Formulario>): Promise<void> => {
    try {
      const res = await fetch('/api/formularios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data })
      })
      const result = await res.json()
      if (!result.success) {
        throw new Error(result.error || 'Error al actualizar formulario')
      }
      await refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar formulario')
    }
  }, [refetch])

  const remove = useCallback(async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/api/formularios?id=${id}`, { method: 'DELETE' })
      const result = await res.json()
      if (!result.success) {
        throw new Error(result.error || 'Error al eliminar formulario')
      }
      setFormularios(prev => prev.filter(f => f.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar formulario')
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { formularios, loading, error, create, update, remove, refetch }
}