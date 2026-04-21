"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, Trash2, RefreshCw, ExternalLink, Loader2, Upload, X, Plus, Globe, MapPin, Sparkles, FolderOpen } from 'lucide-react'

const STATUS_OPTIONS = ['EN PLANOS', 'PREVENTA', 'VENTA CON ESCRITURA', 'VENTA FINALIZADA', 'PROYECTO ENTREGADO']

const getProjectSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

type Project = {
  id: string; name: string; status: string; website: string | null; location: string | null
  description: string | null; cover_image: string | null; gallery_images: string[]
  start_date: string | null; end_date: string | null; logo_url: string | null
  primary_color: string; secondary_color: string | null; is_active: boolean
  order_index: number | null; created_at: string
  notion_database_id?: string | null; notion_receipts_database_id?: string | null; notion_last_sync?: string | null
  lots?: any[]
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isNew, setIsNew] = useState(!projectId || projectId === 'new')
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const [formData, setFormData] = useState({
    name: '', id: '', status: 'EN PLANOS', website: '', location: '', description: '',
    cover_image: '', gallery_images: [] as string[], start_date: new Date().toISOString().split('T')[0],
    end_date: '', logo_url: '', primary_color: '#be0b3c', secondary_color: '',
  })

  const loadProject = useCallback(async () => {
    if (isNew) { setLoading(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Error al cargar')
      const data = json.data
      if (data) {
        setProject(data)
        setFormData({
          name: data.name || '', id: data.id || '', status: data.status || 'EN PLANOS',
          website: data.website || '', location: data.location || '', description: data.description || '',
          cover_image: data.cover_image || '', gallery_images: data.gallery_images || [],
          start_date: data.start_date || new Date().toISOString().split('T')[0], end_date: data.end_date || '',
          logo_url: data.logo_url || '', primary_color: data.primary_color || '#be0b3c', secondary_color: data.secondary_color || '',
        })
      }
    } catch (err) { console.error('[ProjectDetail] Error:', err) }
    finally { setLoading(false) }
  }, [projectId, isNew])

  useEffect(() => { loadProject() }, [loadProject])

  const handleSave = async () => {
    setSaving(true)
    try {
      const projectData: Record<string, any> = {
        id: formData.id.toUpperCase(), name: formData.name, status: formData.status,
        website: formData.website || null, location: formData.location || null, description: formData.description || null,
        cover_image: formData.cover_image || null, gallery_images: formData.gallery_images,
        start_date: formData.start_date || null, end_date: formData.end_date || null,
        logo_url: formData.logo_url || null, primary_color: formData.primary_color, secondary_color: formData.secondary_color || null,
      }

      if (isNew) {
        projectData.is_active = true
        projectData.order_index = 0
        const { error } = await supabase.from('projects').insert([projectData])
        if (error) throw error
        router.replace(`/superadmin/proyectos/${projectData.id}`)
      } else {
        const { error } = await supabase.from('projects').update(projectData).eq('id', projectId)
        if (error) throw error
        await loadProject()
      }
    } catch (err: any) { alert('Error al guardar: ' + (err.message || 'Error desconocido')) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!project) return
    if (!confirm(`¿Eliminar "${project.name}"? Esta acción eliminará también todos sus lotes y no se puede deshacer.`)) return
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Error al eliminar')
      router.push('/superadmin/proyectos')
    } catch (err: any) { alert('Error al eliminar: ' + (err.message || 'Error desconocido')) }
  }

  const uploadImage = async (file: File, folder: string = 'projects'): Promise<string | null> => {
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('folder', folder)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success && data.url) return data.url
      throw new Error(data.error || 'Upload failed')
    } catch { alert('Error al subir la imagen'); return null }
  }

  const addGalleryImage = (url: string) => {
    if (url && !formData.gallery_images.includes(url)) {
      setFormData(prev => ({ ...prev, gallery_images: [...prev.gallery_images, url] }))
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 text-blis-red animate-spin" /></div>
  }

  const displayId = isNew ? 'new' : (project?.id || projectId)
  const displayName = formData.name || 'Nuevo Proyecto'

  return (
    <div className="w-full mx-auto px-4 md:px-8 pt-6 pb-20 bg-black min-h-screen">
      <button onClick={() => router.push('/superadmin/proyectos')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group mb-6">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Volver a Proyectos</span>
      </button>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">{displayName}</h1>
          <p className="text-xs text-gray-500 font-mono mt-1">ID: {displayId.toUpperCase()}</p>
        </div>
        <div className="flex items-center gap-2">
          {project && (
            <>
              <a href={`/proyectos/${displayId.toLowerCase()}`} target="_blank" className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />Ver Landing
              </a>
              <button onClick={() => router.push(`/superadmin/gestion-lotes/${getProjectSlug(formData.name)}`)} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5" />Lotes
              </button>
            </>
          )}
          <button onClick={handleDelete} className="px-4 py-2.5 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500/50 hover:text-red-400 hover:bg-red-500/10 transition-all text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />Eliminar
          </button>
          <button onClick={handleSave} disabled={saving} className="bg-blis-red text-white px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_10px_20px_rgba(190,11,60,0.3)]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">Información Básica</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-2">ID del Proyecto</label>
                  <input type="text" value={formData.id} onChange={e => setFormData(prev => ({ ...prev, id: e.target.value.toUpperCase() }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50 [color-scheme:dark]" />
                  {!isNew && <p className="text-[9px] text-amber-400/60 mt-1">⚠️ Cambiar el ID creará un nuevo proyecto</p>}
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-2">Estado</label>
                  <div className="relative">
                    <select value={formData.status} onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50 appearance-none [color-scheme:dark]">
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDownAbsolute />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-2">Nombre</label>
                <input type="text" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-2">Descripción</label>
                <textarea value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50 resize-none" />
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">Enlaces</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-2"><Globe className="w-3 h-3 inline mr-1" />Website</label>
                <input type="url" value={formData.website} onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-2"><MapPin className="w-3 h-3 inline mr-1" />Ubicación (Maps)</label>
                <input type="url" value={formData.location} onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50" />
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">Fechas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-2">Fecha Inicio</label>
                <input type="date" value={formData.start_date} onChange={e => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50 [color-scheme:dark]" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-2">Fecha Fin</label>
                <input type="date" value={formData.end_date} onChange={e => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50 [color-scheme:dark]" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">Colores del Proyecto</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-2">Color Primario</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={formData.primary_color || '#be0b3c'} onChange={e => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="w-14 h-14 rounded-xl border border-white/5 cursor-pointer bg-transparent" />
                  <div className="flex-1">
                    <input type="text" value={formData.primary_color} onChange={e => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-blis-red/50" />
                    <div className="mt-1.5 h-6 rounded-lg border border-white/5" style={{ backgroundColor: formData.primary_color || '#be0b3c' }} />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-2">Color Secundario</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={formData.secondary_color || '#000000'} onChange={e => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="w-14 h-14 rounded-xl border border-white/5 cursor-pointer bg-transparent" />
                  <div className="flex-1">
                    <input type="text" value={formData.secondary_color || ''} onChange={e => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-blis-red/50" />
                    <div className="mt-1.5 h-6 rounded-lg border border-white/5" style={{ backgroundColor: formData.secondary_color || '#000000' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">Imágenes</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-2">Logo</label>
                <div className="flex gap-2 items-center">
                  <input type="url" value={formData.logo_url || ''} onChange={e => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50" />
                  <label className={`px-4 py-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all flex items-center gap-2 ${uploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin text-white/60" /> : <Upload className="w-4 h-4 text-white/60" />}
                    <span className="text-[10px] text-white/60">Subir</span>
                    <input type="file" accept="image/*" onChange={async e => { const f = e.target.files?.[0]; if (!f) return; setUploadingLogo(true); const url = await uploadImage(f); if (url) setFormData(prev => ({ ...prev, logo_url: url })); setUploadingLogo(false); }} className="hidden" />
                  </label>
                  {formData.logo_url && <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 overflow-hidden flex-shrink-0"><img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-1" /></div>}
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-2">Imagen de Portada</label>
                <div className="flex gap-2 items-center">
                  <input type="url" value={formData.cover_image || ''} onChange={e => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50" />
                  <label className={`px-4 py-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all flex items-center gap-2 ${uploadingCover ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin text-white/60" /> : <Upload className="w-4 h-4 text-white/60" />}
                    <span className="text-[10px] text-white/60">Subir</span>
                    <input type="file" accept="image/*" onChange={async e => { const f = e.target.files?.[0]; if (!f) return; setUploadingCover(true); const url = await uploadImage(f); if (url) setFormData(prev => ({ ...prev, cover_image: url })); setUploadingCover(false); }} className="hidden" />
                  </label>
                  {formData.cover_image && <div className="w-20 h-12 rounded-xl bg-white/5 border border-white/5 overflow-hidden flex-shrink-0"><img src={formData.cover_image} alt="Cover" className="w-full h-full object-cover" /></div>}
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-2">Galería ({formData.gallery_images?.length || 0})</label>
                <div className="flex gap-2 mb-3">
                  <input type="url" id="gallery-input" placeholder="URL de imagen..." className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blis-red/50"
                    onKeyDown={e => { if (e.key === 'Enter') { const input = e.target as HTMLInputElement; addGalleryImage(input.value); input.value = '' } }} />
                  <label className={`px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all flex items-center gap-2 ${uploadingGallery ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploadingGallery ? <Loader2 className="w-4 h-4 animate-spin text-white/60" /> : <Upload className="w-4 h-4 text-white/60" />}
                    <span className="text-[10px] text-white/60">Subir</span>
                    <input type="file" accept="image/*" multiple onChange={async e => { const files = e.target.files; if (!files) return; setUploadingGallery(true); for (const f of Array.from(files)) { const url = await uploadImage(f); if (url) setFormData(prev => ({ ...prev, gallery_images: [...prev.gallery_images, url] })); } setUploadingGallery(false); }} className="hidden" />
                  </label>
                  <button onClick={() => { const input = document.getElementById('gallery-input') as HTMLInputElement; addGalleryImage(input.value); input.value = '' }}
                    className="px-4 py-2.5 bg-blis-red/20 border border-blis-red/30 rounded-xl text-blis-red hover:bg-blis-red/30 transition-all">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                  {(formData.gallery_images || []).map((img, i) => (
                    <div key={i} className="relative group">
                      <div className="aspect-square rounded-xl bg-white/5 border border-white/5 overflow-hidden">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                      <button onClick={() => setFormData(prev => ({ ...prev, gallery_images: prev.gallery_images.filter((_, j) => j !== i) }))}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                    </div>
                  ))}
                  {(!formData.gallery_images || formData.gallery_images.length === 0) && (
                    <div className="col-span-4 py-8 text-center text-white/20 text-sm">Sube archivos o agrega URLs de imágenes para la galería</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChevronDownAbsolute() {
  return <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
}