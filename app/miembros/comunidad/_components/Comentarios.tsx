"use client"

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Trash2, Loader2, CornerDownRight } from 'lucide-react'
import { useComentarios } from '../_hooks/useComunidad'
import { useAuth } from '@/hooks/useAuth'

interface ComentariosProps {
  postId: string
}

export function Comentarios({ postId }: ComentariosProps) {
  const { user } = useAuth()
  const { comentarios, loading, fetchComentarios, crearComentario, eliminarComentario } = useComentarios(postId)
  const [texto, setTexto] = useState('')
  const [respondiendo, setRespondiendo] = useState<string | null>(null)
  const [textoRespuesta, setTextoRespuesta] = useState('')
  const [enviando, setEnviando] = useState(false)
  const isAdmin = ['superadmin', 'admin'].includes(user?.role || '')

  useEffect(() => { fetchComentarios() }, [fetchComentarios])

  const handleEnviar = useCallback(async () => {
    if (!texto.trim() || enviando) return
    setEnviando(true)
    try {
      await crearComentario(texto)
      setTexto('')
    } finally { setEnviando(false) }
  }, [texto, enviando, crearComentario])

  const handleResponder = useCallback(async (padreId: string) => {
    if (!textoRespuesta.trim() || enviando) return
    setEnviando(true)
    try {
      await crearComentario(textoRespuesta, padreId)
      setTextoRespuesta('')
      setRespondiendo(null)
    } finally { setEnviando(false) }
  }, [textoRespuesta, enviando, crearComentario])

  return (
    <div className="p-4 md:p-5 space-y-4">
      {loading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-gray-500 animate-spin" /></div>
      ) : (
        <>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {comentarios.map(comentario => (
              <ComentarioItem
                key={comentario.id}
                comentario={comentario}
                userId={user?.id}
                isAdmin={isAdmin}
                respondiendo={respondiendo}
                textoRespuesta={textoRespuesta}
                setTextoRespuesta={setTextoRespuesta}
                setRespondiendo={setRespondiendo}
                onResponder={handleResponder}
                onEliminar={eliminarComentario}
                enviando={enviando}
              />
            ))}
            {comentarios.length === 0 && (
              <p className="text-center text-gray-600 text-sm py-4">Sé el primero en comentar</p>
            )}
          </div>

          <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
            <input
              type="text"
              value={texto}
              onChange={e => setTexto(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEnviar()}
              placeholder="Escribe un comentario..."
              className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/10 transition-colors"
            />
            <button
              onClick={handleEnviar}
              disabled={!texto.trim() || enviando}
              className="px-4 py-2.5 bg-blis-red/20 hover:bg-blis-red/30 rounded-xl transition-colors disabled:opacity-40 text-blis-red"
            >
              {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function ComentarioItem({
  comentario, userId, isAdmin, respondiendo, textoRespuesta,
  setTextoRespuesta, setRespondiendo, onResponder, onEliminar, enviando
}: {
  comentario: any
  userId?: string | null
  isAdmin: boolean
  respondiendo: string | null
  textoRespuesta: string
  setTextoRespuesta: (v: string) => void
  setRespondiendo: (v: string | null) => void
  onResponder: (padreId: string) => Promise<void>
  onEliminar: (id: string) => Promise<void>
  enviando: boolean
}) {
  const autor = comentario.autor
  const nombre = autor ? `${autor.nombre || ''} ${autor.apellido || ''}`.trim() || 'Usuario' : 'Usuario'

  return (
    <div>
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blis-red/30 to-purple-500/30 flex items-center justify-center flex-shrink-0">
          {autor?.avatar_url ? (
            <Image src={autor.avatar_url} alt="" width={28} height={28} className="rounded-full object-cover" />
          ) : (
            <span className="text-[10px] text-white/70 font-bold">{nombre.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white">{nombre}</span>
            <span className="text-[10px] text-gray-600">{new Date(comentario.created_at).toLocaleDateString('es-PE')}</span>
          </div>
          <p className="text-sm text-gray-300 mt-0.5">{comentario.contenido}</p>
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={() => setRespondiendo(respondiendo === comentario.id ? null : comentario.id)}
              className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
            >
              Responder
            </button>
            {(isAdmin || userId === comentario.usuario_id) && (
              <button
                onClick={() => onEliminar(comentario.id)}
                className="text-[11px] text-gray-600 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Eliminar
              </button>
            )}
          </div>

          {respondiendo === comentario.id && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={textoRespuesta}
                onChange={e => setTextoRespuesta(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onResponder(comentario.id)}
                placeholder="Escribe una respuesta..."
                className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-white/10"
                autoFocus
              />
              <button
                onClick={() => onResponder(comentario.id)}
                disabled={!textoRespuesta.trim() || enviando}
                className="px-3 py-1.5 bg-blis-red/20 rounded-lg text-xs text-blis-red disabled:opacity-40"
              >
                {enviando ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Enviar'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Respuestas */}
      {comentario.respuestas?.map((resp: any) => (
        <div key={resp.id} className="ml-9 mt-2 flex items-start gap-2.5">
          <CornerDownRight className="w-3 h-3 text-gray-700 mt-2 flex-shrink-0" />
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0">
            {resp.autor?.avatar_url ? (
              <Image src={resp.autor.avatar_url} alt="" width={24} height={24} className="rounded-full object-cover" />
            ) : (
              <span className="text-[9px] text-white/70 font-bold">{resp.autor ? (resp.autor.nombre || 'U').charAt(0) : 'U'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">
                {resp.autor ? `${resp.autor.nombre || ''} ${resp.autor.apellido || ''}`.trim() || 'Usuario' : 'Usuario'}
              </span>
              <span className="text-[10px] text-gray-600">{new Date(resp.created_at).toLocaleDateString('es-PE')}</span>
            </div>
            <p className="text-sm text-gray-300 mt-0.5">{resp.contenido}</p>
            {(isAdmin || userId === resp.usuario_id) && (
              <button
                onClick={() => onEliminar(resp.id)}
                className="text-[11px] text-gray-600 hover:text-red-400 transition-colors mt-1"
              >
                Eliminar
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
