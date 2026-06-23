"use client"

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  X, ImageIcon, FileUp, Loader2, Plus, Send, Calendar, BarChart3,
  Camera, Film, Smile, MapPin, ChevronDown
} from 'lucide-react'
import { useMediaUpload } from '../_hooks/useComunidad'
import { useAuth } from '@/hooks/useAuth'
import { PostCard } from './PostCard'

interface PostCreatorProps {
  onCreated: () => void
}

type CreatorTab = 'post' | 'encuesta' | 'evento'
type MediaPreview = { id: string; url: string; tipo: string; file: File }

export function PostCreator({ onCreated }: PostCreatorProps) {
  const { user } = useAuth()
  const { uploadMedia, uploading } = useMediaUpload()
  const [expanded, setExpanded] = useState(false)
  const [tab, setTab] = useState<CreatorTab>('post')
  const [contenido, setContenido] = useState('')
  const [mediaPreview, setMediaPreview] = useState<MediaPreview[]>([])
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
  const [evImagen, setEvImagen] = useState('')

  const avatarUrl = user?.profilePic || (user as any)?.avatar_url
  const nombre = user?.nombre || 'U'

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
  }

  const resetForm = () => {
    setContenido('')
    setMediaPreview([])
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
    setEvImagen('')
    setExpanded(false)
    setTab('post')
  }

  const handleSubmit = async () => {
    setEnviando(true)
    setError(null)
    try {
      const uploadedIds: string[] = []
      for (const m of mediaPreview) {
        try {
          const result = await uploadMedia(m.file)
          if (result.id) uploadedIds.push(result.id)
        } catch (e) {
          setError(`Error al subir ${m.file.name}: ${e instanceof Error ? e.message : 'desconocido'}`)
          setEnviando(false)
          return
        }
      }

      const body: any = {}

      if (tab === 'post') {
        body.tipo = 'post'
        body.contenido = contenido || undefined
      } else if (tab === 'encuesta') {
        body.tipo = 'encuesta'
        body.contenido = contenido || undefined
        body.encuesta = { pregunta, opciones: opciones.filter(o => o.trim()), multiple: encMultiple }
      } else if (tab === 'evento') {
        body.tipo = 'evento'
        body.contenido = contenido || undefined
        body.evento = {
          titulo: evTitulo, descripcion: evDesc, imagen_url: evImagen || undefined,
          fecha_inicio: evFechaInicio, fecha_fin: evFechaFin || undefined,
          hora_inicio: evHoraInicio || undefined, hora_fin: evHoraFin || undefined,
          ubicacion: evUbicacion || undefined,
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

      resetForm()
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al publicar')
    } finally {
      setEnviando(false)
    }
  }

  const canSubmit = tab === 'encuesta'
    ? pregunta.trim() && opciones.filter(o => o.trim()).length >= 2
    : tab === 'evento'
      ? !!evTitulo.trim() && !!evFechaInicio
      : true

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Inline prompt */}
      <div
        className="px-4 py-3 flex items-center gap-3 cursor-pointer"
        onClick={() => !expanded && setExpanded(true)}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blis-red/30 to-purple-500/30 overflow-hidden flex-shrink-0">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" width={40} height={40} className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-sm font-bold text-white/40">{nombre.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>
        <div className="flex-1 bg-white/[0.03] hover:bg-white/[0.04] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-gray-500 transition-colors">
          ¿Qué quieres compartir, {nombre.trim().split(' ')[0]}...?
        </div>
      </div>

      {/* Expanded editor */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-white/[0.04] pt-3">
              {/* Tabs */}
              <div className="flex gap-1">
                {([
                  { id: 'post' as const, icon: Send, label: 'Publicar' },
                  { id: 'encuesta' as const, icon: BarChart3, label: 'Encuesta' },
                  { id: 'evento' as const, icon: Calendar, label: 'Evento' },
                ]).map(({ id, icon: IconComp, label }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
                      tab === id ? 'bg-blis-red/10 text-blis-red' : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                    }`}
                  >
                    <IconComp className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Texto principal */}
              <textarea
                value={contenido}
                onChange={e => setContenido(e.target.value)}
                placeholder={tab === 'encuesta' ? 'Describe tu encuesta...' : tab === 'evento' ? 'Describe tu evento...' : 'Escribe algo...'}
                className="w-full bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none resize-none min-h-[60px]"
                autoFocus
              />

              {/* Encuesta */}
              {tab === 'encuesta' && (
                <div className="space-y-2 bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                  <input
                    type="text" value={pregunta} onChange={e => setPregunta(e.target.value)}
                    placeholder="Pregunta de la encuesta"
                    className="w-full bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
                  />
                  {opciones.map((op, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text" value={op} onChange={e => { const n = [...opciones]; n[i] = e.target.value; setOpciones(n) }}
                        placeholder={`Opción ${i + 1}`}
                        className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none border-b border-white/[0.06] pb-1.5"
                      />
                      {opciones.length > 2 && (
                        <button onClick={() => setOpciones(prev => prev.filter((_, idx) => idx !== i))} className="p-1 text-gray-600 hover:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setOpciones(prev => [...prev, ''])} className="text-[11px] text-blis-red hover:text-blis-red/80">
                    + Agregar opción
                  </button>
                  <label className="flex items-center gap-2 text-[11px] text-gray-500">
                    <input type="checkbox" checked={encMultiple} onChange={e => setEncMultiple(e.target.checked)} />
                    Respuesta múltiple
                  </label>
                </div>
              )}

              {/* Evento */}
              {tab === 'evento' && (
                <div className="space-y-3 bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                  <input type="text" value={evTitulo} onChange={e => setEvTitulo(e.target.value)} placeholder="🎯 Título del evento *" className="w-full bg-transparent text-sm font-semibold text-white placeholder-gray-600 focus:outline-none" />
                  <textarea value={evDesc} onChange={e => setEvDesc(e.target.value)} placeholder="Descripción del evento..." className="w-full bg-transparent text-xs text-white placeholder-gray-600 focus:outline-none min-h-[40px] resize-none" />

                  {/* Tipo + Capacidad */}
                  <div className="grid grid-cols-2 gap-2">
                    <select value={evTipo} onChange={e => setEvTipo(e.target.value as any)} className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/10 cursor-pointer">
                      <option value="presencial">📍 Presencial</option>
                      <option value="digital">💻 Digital</option>
                      <option value="hibrido">🔀 Híbrido</option>
                    </select>
                    <input type="number" value={evCapacidad || ''} onChange={e => setEvCapacidad(e.target.value ? parseInt(e.target.value) : null)} placeholder="👥 Capacidad (opcional)" className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-white/10" />
                  </div>

                  {/* Fechas */}
                  <div>
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Fecha y hora</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-gray-600 block mb-1">Inicio *</label>
                        <input type="date" value={evFechaInicio} onChange={e => setEvFechaInicio(e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/10 cursor-pointer [color-scheme:dark]" />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-600 block mb-1">Fin</label>
                        <input type="date" value={evFechaFin} onChange={e => setEvFechaFin(e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/10 cursor-pointer [color-scheme:dark]" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <label className="text-[9px] text-gray-600 block mb-1">Hora inicio</label>
                        <input type="time" value={evHoraInicio} onChange={e => setEvHoraInicio(e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/10 cursor-pointer [color-scheme:dark]" />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-600 block mb-1">Hora fin</label>
                        <input type="time" value={evHoraFin} onChange={e => setEvHoraFin(e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/10 cursor-pointer [color-scheme:dark]" />
                      </div>
                    </div>
                  </div>

                  {/* Ubicación / URL */}
                  {evTipo !== 'digital' && (
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Ubicación</p>
                      <input type="text" value={evUbicacion} onChange={e => setEvUbicacion(e.target.value)} placeholder="📍 Dirección o lugar del evento" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-white/10" />
                    </div>
                  )}
                  {evTipo !== 'presencial' && (
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Enlace</p>
                      <input type="url" value={evUrlEvento} onChange={e => setEvUrlEvento(e.target.value)} placeholder="🔗 URL de Zoom, Google Meet, etc." className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-white/10" />
                    </div>
                  )}
                </div>
              )}

              {/* Media preview */}
              {mediaPreview.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {mediaPreview.map(m => (
                    <div key={m.id} className="relative w-20 h-20 rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.04] flex-shrink-0">
                      {m.tipo === 'imagen' ? (
                        <img src={m.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">{m.tipo === 'video' ? <Film className="w-6 h-6 text-gray-600" /> : <FileUp className="w-6 h-6 text-gray-600" />}</div>
                      )}
                      <button onClick={() => removePreview(m.id)} className="absolute top-1 right-1 p-0.5 bg-black/70 rounded-full">
                        <X className="w-2.5 h-2.5 text-white/80" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && <p className="text-red-400 text-[11px]">{error}</p>}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                <div className="flex items-center gap-1">
                  <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors" title="Imagen/Video">
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors" title="Archivo">
                    <FileUp className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors hidden sm:block" title="Emoji">
                    <Smile className="w-4 h-4" />
                  </button>
                  <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.zip" onChange={handleFileSelect} className="hidden" />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={resetForm} className="px-3 py-1.5 text-[11px] text-gray-500 hover:text-white transition-colors">
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={enviando || uploading || !canSubmit}
                    className="px-4 py-2 bg-blis-red hover:bg-blis-red/90 rounded-xl text-xs font-bold text-white transition-colors disabled:opacity-40 flex items-center gap-1.5"
                  >
                    {enviando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Publicar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
