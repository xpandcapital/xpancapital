import { useState, useCallback } from 'react'

const DEFAULT_EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae'

interface EmailTemplate {
  id: string
  nombre: string
  descripcion?: string
  evento?: string
  settings: Record<string, unknown>
  blocks: unknown[]
  creado_en: string
  actualizado_en: string
}

interface EmailPalette {
  id: string
  nombre: string
  body_bg: string
  container_bg: string
  text: string
  primary_color: string
}

export function useEmailTemplates() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getTemplates = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/email-templates?empresa_id=${DEFAULT_EMPRESA_ID}`)
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      return data.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar plantillas')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const getTemplate = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/email-templates?id=${id}`)
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      return data.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar plantilla')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const saveTemplate = useCallback(async (template: Partial<EmailTemplate>) => {
    setLoading(true)
    setError(null)
    try {
      const isUpdate = !!template.id
      const url = '/api/email-templates'
      const method = isUpdate ? 'PUT' : 'POST'
      const body = isUpdate 
        ? { ...template, empresa_id: DEFAULT_EMPRESA_ID }
        : { ...template, empresa_id: DEFAULT_EMPRESA_ID }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      return data.data
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Error al guardar plantilla'
      console.error('saveTemplate Error:', errMsg)
      alert('Error al guardar plantilla: ' + errMsg + '\n¿Ejecutaste la migración 033_email_templates.sql en Supabase?')
      setError(errMsg)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteTemplate = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/email-templates?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      return true
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Error al eliminar plantilla'
      console.error('deleteTemplate Error:', errMsg)
      alert('Error al eliminar plantilla: ' + errMsg)
      setError(errMsg)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    getTemplates,
    getTemplate,
    saveTemplate,
    deleteTemplate
  }
}

export function useEmailPalettes() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getPalettes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/email-palettes?empresa_id=${DEFAULT_EMPRESA_ID}`)
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      return data.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar paletas')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const savePalette = useCallback(async (palette: Partial<EmailPalette>) => {
    setLoading(true)
    setError(null)
    try {
      const isUpdate = !!palette.id
      const url = '/api/email-palettes'
      const method = isUpdate ? 'PUT' : 'POST'
      const body = isUpdate 
        ? palette 
        : { ...palette, empresa_id: DEFAULT_EMPRESA_ID }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      return data.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar paleta')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const deletePalette = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/email-palettes?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar paleta')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    getPalettes,
    savePalette,
    deletePalette
  }
}