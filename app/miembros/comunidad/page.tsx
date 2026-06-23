"use client"

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, RefreshCw } from 'lucide-react'
import { useComunidad } from './_hooks/useComunidad'
import { useAuth } from '@/hooks/useAuth'
import {
  PostCard, PostCreator, PerfilHeader, ComunidadTabs,
  MiembrosSeguidos, ConexionesLista, CompletarPerfil, UltimasActualizaciones
} from './_components'
import type { ComunidadPost, ComunidadComentario } from './_types'

type TabId = 'timeline' | 'conexiones' | 'grupos' | 'cursos' | 'documentos' | 'fotos'

export default function ComunidadPage() {
  const { user } = useAuth()
  const { posts, loading, loadingMore, error, hasMore, fetchPosts, eliminarPost, reaccionar, votar, inscribirEvento, cancelarInscripcion } = useComunidad()
  const [activeTab, setActiveTab] = useState<TabId>('timeline')
  const [miembros, setMiembros] = useState<any[]>([])
  const [actualizaciones, setActualizaciones] = useState<any[]>([])
  const isAdmin = ['superadmin', 'admin'].includes(user?.role || '')

  useEffect(() => { fetchPosts(true) }, [])

  // Cargar miembros de la empresa
  useEffect(() => {
    if (!user?.empresa_id) return
    fetch(`/api/admin/users?empresa_id=${user.empresa_id}&limit=12`)
      .then(r => r.json())
      .then(d => { if (d.success) setMiembros(d.data || []) })
      .catch(() => {})
  }, [user?.empresa_id])

  // Generar actualizaciones desde los posts
  useEffect(() => {
    if (!posts.length) return
    const acts = posts.slice(0, 5).map((p: ComunidadPost) => ({
      id: p.id,
      usuario: p.autor || { id: p.autor_id, nombre: 'Usuario' },
      accion: p.tipo === 'evento' ? 'creó un evento' : p.tipo === 'encuesta' ? 'publicó una encuesta' : 'publicó una actualización',
      hace: haceCuanto(p.created_at),
      tipo: p.tipo === 'encuesta' ? 'post' : p.tipo as any
    }))
    setActualizaciones(acts)
  }, [posts])

  const tabCounts = {
    timeline: undefined,
    conexiones: miembros.length || undefined,
    grupos: undefined,
    cursos: undefined,
    documentos: undefined,
    fotos: posts.filter(p => p.media && p.media.length > 0).length || undefined
  }

  return (
    <div className="min-h-screen">
      {/* Perfil Header */}
      <PerfilHeader stats={{ seguidores: miembros.length, siguiendo: Math.min(miembros.length, 13) }} />

      {/* Tabs */}
      <ComunidadTabs active={activeTab} onChange={setActiveTab} counts={tabCounts} />

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6">
        {activeTab === 'timeline' ? (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] xl:grid-cols-[300px_1fr_300px] gap-4 md:gap-6">
            {/* === COLUMNA IZQUIERDA === */}
            <div className="hidden lg:flex flex-col gap-4">
              {/* Miembros */}
              <MiembrosSeguidos miembros={miembros} total={miembros.length} />

              {/* Conexiones */}
              <ConexionesLista
                conexiones={miembros.map((m: any) => ({
                  id: m.id,
                  nombre: m.nombre || m.email?.split('@')[0] || '',
                  apellido: m.apellido,
                  avatar_url: m.avatar_url,
                  rol: m.rol
                }))}
                total={miembros.length}
              />
            </div>

            {/* === COLUMNA CENTRAL === */}
            <div className="space-y-4">
              {/* Post Creator inline */}
              <PostCreator onCreated={() => fetchPosts(true)} />

              {/* Feed */}
              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-6 h-6 text-blis-red animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/[0.06]">
                  <p className="text-red-400 text-sm mb-3">{error}</p>
                  <button onClick={() => fetchPosts(true)} className="px-4 py-2 bg-white/5 text-white rounded-xl text-xs hover:bg-white/10">
                    Reintentar
                  </button>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/[0.06] space-y-3">
                  <div className="text-4xl">🏘️</div>
                  <p className="text-gray-500 text-sm">No hay publicaciones aún</p>
                  <p className="text-gray-600 text-xs">Sé el primero en compartir algo</p>
                </div>
              ) : (
                <>
                  <AnimatePresence mode="popLayout">
                    {posts.map((post, i) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.03, 0.3) }}
                      >
                        <PostCard
                          post={post}
                          onReaccionar={reaccionar}
                          onEliminar={eliminarPost}
                          onVotar={votar}
                          onInscribirEvento={inscribirEvento}
                          onCancelarInscripcion={cancelarInscripcion}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {hasMore && (
                    <div className="flex justify-center py-4">
                      <button
                        onClick={() => fetchPosts(false)}
                        disabled={loadingMore}
                        className="px-5 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs text-gray-400 hover:text-white hover:border-white/10 transition-colors disabled:opacity-40 flex items-center gap-2"
                      >
                        {loadingMore ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        Cargar más
                      </button>
                    </div>
                  )}

                  {!hasMore && posts.length >= 20 && (
                    <p className="text-center text-gray-600 text-[11px] py-4">— Fin del feed —</p>
                  )}
                </>
              )}
            </div>

            {/* === COLUMNA DERECHA === */}
            <div className="hidden lg:flex flex-col gap-4">
              {/* Completar perfil */}
              <CompletarPerfil />

              {/* Últimas actualizaciones */}
              <UltimasActualizaciones actualizaciones={actualizaciones} />
            </div>
          </div>
        ) : (
          /* Otras pestañas placeholder */
          <div className="text-center py-20">
            <p className="text-gray-500 text-sm">Sección en desarrollo</p>
          </div>
        )}
      </div>
    </div>
  )
}

function haceCuanto(fecha: string): string {
  const ahora = new Date()
  const f = new Date(fecha)
  const mins = Math.floor((ahora.getTime() - f.getTime()) / 60000)
  if (mins < 1) return 'Ahora'
  if (mins < 60) return `Hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs}h`
  const dias = Math.floor(hrs / 24)
  if (dias < 7) return `Hace ${dias}d`
  return f.toLocaleDateString('es-PE')
}
