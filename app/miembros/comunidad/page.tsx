"use client"

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Loader2, Trophy } from 'lucide-react'
import { useComunidad } from './_hooks/useComunidad'
import { useAuth } from '@/hooks/useAuth'
import { useRanking } from '@/lib/hooks/useGamificacion'
import {
  PostCard, PostCreator, PerfilHeader,
  MiembrosSeguidos, CompletarPerfil, UltimasActualizaciones
} from './_components'
import type { ComunidadPost } from './_types'

export default function ComunidadPage() {
  const { user } = useAuth()
  const { posts, loading, loadingMore, error, hasMore, fetchPosts, eliminarPost, reaccionar, votar, inscribirEvento, cancelarInscripcion } = useComunidad()
  const [miembros, setMiembros] = useState<any[]>([])
  const [totalMiembros, setTotalMiembros] = useState(0)
  const [totalEventos, setTotalEventos] = useState(0)
  const [actualizaciones, setActualizaciones] = useState<any[]>([])
  const { top10, loading: rankingLoading } = useRanking(user?.empresa_id, user?.id)

  useEffect(() => { fetchPosts(true) }, [])

  // Infinite scroll: auto-cargar más al hacer scroll al final
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingMoreRef = useRef(loadingMore)
  useEffect(() => { loadingMoreRef.current = loadingMore }, [loadingMore])

  useEffect(() => {
    if (!hasMore) return
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingMoreRef.current) {
          fetchPosts(false)
        }
      },
      { rootMargin: '300px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, fetchPosts])

  // Cargar miembros de la empresa
  useEffect(() => {
    if (!user?.empresa_id) return
    fetch(`/api/admin/users?empresa_id=${user.empresa_id}&limit=12`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setMiembros(d.data || [])
          setTotalMiembros(d.total || d.data?.length || 0)
        }
      })
      .catch(() => {})
  }, [user?.empresa_id])

  // Contador real de eventos
  useEffect(() => {
    import("@/lib/supabase").then(({ getSupabase }) => {
      const supabase = getSupabase()
      if (!supabase) return
      supabase.from("comunidad_eventos").select("id", { count: "exact", head: true }).then(({ count }) => {
        setTotalEventos(count || 0)
      })
    })
  }, [])

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

  // Deep-link a una publicación específica (?post=ID)
  useEffect(() => {
    if (loading) return
    const postId = new URLSearchParams(window.location.search).get('post')
    if (!postId) return
    const el = document.getElementById(`post-${postId}`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('ring-2', 'ring-blis-red/60')
    const t = setTimeout(() => el.classList.remove('ring-2', 'ring-blis-red/60'), 3000)
    return () => clearTimeout(t)
  }, [loading, posts])

  return (
    <div className="min-h-screen">
      {/* Perfil Header */}
      <PerfilHeader stats={{ seguidores: totalMiembros, eventos: totalEventos }} />

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] xl:grid-cols-[300px_1fr_300px] gap-4 md:gap-6">
            {/* === COLUMNA IZQUIERDA === */}
            <div className="hidden lg:flex flex-col gap-4">
              {/* Miembros */}
              <MiembrosSeguidos miembros={miembros} />

              {/* Ranking */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                    Ranking
                  </h3>
                  <span className="text-[10px] text-gray-500 bg-white/[0.03] px-2 py-0.5 rounded-full">{top10.length}</span>
                </div>
                {rankingLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <p className="text-xs text-zinc-500 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-600" />
                      Cargando ranking...
                    </p>
                  </div>
                ) : top10.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-xs text-zinc-500">Sin ranking aún</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.03]">
                    {top10.slice(0, 10).map((entry) => (
                      <div key={entry.user_id} className="px-4 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                        <span className={`text-xs font-bold w-5 ${entry.posicion <= 3 ? 'text-yellow-400' : 'text-gray-500'}`}>
                          {entry.posicion}
                        </span>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-700 ring-1 ring-white/[0.04] overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {entry.avatar_url ? (
                            <Image src={entry.avatar_url} alt="" width={36} height={36} className="object-cover w-full h-full" />
                          ) : (
                            <span className="text-xs font-bold text-white/40">{entry.nombre?.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">{entry.nombre} {entry.apellido || ''}</p>
                          <p className="text-[10px] text-gray-600">Nv.{entry.nivel} · {entry.puntos.toLocaleString()} pts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* === COLUMNA CENTRAL === */}
            <div className="space-y-4">
              {/* Post Creator inline */}
              <PostCreator onCreated={() => fetchPosts(true)} />

              {/* Feed */}
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 animate-pulse space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/[0.04]" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3 bg-white/[0.04] rounded w-28" />
                          <div className="h-2 bg-white/[0.03] rounded w-16" />
                        </div>
                      </div>
                      <div className="space-y-2 pt-2">
                        <div className="h-3 bg-white/[0.04] rounded w-full" />
                        <div className="h-3 bg-white/[0.04] rounded w-3/4" />
                      </div>
                      <div className="h-48 bg-white/[0.03] rounded-xl" />
                      <div className="flex gap-4 pt-1">
                        <div className="h-8 bg-white/[0.03] rounded-lg w-20" />
                        <div className="h-8 bg-white/[0.03] rounded-lg w-24" />
                      </div>
                    </div>
                  ))}
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
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <motion.div
                        key={post.id}
                        id={`post-${post.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.25 }}
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
                  </div>

                  {hasMore && (
                    <div ref={sentinelRef} className="flex justify-center py-6">
                      {loadingMore ? (
                        <span className="flex items-center gap-2 text-xs text-gray-500">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Cargando más...
                        </span>
                      ) : null}
                    </div>
                  )}

                  {!hasMore && posts.length >= 12 && (
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
