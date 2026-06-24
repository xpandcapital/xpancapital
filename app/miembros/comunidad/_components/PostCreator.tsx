"use client"

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  X, ImageIcon, FileUp, Loader2, Plus, Send, Calendar, BarChart3,
  Film, Mic, File,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { useMediaUpload } from '../_hooks/useComunidad'
import { useAuth } from '@/hooks/useAuth'
import { AudioRecorder } from './AudioRecorder'
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
  const videoInputRef = useRef<HTMLInputElement>(null)
  const archivoInputRef = useRef<HTMLInputElement>(null)
  const [tooltip, setTooltip] = useState<string | null>(null)
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)
  const [previewPage, setPreviewPage] = useState(0)
  const PREVIEW_PER_PAGE = 4

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, tipo: 'imagen' | 'video' | 'archivo') => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      const previewUrl = URL.createObjectURL(file)
      const id = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      setMediaPreview(prev => [...prev, { id, url: previewUrl, tipo, file }])
    }
    e.target.value = ''
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

              {/* Media preview carousel */}
              {mediaPreview.length > 0 && (() => {
                const totalPages = Math.ceil(mediaPreview.length / PREVIEW_PER_PAGE)
                const page = Math.min(previewPage, totalPages - 1)
                const items = mediaPreview.slice(page * PREVIEW_PER_PAGE, (page + 1) * PREVIEW_PER_PAGE)
                return (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      {/* Prev */}
                      <button
                        onClick={() => setPreviewPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="p-1 text-gray-600 hover:text-white disabled:opacity-20 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {/* Grid de previews */}
                      <div className="flex-1 flex gap-2 overflow-hidden">
                        {items.map(m => (
                          <div key={m.id} className="relative flex-1 min-w-0 max-w-[25%] space-y-1.5">
                            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.04]">
                              {m.tipo === 'imagen' ? (
                                <img src={m.url} alt="" className="w-full h-full object-cover" />
                              ) : m.tipo === 'video' ? (
                                <div className="w-full h-full flex items-center justify-center bg-black/20">
                                  <Film className="w-6 h-6 text-gray-500" />
                                </div>
                              ) : m.tipo === 'audio' ? (
                                <div className="w-full h-full flex items-center justify-center bg-purple-500/5">
                                  <Mic className="w-6 h-6 text-purple-400" />
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/[0.02]">
                                  <FileIconPreview name={m.file.name} type={m.file.type} />
                                </div>
                              )}
                              <button onClick={() => removePreview(m.id)} className="absolute top-1 right-1 p-0.5 bg-black/70 rounded-full">
                                <X className="w-2 h-2 text-white/80" />
                              </button>
                            </div>
                            <p className="text-[9px] text-gray-500 text-center leading-tight line-clamp-1">{m.file.name}</p>
                          </div>
                        ))}
                      </div>

                      {/* Next */}
                      <button
                        onClick={() => setPreviewPage(Math.min(totalPages - 1, page + 1))}
                        disabled={page >= totalPages - 1}
                        className="p-1 text-gray-600 hover:text-white disabled:opacity-20 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Dots */}
                    {totalPages > 1 && (
                      <div className="flex justify-center gap-1">
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setPreviewPage(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === page ? 'bg-blis-red' : 'bg-white/15'}`}
                          />
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] text-gray-600 text-center">{mediaPreview.length} archivo{mediaPreview.length > 1 ? 's' : ''}</p>
                  </div>
                )
              })()}

              {error && <p className="text-red-400 text-[11px]">{error}</p>}

              {/* Audio Recorder */}
              {showAudioRecorder && (
                <AudioRecorder
                  onRecorded={(file) => {
                    const previewUrl = URL.createObjectURL(file)
                    const id = `temp-${Date.now()}-audio`
                    setMediaPreview(prev => [...prev, { id, url: previewUrl, tipo: 'audio', file }])
                    setShowAudioRecorder(false)
                  }}
                  onCancel={() => setShowAudioRecorder(false)}
                />
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                <div className="flex items-center gap-1">
                  {/* Imagen */}
                  <div className="relative">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      onMouseEnter={() => setTooltip('img')}
                      onMouseLeave={() => setTooltip(null)}
                      className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                    {tooltip === 'img' && (
                      <div className="absolute bottom-full left-0 mb-2 w-52 bg-zinc-900 border border-white/10 rounded-xl p-2.5 shadow-xl z-30 pointer-events-none">
                        <p className="text-[11px] font-semibold text-white mb-1">📸 Imágenes</p>
                        <p className="text-[10px] text-gray-400">JPEG, PNG, WebP, GIF, AVIF</p>
                        <p className="text-[10px] text-gray-500">Máx. 20MB · Se comprimen automáticamente</p>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={e => handleFileSelect(e, 'imagen')} className="hidden" />
                  </div>

                  {/* Video */}
                  <div className="relative">
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      onMouseEnter={() => setTooltip('video')}
                      onMouseLeave={() => setTooltip(null)}
                      className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Film className="w-4 h-4" />
                    </button>
                    {tooltip === 'video' && (
                      <div className="absolute bottom-full left-0 mb-2 w-52 bg-zinc-900 border border-white/10 rounded-xl p-2.5 shadow-xl z-30 pointer-events-none">
                        <p className="text-[11px] font-semibold text-white mb-1">🎬 Video</p>
                        <p className="text-[10px] text-gray-400">MP4, WebM, MOV, AVI</p>
                        <p className="text-[10px] text-gray-500">Máx. 50MB · Se comprime a 720p</p>
                      </div>
                    )}
                    <input ref={videoInputRef} type="file" multiple accept="video/*" onChange={e => handleFileSelect(e, 'video')} className="hidden" />
                  </div>

                  {/* Archivo */}
                  <div className="relative">
                    <button
                      onClick={() => archivoInputRef.current?.click()}
                      onMouseEnter={() => setTooltip('file')}
                      onMouseLeave={() => setTooltip(null)}
                      className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <FileUp className="w-4 h-4" />
                    </button>
                    {tooltip === 'file' && (
                      <div className="absolute bottom-full left-0 mb-2 w-60 bg-zinc-900 border border-white/10 rounded-xl p-2.5 shadow-xl z-30 pointer-events-none">
                        <p className="text-[11px] font-semibold text-white mb-1">📁 Archivos</p>
                        <p className="text-[10px] text-gray-400">PDF, DOC, XLS, PPT, CSV, TXT</p>
                        <p className="text-[10px] text-gray-400">RAR, ZIP, 7Z, TAR, GZ, JSON, XML, APK, EXE</p>
                        <p className="text-[10px] text-gray-400">PDF, PSD, AI, EPS</p>
                        <p className="text-[10px] text-gray-500">Máx. 50MB</p>
                      </div>
                    )}
                    <input ref={archivoInputRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.zip,.rar,.7z,.tar,.gz,.json,.xml,.apk,.exe,.msi,.dmg,.psd,.ai,.eps" onChange={e => handleFileSelect(e, 'archivo')} className="hidden" />
                  </div>

                  {/* Audio */}
                  <div className="relative">
                    <button
                      onClick={() => setShowAudioRecorder(!showAudioRecorder)}
                      onMouseEnter={() => setTooltip('audio')}
                      onMouseLeave={() => setTooltip(null)}
                      className={`p-2 rounded-lg transition-colors ${showAudioRecorder ? 'text-blis-red bg-blis-red/5' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    {tooltip === 'audio' && (
                      <div className="absolute bottom-full left-0 mb-2 w-48 bg-zinc-900 border border-white/10 rounded-xl p-2.5 shadow-xl z-30 pointer-events-none">
                        <p className="text-[11px] font-semibold text-white mb-1">🎙️ Audio</p>
                        <p className="text-[10px] text-gray-400">Graba o sube un mensaje de voz</p>
                        <p className="text-[10px] text-gray-500">Máx. 50MB</p>
                      </div>
                    )}
                  </div>
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

function FileIconPreview({ name, type }: { name: string; type: string }) {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  const label = ext.toUpperCase().substring(0, 4)
  const color = getFileColor(ext)

  return (
    <div className={`w-12 h-12 rounded-2xl ${color.bg} flex items-center justify-center`}>
      <span className={`text-[11px] font-black ${color.text} tracking-tight`}>{label}</span>
    </div>
  )
}

function getFileColor(ext: string): { bg: string; text: string } {
  if (ext === 'pdf') return { bg: 'bg-red-500/10', text: 'text-red-400' }
  if (ext === 'doc' || ext === 'docx') return { bg: 'bg-blue-500/10', text: 'text-blue-400' }
  if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') return { bg: 'bg-emerald-500/10', text: 'text-emerald-400' }
  if (ext === 'ppt' || ext === 'pptx') return { bg: 'bg-orange-500/10', text: 'text-orange-400' }
  if (ext === 'zip' || ext === 'rar' || ext === '7z' || ext === 'tar' || ext === 'gz') return { bg: 'bg-purple-500/10', text: 'text-purple-400' }
  if (ext === 'json') return { bg: 'bg-cyan-500/10', text: 'text-cyan-400' }
  if (ext === 'xml') return { bg: 'bg-amber-500/10', text: 'text-amber-400' }
  if (ext === 'txt') return { bg: 'bg-gray-500/10', text: 'text-gray-400' }
  if (ext === 'apk') return { bg: 'bg-emerald-500/10', text: 'text-emerald-400' }
  if (ext === 'exe' || ext === 'msi' || ext === 'dmg') return { bg: 'bg-zinc-500/10', text: 'text-zinc-400' }
  if (ext === 'psd') return { bg: 'bg-blue-600/10', text: 'text-blue-300' }
  if (ext === 'ai' || ext === 'eps') return { bg: 'bg-amber-600/10', text: 'text-amber-300' }
  return { bg: 'bg-white/5', text: 'text-gray-500' }
}
