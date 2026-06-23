"use client"

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ImageIcon, Film, FileUp, Loader2, Plus, Send, Calendar, BarChart3, Upload } from 'lucide-react'
import { useMediaUpload } from '../_hooks/useComunidad'
import { useAuth } from '@/hooks/useAuth'

interface PostCreatorProps {
  open: boolean
  onClose: () => void
  onCreated: (post: any) => void
}

type CreatorTab = 'post' | 'encuesta' | 'evento'
type MediaPreview = { id: string; url: string; tipo: string; file: File }

export function PostCreator({ open, onClose, onCreated }: PostCreatorProps) {
  const { user } = useAuth()
  const { uploadMedia, uploading } = useMediaUpload()
  const [tab, setTab] = useState<CreatorTab>('post')
  const [contenido, setContenido] = useState('')
  const [mediaPreview, setMediaPreview] = useState<MediaPreview[]>([])
  const [mediaIds, setMediaIds] = useState<string[]>([])
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Encuesta
  const [pregunta, setPregunta] = useState('')
  const [opciones, setOpciones] = useState<string[]>(['', ''])
  const [encMultiple, setEncMultiple] = useState(false)

  // Evento
  const [evTitulo, setEvTitulo] = useState('')
  const [evDesc, setEvDesc] = useState('')
  const [evFechaInicio, setEvFechaInicio] = useState('')
  const [evFechaFin, setEvFechaFin] = useState('')
  const [evHoraInicio, setEvHoraInicio] = useState('')
  const [evHoraFin, setEvHoraFin] = useState('')
  const [evUbicacion, setEvUbicacion] = useState('')
  const [evTipo, setEvTipo] = useState<'presencial' | 'digital' | 'hibrido'>('presencial')
  const [evUrlEvento, setEvUrlEvento] = useState('')
  const [evCapacidad, setEvCapacidad] = useState<number | null>(null)

  const isAdmin = ['superadmin', 'admin'].includes(user?.role || '')

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      const previewUrl = URL.createObjectURL(file)
      const id = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      const tipo = file.type.startsWith('image/') ? 'imagen' : file.type.startsWith('video/') ? 'video' : 'archivo'
      setMediaPreview(prev => [...prev, { id, url: previewUrl, tipo, file }])
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removePreview = (id: string) => {
    setMediaPreview(prev => prev.filter(m => m.id !== id))
    setMediaIds(prev => prev.filter(mid => mid !== id))
  }

  const handleSubmit = async () => {
    setEnviando(true)
    setError(null)
    try {
      // Subir media primero
      const uploadedIds: string[] = []
      for (const m of mediaPreview) {
        try {
          const result = await uploadMedia(m.file)
          uploadedIds.push(result.url_original)
        } catch {}
      }

      const body: any = {}

      if (tab === 'post') {
        body.tipo = isAdmin ? (window.confirm('¿Publicar como anuncio?') ? 'anuncio' : 'post') : 'post'
        body.contenido = contenido || undefined
      } else if (tab === 'encuesta') {
        body.tipo = 'encuesta'
        body.contenido = contenido || undefined
        body.encuesta = { pregunta, opciones: opciones.filter(o => o.trim()), multiple: encMultiple }
      } else if (tab === 'evento') {
        body.tipo = 'evento'
        body.contenido = contenido || undefined
        body.evento = {
          titulo: evTitulo, descripcion: evDesc, fecha_inicio: evFechaInicio,
          fecha_fin: evFechaFin || undefined, hora_inicio: evHoraInicio || undefined,
          hora_fin: evHoraFin || undefined, ubicacion: evUbicacion || undefined,
          es_digital: evTipo !== 'presencial', url_evento: evUrlEvento || undefined,
          tipo: evTipo, capacidad: evCapacidad || undefined
        }
      }

      if (uploadedIds.length > 0) body.media_ids = uploadedIds

      const res = await fetch('/api/comunidad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)

      onCreated(json.data)
      resetForm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al publicar')
    } finally {
      setEnviando(false)
    }
  }

  const resetForm = () => {
    setContenido('')
    setMediaPreview([])
    setMediaIds([])
    setPregunta('')
    setOpciones(['', ''])
    setEncMultiple(false)
    setEvTitulo('')
    setEvDesc('')
    setEvFechaInicio('')
    setEvFechaFin('')
    setEvHoraInicio('')
    setEvHoraFin('')
    setEvUbicacion('')
    setEvTipo('presencial')
    setEvUrlEvento('')
    setEvCapacidad(null)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center pt-[10vh] px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-zinc-950 border border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col shadow-2xl shadow-blis-red/5"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="text-white font-bold text-sm">Crear publicación</h3>
              <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/[0.06]">
              {([
                { id: 'post' as const, Icon: Send, label: 'Post' },
                { id: 'encuesta' as const, Icon: BarChart3, label: 'Encuesta' },
                { id: 'evento' as const, Icon: Calendar, label: 'Evento' },
              ]).map(({ id, Icon: IconComp, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    tab === id ? 'text-blis-red border-b-2 border-blis-red' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Texto común */}
              <textarea
                value={contenido}
                onChange={e => setContenido(e.target.value)}
                placeholder={tab === 'encuesta' ? 'Describe tu encuesta...' : tab === 'evento' ? 'Describe tu evento...' : '¿Qué quieres compartir?'}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/10 resize-none min-h-[80px]"
              />

              {/* Formulario de encuesta */}
              {tab === 'encuesta' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={pregunta}
                    onChange={e => setPregunta(e.target.value)}
                    placeholder="Pregunta de la encuesta"
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/10"
                  />
                  {opciones.map((op, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={op}
                        onChange={e => {
                          const newOps = [...opciones]
                          newOps[i] = e.target.value
                          setOpciones(newOps)
                        }}
                        placeholder={`Opción ${i + 1}`}
                        className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/10"
                      />
                      {opciones.length > 2 && (
                        <button
                          onClick={() => setOpciones(prev => prev.filter((_, idx) => idx !== i))}
                          className="p-2 text-gray-600 hover:text-red-400"
                        ><X className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setOpciones(prev => [...prev, ''])}
                    className="text-xs text-blis-red hover:text-blis-red/80 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Agregar opción
                  </button>
                  <label className="flex items-center gap-2 text-xs text-gray-500">
                    <input type="checkbox" checked={encMultiple} onChange={e => setEncMultiple(e.target.checked)} className="rounded" />
                    Permitir múltiples respuestas
                  </label>
                </div>
              )}

              {/* Formulario de evento */}
              {tab === 'evento' && (
                <div className="space-y-3">
                  <input type="text" value={evTitulo} onChange={e => setEvTitulo(e.target.value)} placeholder="Título del evento *" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/10" />
                  <textarea value={evDesc} onChange={e => setEvDesc(e.target.value)} placeholder="Descripción" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/10 resize-none min-h-[60px]" />
                  <div className="flex gap-2">
                    <select value={evTipo} onChange={e => setEvTipo(e.target.value as any)} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white">
                      <option value="presencial">Presencial</option>
                      <option value="digital">Digital</option>
                      <option value="hibrido">Híbrido</option>
                    </select>
                    <input type="number" value={evCapacidad || ''} onChange={e => setEvCapacidad(e.target.value ? parseInt(e.target.value) : null)} placeholder="Capacidad" className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/10" />
                  </div>
                  <div className="flex gap-2">
                    <input type="date" value={evFechaInicio} onChange={e => setEvFechaInicio(e.target.value)} className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/10" />
                    <input type="date" value={evFechaFin} onChange={e => setEvFechaFin(e.target.value)} className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/10" />
                  </div>
                  <div className="flex gap-2">
                    <input type="time" value={evHoraInicio} onChange={e => setEvHoraInicio(e.target.value)} className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/10" />
                    <input type="time" value={evHoraFin} onChange={e => setEvHoraFin(e.target.value)} className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/10" />
                  </div>
                  {evTipo !== 'digital' && (
                    <input type="text" value={evUbicacion} onChange={e => setEvUbicacion(e.target.value)} placeholder="Ubicación" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/10" />
                  )}
                  {evTipo !== 'presencial' && (
                    <input type="url" value={evUrlEvento} onChange={e => setEvUrlEvento(e.target.value)} placeholder="URL del evento (Zoom, Meet, etc.)" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/10" />
                  )}
                </div>
              )}

              {/* Media preview */}
              {mediaPreview.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {mediaPreview.map(m => (
                    <div key={m.id} className="relative rounded-lg overflow-hidden bg-white/[0.03] border border-white/[0.04] aspect-square">
                      {m.tipo === 'imagen' ? (
                        <img src={m.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {m.tipo === 'video' ? <Film className="w-8 h-8 text-gray-600" /> : <FileUp className="w-8 h-8 text-gray-600" />}
                        </div>
                      )}
                      <button onClick={() => removePreview(m.id)} className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white/80 hover:text-white">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && <p className="text-red-400 text-xs">{error}</p>}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/[0.06] flex items-center justify-between">
              <div className="flex gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                  title="Adjuntar imágenes/videos"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                  title="Adjuntar archivos"
                >
                  <FileUp className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.zip"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              <div className="flex items-center gap-2">
                {uploading && <span className="text-xs text-gray-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Subiendo...</span>}
                <button
                  onClick={handleSubmit}
                  disabled={enviando || uploading || (tab === 'encuesta' && (!pregunta.trim() || opciones.filter(o => o.trim()).length < 2)) || (tab === 'evento' && !evTitulo.trim())}
                  className="px-4 py-2 bg-blis-red hover:bg-blis-red/90 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-40 flex items-center gap-2"
                >
                  {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Publicar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
