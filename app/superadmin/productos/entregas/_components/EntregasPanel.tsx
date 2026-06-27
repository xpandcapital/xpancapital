"use client"

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Video, FileArchive, Plus, Trash2, Edit2, Save,
  Loader2, ExternalLink, Link as LinkIcon,
  Upload, FileText
} from 'lucide-react'
import { useProductoEntregas, type ProductoVideo, type ProductoArchivo } from '../_hooks/useProductosEntregas'
import { uploadFileToStorage, getFileExtension, formatFileSize } from '@/lib/supabase/storage'

interface EntregasPanelProps {
  productoId: string | null
  productoNombre: string
  onClose: () => void
}

type TabType = 'videos' | 'archivos' | 'instrucciones'

export function EntregasPanel({ productoId, productoNombre, onClose }: EntregasPanelProps) {
  const {
    data,
    loading,
    saving,
    addVideo,
    updateVideo,
    deleteVideo,
    addArchivo,
    updateArchivo,
    deleteArchivo,
    updateDescripcionEntrega
  } = useProductoEntregas(productoId)

  const [activeTab, setActiveTab] = useState<TabType>('videos')
  const [editingVideo, setEditingVideo] = useState<ProductoVideo | null>(null)
  const [editingArchivo, setEditingArchivo] = useState<ProductoArchivo | null>(null)
  const [showAddVideo, setShowAddVideo] = useState(false)
  const [showAddArchivo, setShowAddArchivo] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [descripcion, setDescripcion] = useState(data?.descripcion_entrega || '')

  const handleAddVideo = async (videoData: Omit<ProductoVideo, 'id' | 'producto_id' | 'orden'>) => {
    try {
      await addVideo({ ...videoData, orden: (data?.videos.length || 0) + 1 })
      setShowAddVideo(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('¿Eliminar este video?')) return
    try {
      await deleteVideo(id)
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdateVideo = async () => {
    if (!editingVideo) return
    try {
      await updateVideo(editingVideo.id, {
        titulo: editingVideo.titulo,
        video_url: editingVideo.video_url
      })
      setEditingVideo(null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddArchivo = async (archivoData: Omit<ProductoArchivo, 'id' | 'producto_id' | 'orden'>) => {
    try {
      await addArchivo({ ...archivoData, orden: (data?.archivos.length || 0) + 1 })
      setShowAddArchivo(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdateArchivo = async () => {
    if (!editingArchivo) return
    try {
      await updateArchivo(editingArchivo.id, editingArchivo)
      setEditingArchivo(null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteArchivo = async (id: string) => {
    if (!confirm('¿Eliminar este archivo?')) return
    try {
      await deleteArchivo(id)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSaveDescripcion = async () => {
    try {
      await updateDescripcionEntrega(descripcion)
    } catch (err) {
      console.error(err)
    }
  }

  const handleUploadFile = useCallback(async (file: File, tipoEntrega: 'archivo' | 'enlace') => {
    if (tipoEntrega === 'enlace') {
      return { url: '', name: file.name, size: file.size }
    }

    setUploading(true)
    try {
      const result = await uploadFileToStorage('productos', 'archivos', file)
      return result
    } catch (err) {
      console.error(err)
      throw err
    } finally {
      setUploading(false)
    }
  }, [])

  if (!productoId) return null

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.3 }}
      className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-zinc-950 border-l border-white/10 z-50 flex flex-col"
    >
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div>
          <h2 className="text-xl font-black text-white">Gestionar Entregas</h2>
          <p className="text-sm text-gray-400 mt-1">{productoNombre}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex-1 px-4 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${
            activeTab === 'videos'
              ? 'text-blis-red border-b-2 border-blis-red'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Video className="w-4 h-4 inline mr-2" />
          Videos ({data?.videos.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('archivos')}
          className={`flex-1 px-4 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${
            activeTab === 'archivos'
              ? 'text-blis-red border-b-2 border-blis-red'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileArchive className="w-4 h-4 inline mr-2" />
          Archivos ({data?.archivos.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('instrucciones')}
          className={`flex-1 px-4 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${
            activeTab === 'instrucciones'
              ? 'text-blis-red border-b-2 border-blis-red'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Instrucciones
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
          </div>
        ) : (
          <>
            {activeTab === 'videos' && (
              <VideosTab
                videos={data?.videos || []}
                editingVideo={editingVideo}
                setEditingVideo={setEditingVideo}
                showAdd={showAddVideo}
                setShowAdd={setShowAddVideo}
                saving={saving}
                onAdd={handleAddVideo}
                onUpdate={handleUpdateVideo}
                onDelete={handleDeleteVideo}
              />
            )}

            {activeTab === 'archivos' && (
              <ArchivosTab
                archivos={data?.archivos || []}
                editingArchivo={editingArchivo}
                setEditingArchivo={setEditingArchivo}
                showAdd={showAddArchivo}
                setShowAdd={setShowAddArchivo}
                saving={saving}
                uploading={uploading}
                onAdd={handleAddArchivo}
                onUpdate={handleUpdateArchivo}
                onDelete={handleDeleteArchivo}
                onUpload={handleUploadFile}
              />
            )}

            {activeTab === 'instrucciones' && (
              <InstruccionesTab
                descripcion={descripcion}
                setDescripcion={setDescripcion}
                saving={saving}
                onSave={handleSaveDescripcion}
              />
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}

function VideosTab({
  videos,
  editingVideo,
  setEditingVideo,
  showAdd,
  setShowAdd,
  saving,
  onAdd,
  onUpdate,
  onDelete
}: {
  videos: ProductoVideo[]
  editingVideo: ProductoVideo | null
  setEditingVideo: (v: ProductoVideo | null) => void
  showAdd: boolean
  setShowAdd: (v: boolean) => void
  saving: boolean
  onAdd: (v: Omit<ProductoVideo, 'id' | 'producto_id' | 'orden'>) => void
  onUpdate: () => void
  onDelete: (id: string) => void
}) {
  const [newVideo, setNewVideo] = useState({ titulo: '', video_url: '', descripcion: '', duracion_min: '' as number | '' })

  const handleAdd = () => {
    onAdd({
      titulo: newVideo.titulo,
      video_url: newVideo.video_url,
      descripcion: newVideo.descripcion || null,
      duracion_min: newVideo.duracion_min || null
    })
    setNewVideo({ titulo: '', video_url: '', descripcion: '', duracion_min: '' })
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowAdd(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blis-red/20 hover:bg-blis-red/30 text-blis-red font-bold uppercase tracking-widest rounded-xl transition-colors"
      >
        <Plus className="w-4 h-4" />
        Agregar Video
      </button>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-4"
          >
            <input
              type="text"
              placeholder="Título del video"
              value={newVideo.titulo}
              onChange={(e) => setNewVideo({ ...newVideo, titulo: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blis-red"
            />
            <input
              type="text"
              placeholder="URL de YouTube/Vimeo (embed)"
              value={newVideo.video_url}
              onChange={(e) => setNewVideo({ ...newVideo, video_url: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blis-red"
            />
            <textarea
              placeholder="Descripción (opcional)"
              value={newVideo.descripcion}
              onChange={(e) => setNewVideo({ ...newVideo, descripcion: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blis-red resize-none"
            />
            <input
              type="number"
              placeholder="Duración en minutos (opcional)"
              value={newVideo.duracion_min}
              onChange={(e) => setNewVideo({ ...newVideo, duracion_min: e.target.value ? Number(e.target.value) : '' })}
              className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blis-red"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={saving || !newVideo.titulo || !newVideo.video_url}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blis-red text-white font-bold uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-3 bg-white/5 text-gray-400 font-bold uppercase tracking-widest rounded-xl transition-colors hover:bg-white/10"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {videos.length === 0 && !showAdd && (
        <div className="text-center py-8 text-gray-500">
          <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No hay videos agregados</p>
        </div>
      )}

      <div className="space-y-3">
        {videos.map((video) => (
          <div key={video.id} className="bg-black/40 border border-white/5 rounded-xl p-4">
            {editingVideo?.id === video.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editingVideo.titulo}
                  onChange={(e) => setEditingVideo({ ...editingVideo, titulo: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blis-red"
                />
                <input
                  type="text"
                  value={editingVideo.video_url}
                  onChange={(e) => setEditingVideo({ ...editingVideo, video_url: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blis-red"
                />
                <div className="flex gap-2">
                  <button
                    onClick={onUpdate}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blis-red text-white font-bold text-xs uppercase rounded-lg disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingVideo(null)}
                    className="px-3 py-2 bg-white/5 text-gray-400 font-bold text-xs uppercase rounded-lg"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="w-16 h-12 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                  {video.video_url && (
                    <iframe
                      src={video.video_url}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{video.titulo}</p>
                  {video.descripcion && (
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{video.descripcion}</p>
                  )}
                  {video.duracion_min && (
                    <p className="text-gray-600 text-xs mt-1">{video.duracion_min} min</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingVideo(video)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => onDelete(video.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ArchivosTab({
  archivos,
  editingArchivo,
  setEditingArchivo,
  showAdd,
  setShowAdd,
  saving,
  uploading,
  onAdd,
  onUpdate,
  onDelete,
  onUpload
}: {
  archivos: ProductoArchivo[]
  editingArchivo: ProductoArchivo | null
  setEditingArchivo: (a: ProductoArchivo | null) => void
  showAdd: boolean
  setShowAdd: (v: boolean) => void
  saving: boolean
  uploading: boolean
  onAdd: (a: Omit<ProductoArchivo, 'id' | 'producto_id' | 'orden'>) => void
  onUpdate: () => void
  onDelete: (id: string) => void
  onUpload: (file: File, tipo: 'archivo' | 'enlace') => Promise<{ url: string; name: string; size: number }>
}) {
  const [newArchivo, setNewArchivo] = useState({
    nombre: '',
    archivo_url: '',
    tamano_bytes: null as number | null,
    tipo_entrega: 'archivo' as 'archivo' | 'enlace',
    tipo_archivo: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleAdd = async () => {
    let url = newArchivo.archivo_url
    let size = newArchivo.tamano_bytes

    if (selectedFile && newArchivo.tipo_entrega === 'archivo') {
      const result = await onUpload(selectedFile, 'archivo')
      url = result.url
      size = result.size
    }

    onAdd({
      nombre: newArchivo.nombre,
      archivo_url: url,
      tamano_bytes: size,
      tipo_entrega: newArchivo.tipo_entrega,
      tipo_archivo: newArchivo.tipo_archivo || getFileExtension(newArchivo.nombre)
    })
    setNewArchivo({ nombre: '', archivo_url: '', tamano_bytes: null, tipo_entrega: 'archivo', tipo_archivo: '' })
    setSelectedFile(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setNewArchivo({
        ...newArchivo,
        nombre: newArchivo.nombre || file.name,
        tamano_bytes: file.size
      })
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowAdd(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blis-red/20 hover:bg-blis-red/30 text-blis-red font-bold uppercase tracking-widest rounded-xl transition-colors"
      >
        <Plus className="w-4 h-4" />
        Agregar Archivo
      </button>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-4"
          >
            <div className="flex gap-2">
              <button
                onClick={() => setNewArchivo({ ...newArchivo, tipo_entrega: 'archivo' })}
                className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-widest transition-colors ${
                  newArchivo.tipo_entrega === 'archivo'
                    ? 'bg-blis-red text-white'
                    : 'bg-white/5 text-gray-400'
                }`}
              >
                <FileArchive className="w-4 h-4 inline mr-2" />
                Archivo
              </button>
              <button
                onClick={() => setNewArchivo({ ...newArchivo, tipo_entrega: 'enlace' })}
                className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-widest transition-colors ${
                  newArchivo.tipo_entrega === 'enlace'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/5 text-gray-400'
                }`}
              >
                <LinkIcon className="w-4 h-4 inline mr-2" />
                Enlace
              </button>
            </div>

            <input
              type="text"
              placeholder="Nombre del archivo"
              value={newArchivo.nombre}
              onChange={(e) => setNewArchivo({ ...newArchivo, nombre: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blis-red"
            />

            {newArchivo.tipo_entrega === 'archivo' ? (
              <>
                <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {uploading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-blis-red mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-500 mb-2" />
                    )}
                    <span className="text-gray-400 text-sm">
                      {selectedFile ? selectedFile.name : 'Subir archivo'}
                    </span>
                    {selectedFile && (
                      <span className="text-gray-500 text-xs mt-1">
                        {formatFileSize(selectedFile.size)}
                      </span>
                    )}
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="O pegar URL directa"
                  value={newArchivo.archivo_url}
                  onChange={(e) => setNewArchivo({ ...newArchivo, archivo_url: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blis-red"
                />
              </>
            ) : (
              <input
                type="text"
                placeholder="URL del enlace (Notion, Figma, etc.)"
                value={newArchivo.archivo_url}
                onChange={(e) => setNewArchivo({ ...newArchivo, archivo_url: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blis-red"
              />
            )}

            <input
              type="text"
              placeholder="Tipo (zip, pdf, notion, figma, etc.)"
              value={newArchivo.tipo_archivo}
              onChange={(e) => setNewArchivo({ ...newArchivo, tipo_archivo: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blis-red"
            />

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={saving || !newArchivo.nombre || (!newArchivo.archivo_url && !selectedFile)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blis-red text-white font-bold uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar
              </button>
              <button
                onClick={() => { setShowAdd(false); setSelectedFile(null); }}
                className="px-4 py-3 bg-white/5 text-gray-400 font-bold uppercase tracking-widest rounded-xl transition-colors hover:bg-white/10"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {archivos.length === 0 && !showAdd && (
        <div className="text-center py-8 text-gray-500">
          <FileArchive className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No hay archivos agregados</p>
        </div>
      )}

      <div className="space-y-3">
        {archivos.map((archivo) => (
          <div key={archivo.id} className="bg-black/40 border border-white/5 rounded-xl p-4">
            {editingArchivo?.id === archivo.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editingArchivo.nombre}
                  onChange={(e) => setEditingArchivo({ ...editingArchivo, nombre: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blis-red"
                />
                <input
                  type="text"
                  value={editingArchivo.archivo_url}
                  onChange={(e) => setEditingArchivo({ ...editingArchivo, archivo_url: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blis-red"
                />
                <div className="flex gap-2">
                  <button
                    onClick={onUpdate}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blis-red text-white font-bold text-xs uppercase rounded-lg disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingArchivo(null)}
                    className="px-3 py-2 bg-white/5 text-gray-400 font-bold text-xs uppercase rounded-lg"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  archivo.tipo_entrega === 'enlace' ? 'bg-purple-500/20' : 'bg-amber-500/20'
                }`}>
                  {archivo.tipo_entrega === 'enlace' ? (
                    <LinkIcon className="w-5 h-5 text-purple-400" />
                  ) : (
                    <FileArchive className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{archivo.nombre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      archivo.tipo_entrega === 'enlace'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {archivo.tipo_entrega === 'enlace' ? 'Enlace' : archivo.tipo_archivo || 'Archivo'}
                    </span>
                    {archivo.tamano_bytes && (
                      <span className="text-gray-500 text-xs">{formatFileSize(archivo.tamano_bytes)}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => window.open(archivo.archivo_url, '_blank')}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => setEditingArchivo(archivo)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => onDelete(archivo.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function InstruccionesTab({
  descripcion,
  setDescripcion,
  saving,
  onSave
}: {
  descripcion: string
  setDescripcion: (v: string) => void
  saving: boolean
  onSave: () => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm">
        Agrega instrucciones HTML que se mostrarán al cliente con el contenido de su compra.
        Puedes usar etiquetas como: <code className="bg-white/10 px-1 rounded">&lt;b&gt;</code>,{' '}
        <code className="bg-white/10 px-1 rounded">&lt;ul&gt;</code>,{' '}
        <code className="bg-white/10 px-1 rounded">&lt;li&gt;</code>,{' '}
        <code className="bg-white/10 px-1 rounded">&lt;a href&gt;</code>
      </p>

      <textarea
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        rows={15}
        placeholder="<p>¡Gracias por tu compra!</p>&#10;<p>Para acceder a tu producto:</p>&#10;<ul>&#10;  <li>Paso 1: Haz clic en el botón de descarga</li>&#10;  <li>Paso 2: Disfruta del contenido</li>&#10;</ul>"
        className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blis-red resize-none font-mono text-sm"
      />

      <button
        onClick={onSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blis-red text-white font-bold uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Guardar Instrucciones
      </button>

      <div className="border border-white/10 rounded-xl p-4">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Vista Previa</p>
        <div
          className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-gray-300 prose-a:text-blis-red prose-strong:text-white prose-li:text-gray-300"
          dangerouslySetInnerHTML={{ __html: descripcion || '<p class="text-gray-500">Sin contenido</p>' }}
        />
      </div>
    </div>
  )
}
