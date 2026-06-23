"use client"

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusCircle, RefreshCw, Loader2, Megaphone, Users, Calendar, BarChart3 } from 'lucide-react'
import { useComunidad } from './_hooks/useComunidad'
import { PostCard, PostCreator } from './_components'
import { useAuth } from '@/hooks/useAuth'

export default function ComunidadPage() {
  const { user } = useAuth()
  const { posts, loading, loadingMore, error, hasMore, fetchPosts, crearPost, eliminarPost, reaccionar, votar, inscribirEvento, cancelarInscripcion } = useComunidad()
  const [showCreator, setShowCreator] = useState(false)
  const [filtro, setFiltro] = useState<string | null>(null)
  const isAdmin = ['superadmin', 'admin', 'editor'].includes(user?.role || '')

  useEffect(() => { fetchPosts(true) }, [])

  const handleRefresh = useCallback(() => fetchPosts(true), [fetchPosts])
  const handleLoadMore = useCallback(() => fetchPosts(false), [fetchPosts])

  const filtered = filtro ? posts.filter(p => p.tipo === filtro) : posts

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Comunidad <span className="text-blis-red">BLIS</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Conecta, comparte y crece con la comunidad</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowCreator(true)}
              className="px-4 py-2.5 bg-blis-red hover:bg-blis-red/90 rounded-xl text-sm font-bold text-white transition-colors flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Publicar</span>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { tipo: null, Icon: Users, label: 'Todo' },
            { tipo: 'encuesta', Icon: BarChart3, label: 'Encuestas' },
            { tipo: 'evento', Icon: Calendar, label: 'Eventos' },
            { tipo: 'anuncio', Icon: Megaphone, label: 'Anuncios' },
          ].map(({ tipo, Icon: IconComp, label }) => (
            <button
              key={tipo || 'todo'}
              onClick={() => setFiltro(tipo)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors flex-shrink-0 ${
                filtro === tipo
                  ? 'bg-blis-red/10 text-blis-red border border-blis-red/20'
                  : 'bg-white/[0.03] text-gray-400 border border-white/[0.04] hover:border-white/10'
              }`}
            >
              <IconComp className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>

        {/* Feed */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-blis-red animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button onClick={handleRefresh} className="px-4 py-2 bg-white/5 text-white rounded-xl text-sm hover:bg-white/10 transition-colors">
              Reintentar
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl">🏘️</div>
            <p className="text-gray-500 text-sm">No hay publicaciones aún</p>
            <p className="text-gray-600 text-xs">Sé el primero en compartir algo con la comunidad</p>
            <button
              onClick={() => setShowCreator(true)}
              className="px-4 py-2 bg-blis-red/10 text-blis-red border border-blis-red/20 rounded-xl text-sm font-medium hover:bg-blis-red/20 transition-colors inline-flex items-center gap-2 mt-2"
            >
              <PlusCircle className="w-4 h-4" />
              Crear publicación
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filtered.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onReaccionar={reaccionar}
                    onEliminar={eliminarPost}
                    onVotar={votar}
                    onInscribirEvento={inscribirEvento}
                    onCancelarInscripcion={cancelarInscripcion}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Cargar más */}
            {hasMore && (
              <div className="flex justify-center py-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-gray-400 hover:text-white hover:border-white/10 transition-colors disabled:opacity-40 flex items-center gap-2"
                >
                  {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Cargar más publicaciones
                </button>
              </div>
            )}

            {!hasMore && filtered.length >= 20 && (
              <p className="text-center text-gray-600 text-xs py-4">Has llegado al final del feed</p>
            )}
          </>
        )}
      </div>

      {/* Creador de posts */}
      <PostCreator
        open={showCreator}
        onClose={() => setShowCreator(false)}
        onCreated={() => { fetchPosts(true) }}
      />
    </div>
  )
}
