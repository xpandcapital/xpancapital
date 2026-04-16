'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Project, ProjectLot } from '../_types'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('order_index', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })

      if (projectsError) throw projectsError

      const projectsWithLots = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { data: lots } = await supabase
            .from('project_lots')
            .select('*')
            .eq('project_id', project.id)
            .order('lot_number')
          
          return { ...project, lots: lots || [], gallery_images: project.gallery_images || [] }
        })
      )

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

  const saveProject = useCallback(async (projectData: Partial<Project>, editingProject: Project | null, existingProjects: Project[]) => {
    try {
      if (editingProject) {
        if (editingProject.id !== projectData.id?.toUpperCase()) {
          const confirmMsg = `El ID cambió de "${editingProject.id}" a "${projectData.id!.toUpperCase()}". Se creará un nuevo proyecto. ¿Continuar?`
          if (!confirm(confirmMsg)) return { success: false }
          
          const { error: insertError } = await supabase
            .from('projects')
            .insert([{
              id: projectData.id!.toUpperCase(),
              ...projectData,
              is_active: true,
              order_index: editingProject.order_index,
            }])
          
          if (insertError) throw insertError
          
          const { error: deleteError } = await supabase
            .from('projects')
            .delete()
            .eq('id', editingProject.id)
          
          if (deleteError) throw deleteError
        } else {
          const { error } = await supabase
            .from('projects')
            .update(projectData)
            .eq('id', editingProject.id)
          if (error) throw error
        }
      } else {
        const minOrderIndex = existingProjects.length > 0 
          ? Math.min(...existingProjects.map(p => p.order_index ?? 0))
          : 0
        
        if (existingProjects.length > 0) {
          const updatePromises = existingProjects.map(project => {
            const currentIndex = project.order_index ?? existingProjects.indexOf(project)
            return supabase.from('projects').update({ order_index: currentIndex + 1 }).eq('id', project.id)
          })
          await Promise.all(updatePromises)
        }

        const { error } = await supabase
          .from('projects')
          .insert([{
            id: projectData.id!.toUpperCase(),
            ...projectData,
            is_active: true,
            order_index: 0,
          }])
        if (error) throw error
      }

      await loadProjects()
      return { success: true }
    } catch (err) {
      console.error('Error saving project:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Error al guardar' }
    }
  }, [loadProjects])

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId)
      if (error) throw error
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
      // Extract Notion ID
      const extractNotionId = (input: string): string | null => {
        let id = input.trim()
        const idMatch = id.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})|([a-f0-9]{32})/i)
        if (idMatch) {
          id = idMatch[0].replace(/-/g, '')
          return `${id.slice(0,8)}-${id.slice(8,12)}-${id.slice(12,16)}-${id.slice(16,20)}-${id.slice(20)}`
        }
        return null
      }

      const dbId = extractNotionId(notionDbId)
      if (!dbId) {
        setNotionResult({ success: false, error: 'ID de base de datos inválido' })
        setNotionSyncing(false)
        return { success: false, error: 'ID de base de datos inválido' }
      }

      // Sync lots
      const res = await fetch('/api/notion/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, database_id: dbId }),
      })
      const data = await res.json()
      setNotionResult(data)

      // Sync receipts if provided
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