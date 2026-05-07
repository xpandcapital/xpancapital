'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { extractNotionId } from '../_types'
import type { Project, ProjectLot } from '../_types'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/projects')
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Error loading projects')
      const projectsWithLots = (json.data || []).map((p: any) => ({
        ...p,
        lots: p.lots || [],
        gallery_images: p.gallery_images || [],
      }))
      setProjects(projectsWithLots)
      setError(null)
    } catch (err) {
      console.error('[Proyectos] Error loading projects:', err)
      setError(err instanceof Error ? err.message : 'Error loading projects')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const saveProject = useCallback(async (projectData: Partial<Project>, editingProject: Project | null) => {
    try {
      const res = await fetch(`/api/admin/projects${editingProject ? `/${editingProject.id}` : ''}`, {
        method: editingProject ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Error al guardar')
      await loadProjects()
      return { success: true }
    } catch (err) {
      console.error('Error saving project:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Error al guardar' }
    }
  }, [loadProjects])

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Error al eliminar')
      setProjects(prev => prev.filter(p => p.id !== projectId))
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error al eliminar' }
    }
  }, [])

  return {
    projects,
    setProjects,
    isLoading,
    error,
    loadProjects,
    saveProject,
    deleteProject
  }
}

export function useImageUpload() {
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const uploadImage = async (file: File, folder: string = 'projects'): Promise<string | null> => {
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', folder)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      })
      
      const data = await response.json()
      if (data.success && data.url) {
        return data.url
      }
      throw new Error(data.error || 'Upload failed')
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error al subir la imagen')
      return null
    }
  }

  return {
    uploadingCover,
    uploadingGallery,
    uploadingLogo,
    setUploadingCover,
    setUploadingGallery,
    setUploadingLogo,
    uploadImage
  }
}

export function useNotionSync() {
  const [notionSyncing, setNotionSyncing] = useState(false)
  const [notionResult, setNotionResult] = useState<any>(null)
  const [notionReceiptsResult, setNotionReceiptsResult] = useState<any>(null)

  const syncWithNotion = useCallback(async (projectId: string, notionDbId: string, notionReceiptsDbId?: string) => {
    setNotionSyncing(true)
    setNotionResult(null)
    setNotionReceiptsResult(null)

    try {
      const dbId = extractNotionId(notionDbId)
      if (!dbId) {
        setNotionResult({ success: false, error: 'ID de base de datos inválido' })
        setNotionSyncing(false)
        return { success: false, error: 'ID de base de datos inválido' }
      }

      const res = await fetch('/api/notion/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, database_id: dbId }),
      })
      const data = await res.json()
      setNotionResult(data)

      if (notionReceiptsDbId?.trim()) {
        setNotionResult((prev: any) => ({ ...prev, message: 'Sincronizando recibos...' }))
        const receiptsDbId = extractNotionId(notionReceiptsDbId)
        if (receiptsDbId) {
          try {
            const receiptsRes = await fetch('/api/notion/sync-receipts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ project_id: projectId, receipts_database_id: receiptsDbId }),
            })
            const receiptsData = await receiptsRes.json()
            setNotionReceiptsResult(receiptsData)

            if (receiptsData.success && receiptsData.linked > 0) {
              setNotionResult((prev: any) => ({ ...prev, message: 'Mapeando pagos a lotes...' }))
              const paymentsRes = await fetch('/api/notion/sync-lot-payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: projectId }),
              })
              const paymentsData = await paymentsRes.json()

              if (paymentsData.success) {
                setNotionReceiptsResult((prev: any) => ({
                  ...prev,
                  payments_mapped: paymentsData.lots_updated,
                  message: `${paymentsData.lots_updated} lotes actualizados con pagos`
                }))
              }
            }
          } catch (err: any) {
            setNotionReceiptsResult({ success: false, error: err.message })
          }
        }
      }

      if (data.success) {
        await supabase
          .from('projects')
          .update({
            notion_database_id: dbId,
            notion_receipts_database_id: notionReceiptsDbId?.trim() ? extractNotionId(notionReceiptsDbId) : null,
            notion_last_sync: new Date().toISOString()
          })
          .eq('id', projectId)
      }

      return data
    } catch (err: any) {
      setNotionResult({ success: false, error: err.message })
      return { success: false, error: err.message }
    } finally {
      setNotionSyncing(false)
    }
  }, [])

  return {
    notionSyncing,
    notionResult,
    notionReceiptsResult,
    setNotionResult,
    setNotionReceiptsResult,
    syncWithNotion
  }
}

export function useAIParse() {
  const [aiParsing, setAiParsing] = useState(false)
  const [aiParseResult, setAiParseResult] = useState<any>(null)

  const parseAI = useCallback(async (projectId: string | null, onSuccess?: () => void) => {
    if (!projectId) return

    setAiParsing(true)
    setAiParseResult(null)

    try {
      const res = await fetch('/api/notion/parse-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      })

      const data = await res.json()
      setAiParseResult(data)

      if (data.success) {
        onSuccess?.()
      }
    } catch (err: any) {
      console.error('[AI Parse] Error:', err)
      setAiParseResult({ success: false, error: err.message })
    }

    setAiParsing(false)
  }, [])

  return { aiParsing, aiParseResult, setAiParseResult, parseAI }
}
