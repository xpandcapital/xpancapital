"use client"

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useActionGuard } from '@/hooks/useActionGuard'
import type { Project, ProjectFormData } from './_types'
import { getProjectSlug } from './_types'
import { useProjects, useImageUpload, useNotionSync, useAIParse } from './_hooks'
import { Header, SearchBar, ProjectGrid, ProjectListView, ProjectForm, NotionSyncModal, EmptyState } from './_components'

const EMPTY_FORM: ProjectFormData = {
  name: '', id: '', status: 'EN PLANOS', website: '', location: '',
  description: '', cover_image: '', gallery_images: [],
  start_date: new Date().toISOString().split('T')[0], end_date: '',
  logo_url: '', primary_color: '#be0b3c', secondary_color: ''
}

export default function AdminProjects() {
  const router = useRouter()
  const { guard } = useActionGuard()
  const { projects, isLoading, loadProjects, saveProject, deleteProject } = useProjects()
  const { uploadImage, uploadingCover, uploadingLogo, uploadingGallery, setUploadingCover, setUploadingLogo, setUploadingGallery } = useImageUpload()
  const { notionSyncing, notionResult, notionReceiptsResult, setNotionResult, setNotionReceiptsResult, syncWithNotion } = useNotionSync()
  const { aiParsing, aiParseResult, setAiParseResult, parseAI } = useAIParse()

  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState<ProjectFormData>({ ...EMPTY_FORM })
  const [notionModal, setNotionModal] = useState<Project | null>(null)
  const [notionDbId, setNotionDbId] = useState('')
  const [notionReceiptsDbId, setNotionReceiptsDbId] = useState('')

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploadingCover(true)
    const url = await uploadImage(file, 'projects')
    if (url) setFormData(f => ({ ...f, cover_image: url }))
    setUploadingCover(false)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploadingLogo(true)
    const url = await uploadImage(file, 'projects')
    if (url) setFormData(f => ({ ...f, logo_url: url }))
    setUploadingLogo(false)
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files || files.length === 0) return
    setUploadingGallery(true)
    const newUrls: string[] = []
    for (let i = 0; i < files.length; i++) { const url = await uploadImage(files[i], 'projects'); if (url) newUrls.push(url) }
    setFormData(f => ({ ...f, gallery_images: [...f.gallery_images, ...newUrls] }))
    setUploadingGallery(false)
  }

  const addGalleryImage = (url: string) => {
    if (url && !formData.gallery_images.includes(url)) setFormData(f => ({ ...f, gallery_images: [...f.gallery_images, url] }))
  }

  const removeGalleryImage = (index: number) => {
    setFormData(f => ({ ...f, gallery_images: f.gallery_images.filter((_, i) => i !== index) }))
  }

  const handleSaveProject = async () => {
    if (!guard('proyectos', editingProject ? 'editar' : 'crear')) return
    if (!formData.name || !formData.id) return
    const projectData = {
      id: formData.id.toUpperCase(), name: formData.name, status: formData.status,
      website: formData.website || null, location: formData.location || null,
      description: formData.description || null, cover_image: formData.cover_image || null,
      gallery_images: formData.gallery_images, start_date: formData.start_date || null,
      end_date: formData.end_date || null, logo_url: formData.logo_url || null,
      primary_color: formData.primary_color || '#be0b3c', secondary_color: formData.secondary_color || null,
      is_active: true, order_index: editingProject ? editingProject.order_index : 0,
    }
    const result = await saveProject(projectData, editingProject)
    if (result.success) { setShowModal(false); setEditingProject(null); setFormData({ ...EMPTY_FORM, start_date: new Date().toISOString().split('T')[0] }) }
    else { alert('Error al guardar el proyecto') }
  }

  const handleDeleteProject = async (project: Project) => {
    if (!guard('proyectos', 'eliminar')) return
    if (!confirm(`¿Eliminar el proyecto "${project.name}"?\n\nEsta acción eliminará también todos sus lotes y no se puede deshacer.`)) return
    const result = await deleteProject(project.id)
    if (!result.success) alert('Error al eliminar: ' + (result.error || 'Error desconocido'))
  }

  const openEditProject = (project: Project) => {
    if (!guard('proyectos', 'editar')) return
    setEditingProject(project)
    setFormData({
      name: project.name, id: project.id, status: project.status,
      website: project.website || '', location: project.location || '',
      description: project.description || '', cover_image: project.cover_image || '',
      gallery_images: project.gallery_images || [],
      start_date: project.start_date || new Date().toISOString().split('T')[0],
      end_date: project.end_date || '', logo_url: project.logo_url || '',
      primary_color: project.primary_color || '#be0b3c', secondary_color: project.secondary_color || ''
    })
    setShowModal(true)
  }

  const openNewProject = () => {
    setEditingProject(null); setFormData({ ...EMPTY_FORM, start_date: new Date().toISOString().split('T')[0] })
    router.push('/superadmin/proyectos/new')
  }

  const handleNotionSync = async () => {
    if (!notionModal) return
    if (!notionDbId.trim()) { setNotionResult({ success: false, error: 'Ingresa el ID de la base de datos de Lotes' }); return }
    await syncWithNotion(notionModal.id, notionDbId, notionReceiptsDbId)
    loadProjects()
  }

  const handleAIParse = () => { parseAI(notionModal?.id ?? null, () => loadProjects()) }

  const openNotionModal = (project: Project) => {
    setNotionModal(project)
    setNotionDbId((project as any).notion_database_id || '')
    setNotionReceiptsDbId((project as any).notion_receipts_database_id || '')
    setNotionResult(null); setNotionReceiptsResult(null); setAiParseResult(null)
  }

  const exportCSV = () => {
    const headers = ['Proyecto', 'ID', 'Estado', 'Ubicación', 'Lotes Total', 'Vendidos', 'Disponibles', 'Inicio', 'Fin']
    const rows = filteredProjects.map(p => {
      const lots = (p.lots || []).filter((l: any) => !l.lot_number?.toLowerCase().includes('desistido') && l.status !== 'Desistido')
      const sold = lots.filter((l: any) => l.status === 'Vendido' || (l.client_name && l.client_name !== 'No especificado')).length
      return [p.name, p.id, p.status, p.location || '', lots.length, sold, lots.length - sold, p.start_date || '', p.end_date || '']
    })
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `proyectos-${new Date().toISOString().slice(0,10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const filteredProjects = useMemo(() =>
    projects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase())),
    [projects, searchTerm]
  )

  const onLotManagement = (project: Project) => { router.push(`/superadmin/gestion-lotes/${getProjectSlug(project.name)}`) }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1800px] mx-auto px-6 py-10">
        <Header loadProjects={loadProjects} viewMode={viewMode} setViewMode={setViewMode} exportCSV={exportCSV} onNewProject={openNewProject} />
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {viewMode === 'list' && (
          <ProjectListView projects={filteredProjects} onEdit={openEditProject} onDelete={handleDeleteProject} onNotionSync={openNotionModal} onLotManagement={onLotManagement} />
        )}

        {viewMode === 'grid' && (
          <ProjectGrid projects={filteredProjects} onEdit={(p) => router.push(`/superadmin/proyectos/${p.id}`)} onDelete={handleDeleteProject} onNotionSync={openNotionModal} onLotManagement={onLotManagement} />
        )}

        {filteredProjects.length === 0 && !isLoading && <EmptyState searchTerm={searchTerm} />}

        <ProjectForm isOpen={showModal} onClose={() => setShowModal(false)} formData={formData} setFormData={setFormData}
          editingProject={editingProject} onSave={handleSaveProject} uploadingCover={uploadingCover} uploadingLogo={uploadingLogo}
          uploadingGallery={uploadingGallery} handleCoverUpload={handleCoverUpload} handleLogoUpload={handleLogoUpload}
          handleGalleryUpload={handleGalleryUpload} addGalleryImage={addGalleryImage} removeGalleryImage={removeGalleryImage} />

        <NotionSyncModal project={notionModal} onClose={() => !notionSyncing && setNotionModal(null)} notionDbId={notionDbId}
          setNotionDbId={setNotionDbId} notionReceiptsDbId={notionReceiptsDbId} setNotionReceiptsDbId={setNotionReceiptsDbId}
          notionSyncing={notionSyncing} notionResult={notionResult} notionReceiptsResult={notionReceiptsResult}
          onSync={handleNotionSync} onAIParse={handleAIParse} aiParsing={aiParsing} aiParseResult={aiParseResult} />
      </div>
    </div>
  )
}
