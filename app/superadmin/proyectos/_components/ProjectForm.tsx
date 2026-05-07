'use client'

import { motion } from 'framer-motion'
import { Plus, Upload, Loader2, X, Globe, MapPin } from 'lucide-react'
import type { Project, ProjectFormData } from '../_types'
import { STATUS_OPTIONS } from '../_types'

interface ProjectFormProps {
  isOpen: boolean
  onClose: () => void
  formData: ProjectFormData
  setFormData: (data: ProjectFormData) => void
  editingProject: Project | null
  onSave: () => void
  uploadingCover: boolean
  uploadingLogo: boolean
  uploadingGallery: boolean
  handleCoverUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleGalleryUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  addGalleryImage: (url: string) => void
  removeGalleryImage: (index: number) => void
}

export function ProjectForm({
  isOpen,
  onClose,
  formData,
  setFormData,
  editingProject,
  onSave,
  uploadingCover,
  uploadingLogo,
  uploadingGallery,
  handleCoverUpload,
  handleLogoUpload,
  handleGalleryUpload,
  addGalleryImage,
  removeGalleryImage
}: ProjectFormProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0a0a0a] border border-white/5 rounded-3xl w-full max-w-4xl my-8 shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">{editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
            <p className="text-white/40 text-sm mt-1">Configura el proyecto para mostrar en la landing</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Modal Body - Horizontal Layout */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <h4 className="text-xs uppercase tracking-widest text-white/40 mb-4 font-bold">Información Básica</h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2">ID del Proyecto</label>
                      <input type="text" value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })} className="w-full bg-[#050505] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/10 transition-colors placeholder-white/20" placeholder="MONTANA" />
                      {editingProject && <p className="text-[9px] text-amber-400/60 mt-1">⚠️ Cambiar el ID creará un nuevo proyecto</p>}
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2">Estado</label>
                      <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full bg-[#050505] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/10 transition-colors appearance-none">
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2">Nombre</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#050505] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/10 transition-colors placeholder-white/20" placeholder="Residencial Montana" />
                  </div>
                  
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2">Descripción</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full bg-[#050505] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/10 transition-colors placeholder-white/20 resize-none" placeholder="Descripción corta para mostrar en la landing..." />
                  </div>
                </div>
              </div>
              
              {/* Links */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <h4 className="text-xs uppercase tracking-widest text-white/40 mb-4 font-bold">Enlaces</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2"><Globe className="w-3 h-3 inline mr-1" /> Website</label>
                    <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="w-full bg-[#050505] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/10 transition-colors placeholder-white/20" placeholder="https://blis.estate/montana" />
                  </div>
                  
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2"><MapPin className="w-3 h-3 inline mr-1" /> Ubicación (Maps)</label>
                    <input type="url" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full bg-[#050505] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/10 transition-colors placeholder-white/20" placeholder="https://maps.google.com/?q=..." />
                  </div>
                </div>
              </div>
              
              {/* Colors */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <h4 className="text-xs uppercase tracking-widest text-white/40 mb-4 font-bold">Colores del Proyecto</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2">Color Primario</label>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input type="color" value={formData.primary_color || '#be0b3c'} onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })} className="w-14 h-14 rounded-xl border border-white/5 cursor-pointer bg-transparent" />
                        <div className="absolute inset-0 rounded-xl border-2 border-white/10 pointer-events-none" />
                      </div>
                      <div className="flex-1">
                        <input type="text" value={formData.primary_color} onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })} className="w-full bg-[#050505] border border-white/5 rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-white/10 transition-colors" placeholder="#be0b3c" />
                        <div className="mt-1.5 h-6 rounded-lg border border-white/5" style={{ backgroundColor: formData.primary_color || '#be0b3c' }} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2">Color Secundario</label>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input type="color" value={formData.secondary_color || '#000000'} onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })} className="w-14 h-14 rounded-xl border border-white/5 cursor-pointer bg-transparent" />
                        <div className="absolute inset-0 rounded-xl border-2 border-white/10 pointer-events-none" />
                      </div>
                      <div className="flex-1">
                        <input type="text" value={formData.secondary_color || ''} onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })} className="w-full bg-[#050505] border border-white/5 rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-white/10 transition-colors" placeholder="#000000" />
                        <div className="mt-1.5 h-6 rounded-lg border border-white/5" style={{ backgroundColor: formData.secondary_color || '#000000' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-4">
              {/* Images */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <h4 className="text-xs uppercase tracking-widest text-white/40 mb-4 font-bold">Imágenes</h4>
                
                <div className="space-y-4">
                  {/* Logo */}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2">Logo</label>
                    <div className="flex gap-2 items-center">
                      <input type="url" value={formData.logo_url || ''} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} className="flex-1 bg-[#050505] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/10 transition-colors placeholder-white/20" placeholder="URL o subir archivo" />
                      <label className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all flex items-center gap-2">
                        {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin text-white/60" /> : <Upload className="w-4 h-4 text-white/60" />}
                        <span className="text-[10px] text-white/60">Subir</span>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploadingLogo} />
                      </label>
                      {formData.logo_url && (
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 overflow-hidden flex-shrink-0">
                          <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-1" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Cover Image */}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2">Imagen de Portada</label>
                    <div className="flex gap-2 items-center">
                      <input type="url" value={formData.cover_image || ''} onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })} className="flex-1 bg-[#050505] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/10 transition-colors placeholder-white/20" placeholder="URL o subir archivo" />
                      <label className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all flex items-center gap-2">
                        {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin text-white/60" /> : <Upload className="w-4 h-4 text-white/60" />}
                        <span className="text-[10px] text-white/60">Subir</span>
                        <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={uploadingCover} />
                      </label>
                      {formData.cover_image && (
                        <div className="w-20 h-12 rounded-xl bg-white/5 border border-white/5 overflow-hidden flex-shrink-0">
                          <img src={formData.cover_image} alt="Cover" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Gallery */}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2">Galería de Imágenes ({formData.gallery_images?.length || 0})</label>
                    
                    {/* Upload multiple files */}
                    <div className="flex gap-2 mb-3">
                      <input type="url" id="gallery-input" placeholder="URL de imagen para agregar..." className="flex-1 bg-[#050505] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/10 transition-colors placeholder-white/20" onKeyDown={(e) => { if (e.key === 'Enter') { const input = e.target as HTMLInputElement; addGalleryImage(input.value); input.value = ''; } }} />
                      <label className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all flex items-center gap-2">
                        {uploadingGallery ? <Loader2 className="w-4 h-4 animate-spin text-white/60" /> : <Upload className="w-4 h-4 text-white/60" />}
                        <span className="text-[10px] text-white/60">Subir</span>
                        <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" disabled={uploadingGallery} />
                      </label>
                      <button onClick={() => { const input = document.getElementById('gallery-input') as HTMLInputElement; addGalleryImage(input.value); input.value = ''; }} className="px-4 py-2.5 bg-blis-red/20 border border-blis-red/30 rounded-xl text-blis-red hover:bg-blis-red/30 transition-all">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Gallery Grid */}
                    <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                      {(formData.gallery_images || []).map((img, i) => (
                        <div key={i} className="relative group">
                          <div className="aspect-square rounded-xl bg-white/5 border border-white/5 overflow-hidden">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </div>
                          <button onClick={() => removeGalleryImage(i)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                        </div>
                      ))}
                      {(!formData.gallery_images || formData.gallery_images.length === 0) && (
                        <div className="col-span-4 py-8 text-center text-white/20 text-sm">
                          Sube archivos o agrega URLs de imágenes para la galería
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Dates */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <h4 className="text-xs uppercase tracking-widest text-white/40 mb-4 font-bold">Fechas</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2">Fecha Inicio</label>
                    <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full bg-[#050505] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/10 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2">Fecha Fin</label>
                    <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="w-full bg-[#050505] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/10 transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="p-6 border-t border-white/5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-white/5 border border-white/5 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 font-bold text-[11px] uppercase tracking-[0.2em]">
            Cancelar
          </button>
          <button onClick={onSave} className="flex-1 py-3 bg-blis-red rounded-2xl text-white hover:scale-[1.01] transition-all duration-300 font-bold text-[11px] uppercase tracking-[0.2em]">
            {editingProject ? 'Guardar Cambios' : 'Crear Proyecto'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
