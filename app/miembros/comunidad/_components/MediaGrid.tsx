"use client"

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, ChevronLeft, ChevronRight, Play, FileText, Download,
  Heart, MessageCircle, Send, ThumbsUp, PartyPopper, Lightbulb, Frown,
  Loader2, CornerDownRight
} from 'lucide-react'
import type { ComunidadPostMedia, ComunidadPost, ReaccionTipo } from '../_types'
import { useAuth } from '@/hooks/useAuth'
import { useComentarios } from '../_hooks/useComunidad'

interface MediaGridProps {
  media: ComunidadPostMedia[]
  post?: ComunidadPost
  onReaccionar?: (postId: string, tipo: ReaccionTipo) => void
}

const REACCIONES = [
  { tipo: 'like' as const, Icon: ThumbsUp, label: 'Me gusta', color: 'text-blue-400' },
  { tipo: 'celebrar' as const, Icon: PartyPopper, label: 'Celebrar', color: 'text-yellow-400' },
  { tipo: 'apoyar' as const, Icon: Heart, label: 'Apoyar', color: 'text-red-400' },
  { tipo: 'interesante' as const, Icon: Lightbulb, label: 'Interesante', color: 'text-amber-400' },
  { tipo: 'triste' as const, Icon: Frown, label: 'Triste', color: 'text-purple-400' },
]

export function MediaGrid({ media, post, onReaccionar }: MediaGridProps) {
  return <MediaGridInner media={media} post={post} onReaccionar={onReaccionar} />
}

function MediaGridInner({ media, post, onReaccionar }: MediaGridProps) {
  const [modalIndex, setModalIndex] = useState<number | null>(null)
  const soloImagenes = media.filter(m => m.tipo === 'imagen')
  const count = soloImagenes.length

  const openModal = (index: number) => {
    const realIndex = media.findIndex(m => m.tipo === 'imagen' && soloImagenes.indexOf(m) === index)
    // Buscar el índice real dentro del array visual
    const visualIdx = media.findIndex(m => m.id === soloImagenes[index]?.id)
    setModalIndex(visualIdx)
  }

  const getContainerClass = () => {
    if (media.length === 1) return 'grid-cols-1'
    if (media.length === 2) return 'grid-cols-2'
    if (media.length === 3) return 'grid-cols-2'
    return 'grid-cols-2'
  }

  return (
    <>
      <div className={`grid ${getContainerClass()} gap-1.5`}>
        {media.map((item, i) => {
          if (item.tipo === 'imagen') {
            const isSingle = media.length === 1
            const isLarge = media.length === 3 && i === 0
            return (
              <div
                key={item.id}
                className={`relative rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.04] cursor-pointer group ${
                  isLarge ? 'row-span-2' : ''
                } ${isSingle ? 'max-h-[500px] flex items-center justify-center bg-black/30' : 'aspect-square'}`}
                onClick={() => openModal(soloImagenes.findIndex(m => m.id === item.id))}
              >
                <Image
                  src={item.url_comprimida || item.url_original}
                  alt=""
                  width={isSingle ? 1200 : 600}
                  height={isSingle ? 900 : 600}
                  className={`transition-transform duration-300 group-hover:scale-105 ${
                    isSingle ? 'max-h-[500px] w-auto h-auto object-contain' : 'w-full h-full object-cover'
                  }`}
                  unoptimized={isSingle}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
            )
          }
          if (item.tipo === 'video') {
            return (
              <div key={item.id} className="relative aspect-video bg-black/40 rounded-xl overflow-hidden border border-white/[0.04] flex items-center justify-center cursor-pointer group">
                {item.url_thumbnail ? (
                  <Image src={item.url_thumbnail} alt="" fill className="object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-blis-red/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                </div>
              </div>
            )
          }
          // Archivo
          return (
            <div key={item.id} className="flex items-center gap-3 p-4 bg-white/[0.02] rounded-xl border border-white/[0.04] min-h-[80px]">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 truncate">{item.nombre_archivo || 'Archivo'}</p>
                <p className="text-xs text-gray-500">{formatBytes(item.tamaño_original)}</p>
              </div>
              <a href={item.url_original} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <Download className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          )
        })}
      </div>

      {/* Modal Facebook-style */}
      <AnimatePresence>
        {modalIndex !== null && post && (
          <PostModal
            media={media}
            startIndex={modalIndex}
            post={post}
            onReaccionar={onReaccionar}
            onClose={() => setModalIndex(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

interface PostModalProps {
  media: ComunidadPostMedia[]
  startIndex: number
  post: ComunidadPost
  onReaccionar?: (postId: string, tipo: ReaccionTipo) => void
  onClose: () => void
}

function PostModal({ media, startIndex, post, onReaccionar, onClose }: PostModalProps) {
  const { user } = useAuth()
  const { comentarios, loading: loadingComments, fetchComentarios, crearComentario, eliminarComentario } = useComentarios(post.id)
  const [currentIdx, setCurrentIdx] = useState(startIndex)
  const [showReacciones, setShowReacciones] = useState(false)
  const [comentarioTexto, setComentarioTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [respondiendo, setRespondiendo] = useState<string | null>(null)
  const [textoRespuesta, setTextoRespuesta] = useState('')

  const imagenes = media.filter(m => m.tipo === 'imagen')
  const actual = media[currentIdx]
  const isAdmin = ['superadmin', 'admin'].includes(user?.role || '')
  const autor = post.autor

  const handlePrev = useCallback(() => {
    setCurrentIdx(prev => {
      const prevImgIdx = media.slice(0, prev).filter(m => m.tipo === 'imagen').length
      return prev > 0 ? prev - 1 : prev
    })
  }, [media])

  const handleNext = useCallback(() => {
    setCurrentIdx(prev => {
      return prev < media.length - 1 ? prev + 1 : prev
    })
  }, [media])

  const handleReaccionar = (tipo: ReaccionTipo) => {
    onReaccionar?.(post.id, tipo)
    setShowReacciones(false)
  }

  const handleEnviarComentario = async () => {
    if (!comentarioTexto.trim() || enviando) return
    setEnviando(true)
    try { await crearComentario(comentarioTexto); setComentarioTexto('') }
    finally { setEnviando(false) }
  }

  const handleResponder = async (padreId: string) => {
    if (!textoRespuesta.trim() || enviando) return
    setEnviando(true)
    try { await crearComentario(textoRespuesta, padreId); setTextoRespuesta(''); setRespondiendo(null) }
    finally { setEnviando(false) }
  }

  if (!actual) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-2 md:p-4"
      onClick={onClose}
    >
      {/* Popup container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-zinc-950 border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col lg:flex-row w-full max-w-4xl max-h-[95vh] shadow-2xl shadow-black/50 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button onClick={onClose} className="absolute top-3 right-3 z-30 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white/60 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>

        {/* === LEFT: Image Carousel === */}
        <div className="flex-1 flex items-center justify-center relative bg-black/30 min-h-[250px]">
        {/* Prev */}
        {currentIdx > 0 && (
          <button onClick={handlePrev} className="absolute left-2 md:left-4 z-20 p-2 bg-black/50 rounded-full text-white/60 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        )}
        {/* Next */}
        {currentIdx < media.length - 1 && (
          <button onClick={handleNext} className="absolute right-2 md:right-4 z-20 p-2 bg-black/50 rounded-full text-white/60 hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        )}

        {/* Image */}
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full h-full flex items-center justify-center p-4 md:p-8"
        >
          {actual.tipo === 'imagen' ? (
            <Image
              src={actual.url_original}
              alt=""
              width={1600}
              height={1200}
              className="max-w-full max-h-[85vh] object-contain rounded-lg select-none"
              unoptimized
            />
          ) : actual.tipo === 'video' ? (
            <div className="w-full max-w-3xl aspect-video bg-black/40 rounded-xl overflow-hidden flex items-center justify-center">
              <Play className="w-16 h-16 text-white/40" />
            </div>
          ) : null}
        </motion.div>

        {/* Dots indicator */}
        {imagenes.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {media.map((m, i) => {
              if (m.tipo !== 'imagen') return null
              return (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setCurrentIdx(i) }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentIdx ? 'bg-blis-red' : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              )
            })}
          </div>
        )}
      </div>

        {/* === RIGHT: Comments sidebar === */}
        <div
          className="lg:w-[380px] xl:w-[420px] bg-zinc-950 border-t lg:border-t-0 lg:border-l border-white/[0.06] flex flex-col max-h-[40vh] lg:max-h-full"
          onClick={e => e.stopPropagation()}
        >
        {/* Post header */}
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blis-red/30 to-purple-500/30 flex items-center justify-center overflow-hidden flex-shrink-0">
            {autor?.avatar_url ? (
              <Image src={autor.avatar_url} alt="" width={36} height={36} className="object-cover" />
            ) : (
              <span className="text-xs font-bold text-white/40">{autor?.nombre?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-semibold truncate">{autor?.nombre} {autor?.apellido}</p>
            <p className="text-[11px] text-gray-500">{new Date(post.created_at).toLocaleDateString('es-PE')}</p>
          </div>
        </div>

        {/* Post content */}
        {post.contenido && (
          <div className="px-4 py-3 border-b border-white/[0.04] flex-shrink-0">
            <p className="text-sm text-gray-300 whitespace-pre-wrap line-clamp-4">{post.contenido}</p>
          </div>
        )}

        {/* Reactions bar */}
        <div className="px-4 py-2 border-b border-white/[0.04] flex items-center gap-2 flex-shrink-0">
          <div className="relative">
            <button
              onMouseEnter={() => setShowReacciones(true)}
              onMouseLeave={() => setShowReacciones(false)}
              onClick={() => handleReaccionar('like')}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs ${post.mi_reaccion ? 'text-blis-red' : 'text-gray-400 hover:text-white'}`}
            >
              {post.mi_reaccion ? (
                <>{(() => { const r = REACCIONES.find(rr => rr.tipo === post.mi_reaccion); return r ? <r.Icon className="w-4 h-4" /> : <ThumbsUp className="w-4 h-4" /> })()}</>
              ) : (
                <ThumbsUp className="w-4 h-4" />
              )}
            </button>
            <AnimatePresence>
              {showReacciones && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  onMouseEnter={() => setShowReacciones(true)}
                  onMouseLeave={() => setShowReacciones(false)}
                  className="absolute bottom-full left-0 mb-2 flex gap-1 bg-zinc-800 border border-white/10 rounded-xl p-1.5 shadow-xl z-20"
                >
                  {REACCIONES.map(({ tipo, Icon: IconComp, label }) => (
                    <button key={tipo} onClick={() => handleReaccionar(tipo)} className="p-2 rounded-lg hover:bg-white/10 transition-colors" title={label}>
                      <IconComp className={`w-5 h-5 transition-transform hover:scale-125 ${post.mi_reaccion === tipo ? 'text-blis-red' : 'text-gray-400'}`} />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {post.reacciones && post.reacciones.length > 0 && (
            <span className="text-xs text-gray-500">
              {post.reacciones.reduce((s, r) => s + r.count, 0)}
            </span>
          )}
          <span className="text-xs text-gray-500 ml-auto">
            {post.comentarios_count || 0} comentarios
          </span>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {!loadingComments && comentarios.length === 0 && (
            <p className="text-center text-gray-600 text-xs py-8">Sin comentarios aún</p>
          )}
          {comentarios.map(c => (
            <div key={c.id}>
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {c.autor?.avatar_url ? (
                    <Image src={c.autor.avatar_url} alt="" width={28} height={28} className="object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-white/40">{c.autor?.nombre?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-white/[0.03] rounded-xl px-3 py-2">
                    <p className="text-[11px] font-semibold text-white">{c.autor?.nombre} {c.autor?.apellido}</p>
                    <p className="text-xs text-gray-300 mt-0.5">{c.contenido}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 ml-1">
                    <button onClick={() => setRespondiendo(respondiendo === c.id ? null : c.id)} className="text-[10px] text-gray-600 hover:text-gray-400">Responder</button>
                    <span className="text-[10px] text-gray-700">{new Date(c.created_at).toLocaleDateString('es-PE')}</span>
                    {(isAdmin || user?.id === c.usuario_id) && (
                      <button onClick={() => eliminarComentario(c.id)} className="text-[10px] text-gray-700 hover:text-red-400">Eliminar</button>
                    )}
                  </div>
                  {respondiendo === c.id && (
                    <div className="flex gap-2 mt-2 ml-1">
                      <input type="text" value={textoRespuesta} onChange={e => setTextoRespuesta(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleResponder(c.id)} placeholder="Respuesta..." className="flex-1 bg-white/[0.05] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder-gray-600 focus:outline-none" autoFocus />
                      <button onClick={() => handleResponder(c.id)} disabled={!textoRespuesta.trim() || enviando} className="px-2.5 py-1.5 bg-blis-red/20 rounded-lg text-[11px] text-blis-red disabled:opacity-40">
                        {enviando ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Enviar'}
                      </button>
                    </div>
                  )}
                  {/* Respuestas anidadas */}
                  {c.respuestas?.map(r => (
                    <div key={r.id} className="ml-8 mt-2 flex items-start gap-2">
                      <CornerDownRight className="w-3 h-3 text-gray-700 mt-1.5 flex-shrink-0" />
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {r.autor?.avatar_url ? (
                          <Image src={r.autor.avatar_url} alt="" width={24} height={24} className="object-cover" />
                        ) : (
                          <span className="text-[9px] font-bold text-white/40">{r.autor?.nombre?.charAt(0) || 'U'}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-white/[0.03] rounded-xl px-3 py-2">
                          <p className="text-[11px] font-semibold text-white">{r.autor?.nombre}</p>
                          <p className="text-xs text-gray-300 mt-0.5">{r.contenido}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {loadingComments && <Loader2 className="w-4 h-4 text-gray-500 animate-spin mx-auto" />}
        </div>

        {/* Comment input */}
        <div className="p-4 border-t border-white/[0.06] flex gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blis-red/30 to-purple-500/30 flex items-center justify-center overflow-hidden flex-shrink-0">
            {user?.profilePic ? (
              <Image src={user.profilePic} alt="" width={32} height={32} className="object-cover" />
            ) : (
              <span className="text-[10px] font-bold text-white/40">{user?.nombre?.charAt(0) || 'U'}</span>
            )}
          </div>
          <input
            type="text"
            value={comentarioTexto}
            onChange={e => setComentarioTexto(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEnviarComentario()}
            placeholder="Escribe un comentario..."
            className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-white/10"
          />
          <button onClick={handleEnviarComentario} disabled={!comentarioTexto.trim() || enviando} className="p-2 rounded-xl bg-blis-red/20 text-blis-red hover:bg-blis-red/30 transition-colors disabled:opacity-40">
            {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
      </motion.div>
    </motion.div>
  )
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
