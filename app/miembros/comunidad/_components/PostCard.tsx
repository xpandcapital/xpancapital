"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, PartyPopper, ThumbsUp, Lightbulb, Frown, MessageCircle, Trash2, ChevronDown, Send, Loader2 } from 'lucide-react'
import type { ComunidadPost, ReaccionTipo, ComunidadComentario } from '../_types'
import { EncuestaCard } from './EncuestaCard'
import { EventoCard } from './EventoCard'
import { MediaGrid } from './MediaGrid'
import { useAuth } from '@/hooks/useAuth'
import { useComentarios } from '../_hooks/useComunidad'

const REACCIONES = [
  { tipo: 'like', Icon: ThumbsUp, label: 'Me gusta', color: 'text-blue-400' },
  { tipo: 'celebrar', Icon: PartyPopper, label: 'Celebrar', color: 'text-yellow-400' },
  { tipo: 'apoyar', Icon: Heart, label: 'Apoyar', color: 'text-red-400' },
  { tipo: 'interesante', Icon: Lightbulb, label: 'Interesante', color: 'text-amber-400' },
  { tipo: 'triste', Icon: Frown, label: 'Triste', color: 'text-purple-400' },
] as const

interface PostCardProps {
  post: ComunidadPost
  onReaccionar: (postId: string, tipo: ReaccionTipo) => Promise<void> | void
  onEliminar: (id: string) => Promise<void> | void
  onVotar: (encuestaId: string, opcionId: string) => Promise<any> | void
  onInscribirEvento: (eventoId: string) => void
  onCancelarInscripcion: (eventoId: string) => void
}

export function PostCard({ post, onReaccionar, onEliminar, onVotar, onInscribirEvento, onCancelarInscripcion }: PostCardProps) {
  const { user } = useAuth()
  const [showReacciones, setShowReacciones] = useState(false)
  const isAdmin = ['superadmin', 'admin'].includes(user?.role || '')
  const isOwner = user?.id === post.autor_id

  const tipoBadge = () => {
    switch (post.tipo) {
      case 'anuncio': return { bg: 'bg-blis-red/10', text: 'text-blis-red', border: 'border-blis-red/30', label: '📢 Anuncio' }
      case 'producto': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', label: '🛍️ Nuevo Producto' }
      case 'blog': return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', label: '📝 Nuevo Artículo' }
      case 'evento': return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', label: '📅 Evento' }
      case 'encuesta': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', label: '📊 Encuesta' }
      default: return null
    }
  }

  const badge = tipoBadge()
  const autor = post.autor
  const autorNombre = autor ? `${autor.nombre || ''} ${autor.apellido || ''}`.trim() || 'Usuario' : 'Usuario'
  const fecha = new Date(post.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
  const hora = new Date(post.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/[0.02] border ${post.fijado ? 'border-blis-red/20' : 'border-white/[0.06]'} rounded-2xl overflow-hidden backdrop-blur-sm`}
    >
      {/* Header */}
      <div className="p-4 md:p-5 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blis-red/30 to-purple-500/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {autor?.avatar_url ? (
            <Image src={autor.avatar_url} alt="" width={40} height={40} className="object-cover" />
          ) : (
            <span className="text-white/80 font-bold text-sm">{autorNombre.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-sm">{autorNombre}</span>
            {badge && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.text} border ${badge.border}`}>
                {badge.label}
              </span>
            )}
            {post.fijado && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blis-red/10 text-blis-red border border-blis-red/30">
                📌 Fijado
              </span>
            )}
          </div>
          <p className="text-gray-500 text-xs mt-0.5">{fecha} · {hora}</p>
        </div>
        {(isAdmin || isOwner) && (
          <button
            onClick={() => onEliminar(post.id)}
            className="p-2 text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Contenido */}
      {post.contenido && (
        <div className="px-4 md:px-5 pb-3">
          <p className="text-gray-200 text-sm md:text-base leading-relaxed whitespace-pre-wrap">{post.contenido}</p>
        </div>
      )}

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="px-4 md:px-5 pb-3">
          <MediaGrid media={post.media} />
        </div>
      )}

      {/* Encuesta */}
      {post.encuesta && (
        <div className="px-4 md:px-5 pb-4">
          <EncuestaCard encuesta={post.encuesta} onVotar={(opcionId) => onVotar(post.encuesta!.id, opcionId)} />
        </div>
      )}

      {/* Evento */}
      {post.evento && (
        <div className="px-4 md:px-5 pb-4">
          <EventoCard
            evento={post.evento}
            onInscribir={() => onInscribirEvento(post.evento!.id)}
            onCancelar={() => onCancelarInscripcion(post.evento!.id)}
          />
        </div>
      )}

      {/* Referencia producto/blog */}
      {post.producto_ref && (
        <div className="mx-4 md:mx-5 mb-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
          {post.producto_ref.imagen_principal && (
            <Image src={post.producto_ref.imagen_principal} alt="" width={48} height={48} className="rounded-lg object-cover w-12 h-12" />
          )}
          <div>
            <p className="text-xs text-gray-500">Producto relacionado</p>
            <p className="text-sm text-white font-semibold">{post.producto_ref.nombre}</p>
            {post.producto_ref.precio_usd && <p className="text-xs text-emerald-400">${post.producto_ref.precio_usd} USD</p>}
          </div>
        </div>
      )}
      {post.blog_ref && (
        <div className="mx-4 md:mx-5 mb-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center gap-3">
          {post.blog_ref.imagen_portada && (
            <Image src={post.blog_ref.imagen_portada} alt="" width={48} height={48} className="rounded-lg object-cover w-12 h-12" />
          )}
          <div>
            <p className="text-xs text-gray-500">Artículo relacionado</p>
            <p className="text-sm text-white font-semibold">{post.blog_ref.titulo}</p>
          </div>
        </div>
      )}

      {/* Reacciones resumen */}
      {post.reacciones && post.reacciones.length > 0 && (
        <div className="px-4 md:px-5 pb-2 flex items-center gap-1 flex-wrap">
          {post.reacciones.map(r => {
            const reac = REACCIONES.find(rr => rr.tipo === r.tipo)
            if (!reac) return null
            return (
              <span key={r.tipo} className={`text-xs ${reac.color} bg-white/5 px-2 py-0.5 rounded-full flex items-center gap-1`}>
                <reac.Icon className="w-3 h-3" />
                {r.count}
              </span>
            )
          })}
        </div>
      )}

      {/* Acciones */}
      <div className="px-4 md:px-5 py-2 border-t border-white/[0.04] flex items-center gap-1">
        <div className="relative">
          <button
            onMouseEnter={() => setShowReacciones(true)}
            onMouseLeave={() => setShowReacciones(false)}
            onClick={() => { onReaccionar(post.id, 'like'); setShowReacciones(false) }}
            className={`px-3 py-2 rounded-lg transition-all text-xs font-medium flex items-center gap-1.5 ${post.mi_reaccion ? 'text-blis-red bg-blis-red/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            {post.mi_reaccion ? (
              <>
                {(() => { const r = REACCIONES.find(rr => rr.tipo === post.mi_reaccion); return r ? <r.Icon className="w-4 h-4" /> : <ThumbsUp className="w-4 h-4" /> })()}
                <span className="hidden sm:inline">{REACCIONES.find(rr => rr.tipo === post.mi_reaccion)?.label || 'Me gusta'}</span>
              </>
            ) : (
              <>
                <ThumbsUp className="w-4 h-4" />
                <span className="hidden sm:inline">Me gusta</span>
              </>
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
                className="absolute bottom-full left-0 mb-2 flex gap-1 bg-zinc-900 border border-white/10 rounded-xl p-1.5 shadow-xl shadow-black/50 z-20"
              >
                {REACCIONES.map(({ tipo, Icon: IconComp, label }) => (
                  <button
                    key={tipo}
                    onClick={() => { onReaccionar(post.id, tipo); setShowReacciones(false) }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors group relative"
                    title={label}
                  >
                    <IconComp className={`w-5 h-5 transition-transform group-hover:scale-125 ${post.mi_reaccion === tipo ? 'text-blis-red' : 'text-gray-400 group-hover:text-white'}`} />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <span
          className="px-3 py-2 rounded-lg text-xs font-medium text-gray-400 flex items-center gap-1.5"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Comentarios</span>
          {post.comentarios_count ? (
            <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded-full">{post.comentarios_count}</span>
          ) : null}
        </span>
      </div>

      {/* Comentarios preview */}
      <ComentariosPreview postId={post.id} total={post.comentarios_count || 0} />
    </motion.div>
  )
}

function ComentariosPreview({ postId, total }: { postId: string; total: number }) {
  const { user } = useAuth()
  const { comentarios, loading, fetchComentarios, crearComentario, eliminarComentario } = useComentarios(postId)
  const [expanded, setExpanded] = useState(false)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isAdmin = ['superadmin', 'admin'].includes(user?.role || '')

  useEffect(() => { fetchComentarios() }, [fetchComentarios])

  const handleEnviar = async () => {
    if (!texto.trim() || enviando) return
    setEnviando(true)
    setError(null)
    try {
      await crearComentario(texto)
      setTexto('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo publicar el comentario')
    } finally {
      setEnviando(false)
    }
  }

  const preview = expanded ? comentarios : comentarios.slice(0, 3)
  const remaining = Math.max(0, total - 3)

  return (
    <div className="border-t border-white/[0.04]">
      {loading ? (
        <div className="p-4 text-center text-gray-600 text-xs">Cargando...</div>
      ) : (
        <>
          {preview.map(c => (
            <div key={c.id} className="px-4 py-2.5 flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {c.autor?.avatar_url ? (
                  <Image src={c.autor.avatar_url} alt="" width={28} height={28} className="object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-white/40">{c.autor?.nombre?.charAt(0) || 'U'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-white/[0.03] rounded-xl px-3 py-2">
                      <p className="text-[11px] font-semibold text-white">{c.autor ? `${c.autor.nombre || ''} ${c.autor.apellido || ''}`.trim() || 'Usuario' : 'Usuario'}</p>
                  <p className="text-xs text-gray-300 mt-0.5">{c.contenido}</p>
                </div>
                <div className="flex items-center gap-2 mt-1 ml-1">
                  <span className="text-[10px] text-gray-700">{new Date(c.created_at).toLocaleDateString('es-PE')}</span>
                  {(isAdmin || user?.id === c.usuario_id) && (
                    <button onClick={() => eliminarComentario(c.id)} className="text-[10px] text-gray-700 hover:text-red-400">Eliminar</button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {!expanded && remaining > 0 && (
            <button
              onClick={() => setExpanded(true)}
              className="w-full py-2 text-[11px] text-gray-500 hover:text-gray-300 hover:bg-white/[0.02] transition-colors"
            >
              Ver {remaining} comentario{remaining > 1 ? 's' : ''} más
            </button>
          )}

          {expanded && remaining > 0 && (
            <button
              onClick={() => setExpanded(false)}
              className="w-full py-2 text-[11px] text-gray-600 hover:text-gray-400 transition-colors"
            >
              Mostrar menos
            </button>
          )}
        </>
      )}

      {/* Input rápido */}
      <div className="px-4 py-2.5 flex gap-2 border-t border-white/[0.04]">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blis-red/30 to-purple-500/30 flex items-center justify-center overflow-hidden flex-shrink-0">
          {user?.profilePic ? (
            <Image src={user.profilePic} alt="" width={28} height={28} className="object-cover" />
          ) : (
            <span className="text-[10px] font-bold text-white/40">{user?.nombre?.charAt(0) || 'U'}</span>
          )}
        </div>
        <input
          type="text"
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleEnviar()}
          placeholder="Escribe un comentario..."
          className="flex-1 bg-transparent text-xs text-white placeholder-gray-600 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleEnviar}
          disabled={!texto.trim() || enviando}
          className="px-3 py-2 rounded-lg bg-blis-red/20 text-blis-red hover:bg-blis-red/30 disabled:opacity-40 flex-shrink-0"
          aria-label="Enviar comentario"
        >
          {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p className="px-4 pb-2 text-[11px] text-red-400">{error}</p>
      )}
    </div>
  )
}
