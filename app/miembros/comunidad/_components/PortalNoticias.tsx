"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Newspaper, ExternalLink, Loader2, Clock,
  MapPin, AlertCircle, Shield, RefreshCw, ChevronLeft
} from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  url: string
  image: string
  date: string
  category: string
}

interface MentorEvent {
  id: string
  autor: { nombre: string; apellido?: string; avatar_url?: string }
  contenido?: string
  media?: { id: string; tipo: string; url_original: string; url_comprimida?: string; url_thumbnail?: string; mime_type?: string }[]
  evento?: {
    titulo: string
    descripcion?: string
    imagen_url?: string
    fecha_inicio: string
    hora_inicio?: string
    tipo: string
    ubicacion?: string
  }
  created_at: string
}

export function PortalNoticias() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [mentorEvents, setMentorEvents] = useState<MentorEvent[]>([])
  const [loadingNews, setLoadingNews] = useState(true)
  const [loadingMentor, setLoadingMentor] = useState(true)
  const [newsErrors, setNewsErrors] = useState<string[]>([])
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null)
  const [articleContent, setArticleContent] = useState<{ loading: boolean; text: string; error: string }>({
    loading: false, text: '', error: ''
  })

  useEffect(() => {
    fetchNews()
    fetchMentorEvents()
  }, [])

  const fetchNews = async (force = false) => {
    setLoadingNews(true)
    try {
      const cacheBust = force ? '&force=true' : ''
      const t = Date.now()
      const newsRes = await fetch(`/api/portal/noticias?type=news&cacheBust=${t}${cacheBust}`)
      const newsData = await newsRes.json()
      if (newsData.success) {
        setNews(newsData.data?.news || [])
        if (newsData.errors?.length) setNewsErrors(newsData.errors)
        else if (newsData.debug) setNewsErrors([JSON.stringify(newsData.debug)])
        else setNewsErrors([])
      }
    } catch { /* silencioso */ }
    finally { setLoadingNews(false) }
  }

  const fetchMentorEvents = async () => {
    setLoadingMentor(true)
    try {
      const res = await fetch(`/api/comunidad?es_evento_mentor=true&limit=15`)
      const data = await res.json()
      if (data.success) setMentorEvents(data.data || [])
    } catch { /* silencioso */ }
    finally { setLoadingMentor(false) }
  }

  const openArticle = (article: NewsItem) => {
    setSelectedArticle(article)
    setArticleContent({ loading: true, text: '', error: '' })
    fetch(`/api/portal/leer?url=${encodeURIComponent(article.url)}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setArticleContent({ loading: false, text: data.content, error: '' })
        } else {
          setArticleContent({ loading: false, text: article.summary, error: data.error })
        }
      })
      .catch(() => {
        setArticleContent({ loading: false, text: article.summary, error: '' })
      })
  }

  const closeArticle = () => {
    setSelectedArticle(null)
    setArticleContent({ loading: false, text: '', error: '' })
  }

  const timeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
    if (mins < 1) return 'Ahora'
    if (mins < 60) return `Hace ${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `Hace ${hrs}h`
    const dias = Math.floor(hrs / 24)
    if (dias < 7) return `Hace ${dias}d`
    return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500/5 via-blis-red/5 to-blue-500/5 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">Portal de Noticias y Agenda</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Eventos del mentor · Noticias globales</p>
            </div>
          </div>
          <button
            onClick={() => fetchNews(true)}
            disabled={loadingNews}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] text-gray-400 font-bold uppercase tracking-wider hover:text-white hover:border-white/20 transition-colors disabled:opacity-50"
          >
            {loadingNews ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Actualizar
          </button>
        </div>
      </div>

      {/* 50/50 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Mentor Events */}
        <div className="space-y-4 order-2 lg:order-1">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-black text-amber-400 uppercase tracking-wider">Mentor</h2>
          </div>

          {loadingMentor ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
            </div>
          ) : mentorEvents.length === 0 ? (
            <div className="bg-zinc-950 border border-white/5 rounded-2xl p-8 text-center">
              <Calendar className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No hay publicaciones del mentor aún</p>
              <p className="text-gray-600 text-xs mt-1">Activa el checkbox al publicar para destacar aquí</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mentorEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/20 transition-colors"
                >
                  {event.evento ? (
                    <>
                      {(event.evento.imagen_url || event.media?.filter(m => m.tipo === 'imagen').length) ? (
                        <div className="relative aspect-[2/1] overflow-hidden bg-zinc-900">
                          {event.media?.filter(m => m.tipo === 'imagen').length ? (
                            <div className={`grid gap-0.5 h-full ${event.media.filter(m => m.tipo === 'imagen').length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                              {event.media.filter(m => m.tipo === 'imagen').slice(0, 2).map(m => (
                                <img key={m.id} src={m.url_comprimida || m.url_original} alt="" className="w-full h-full object-contain bg-zinc-900" loading="lazy" />
                              ))}
                            </div>
                          ) : event.evento.imagen_url ? (
                            <img src={event.evento.imagen_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                          ) : null}
                        </div>
                      ) : null}
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4 text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold text-sm leading-snug">{event.evento.titulo}</h3>
                            {event.evento.descripcion && (
                              <p className="text-gray-400 text-xs mt-1 line-clamp-2">{event.evento.descripcion}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                                <Clock className="w-3 h-3" />
                                {new Date(event.evento.fecha_inicio).toLocaleDateString('es-ES', {
                                  day: 'numeric', month: 'short', year: 'numeric'
                                })}
                                {event.evento.hora_inicio && ` · ${event.evento.hora_inicio}`}
                              </span>
                              {event.evento.tipo && (
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-gray-400 uppercase">
                                  {event.evento.tipo === 'digital' ? 'Digital' : event.evento.tipo === 'presencial' ? 'Presencial' : 'Híbrido'}
                                </span>
                              )}
                              {event.evento.ubicacion && (
                                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                  <MapPin className="w-3 h-3" />{event.evento.ubicacion}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
                          <span className="text-[10px] text-gray-500">{event.autor?.nombre || 'Mentor'}</span>
                          <span className="text-[10px] text-gray-600">{timeAgo(event.created_at)}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {event.media?.filter(m => m.tipo === 'imagen').length ? (
                        <div className="relative aspect-[2/1] overflow-hidden bg-zinc-900">
                          <div className={`grid gap-0.5 h-full ${event.media.filter(m => m.tipo === 'imagen').length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {event.media.filter(m => m.tipo === 'imagen').slice(0, 2).map(m => (
                              <img key={m.id} src={m.url_comprimida || m.url_original} alt="" className="w-full h-full object-contain bg-zinc-900" loading="lazy" />
                            ))}
                          </div>
                        </div>
                      ) : null}
                      <div className="p-4">
                        <p className="text-gray-300 text-sm leading-relaxed">{event.contenido || 'Anuncio del mentor'}</p>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                          <span className="text-[10px] text-gray-500">{event.autor?.nombre}</span>
                          <span className="text-[10px] text-gray-600">{timeAgo(event.created_at)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: News Feed (Magazine Style) */}
        <div className="order-1 lg:order-2">
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-black text-blue-400 uppercase tracking-wider">Noticias Globales</h2>
            <span className="text-[9px] text-gray-600">· Inglés</span>
          </div>

          {loadingNews ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          ) : news.length === 0 && newsErrors.length > 0 ? (
            <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="text-amber-400 text-xs font-bold">Error al cargar datos</p>
              {newsErrors.map((e, i) => (
                <p key={i} className="text-gray-500 text-[10px] break-all">{e}</p>
              ))}
              <button onClick={() => fetchNews(true)} className="mt-2 px-3 py-1.5 bg-white/5 rounded-lg text-[10px] text-gray-400 hover:text-white transition-colors">
                Reintentar
              </button>
            </div>
          ) : news.length === 0 ? (
            <div className="bg-zinc-950 border border-white/5 rounded-2xl p-8 text-center">
              <Newspaper className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Sin noticias disponibles</p>
              <p className="text-gray-600 text-xs mt-1">Configura tu API key de Finnhub en api-nube</p>
            </div>
          ) : (
            /* Magazine Grid */
            <div className="space-y-4">
              {/* Hero article */}
              {news[0] && (
                <button
                  onClick={() => openArticle(news[0])}
                  className="w-full text-left bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/20 transition-colors group"
                >
                  {news[0].image && (
                    <div className="relative aspect-[16/9] overflow-hidden bg-zinc-900">
                      <img src={news[0].image} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" loading="lazy" />
                      <div className="absolute top-3 left-3">
                        <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-blis-red text-white uppercase tracking-wider">
                          {news[0].category || 'Última hora'}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-white font-bold text-base leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                      {news[0].title}
                    </h3>
                    <p className="text-gray-400 text-xs mt-2 line-clamp-2 leading-relaxed">{news[0].summary}</p>
                    <div className="flex items-center gap-2 mt-3 text-[10px]">
                      <span className="text-gray-500 font-bold">{news[0].source}</span>
                      <span className="text-gray-600">·</span>
                      <span className="text-gray-500">{timeAgo(news[0].date)}</span>
                    </div>
                  </div>
                </button>
              )}

              {/* Secondary articles - 2 column grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {news.slice(1, 7).map(item => (
                  <button
                    key={item.id}
                    onClick={() => openArticle(item)}
                    className="text-left bg-zinc-950 border border-white/5 rounded-xl overflow-hidden hover:border-blue-500/20 transition-colors group"
                  >
                    {item.image && (
                      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                        <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" loading="lazy" />
                      </div>
                    )}
                    <div className="p-3.5">
                      <h4 className="text-white font-bold text-xs leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-2 text-[9px]">
                        <span className="text-gray-500 font-bold">{item.source}</span>
                        <span className="text-gray-600">·</span>
                        <span className="text-gray-500">{timeAgo(item.date)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* More articles - compact list */}
              {news.slice(7).length > 0 && (
                <div className="space-y-2 pt-2">
                  {news.slice(7).map(item => (
                    <button
                      key={item.id}
                      onClick={() => openArticle(item)}
                      className="w-full text-left flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-blue-500/20 transition-colors group"
                    >
                      {item.image && (
                        <img src={item.image} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" loading="lazy" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white text-xs font-bold line-clamp-2 group-hover:text-blue-400 transition-colors leading-snug">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1.5 text-[9px]">
                          <span className="text-gray-500 font-bold">{item.source}</span>
                          <span className="text-gray-600">·</span>
                          <span className="text-gray-500">{timeAgo(item.date)}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Article Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[5vh] px-4 overflow-y-auto"
            onClick={() => closeArticle()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden my-8"
            >
              {/* Back button */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                <button
                  onClick={() => closeArticle()}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                  {selectedArticle.source} · {timeAgo(selectedArticle.date)}
                </span>
              </div>

              {/* Image */}
              {selectedArticle.image && (
                <div className="relative aspect-[16/9] overflow-hidden bg-zinc-900">
                  <img src={selectedArticle.image} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Content */}
              <div className="p-5 sm:p-6 space-y-4">
                <div>
                  {selectedArticle.category && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blis-red/10 text-blis-red border border-blis-red/20 uppercase tracking-wider mb-2 inline-block">
                      {selectedArticle.category}
                    </span>
                  )}
                  <h2 className="text-white font-black text-lg leading-tight">{selectedArticle.title}</h2>
                </div>

                {articleContent.loading ? (
                  <div className="flex items-center gap-3 py-8 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Cargando artículo completo...</span>
                  </div>
                ) : (
                  <>
                    {articleContent.error && (
                      <p className="text-amber-400/60 text-[10px]">
                        Se muestra el resumen (no se pudo extraer el original).{' '}
                        <span className="text-gray-500">Motivo: {articleContent.error}</span>
                      </p>
                    )}
                    <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line max-h-[50vh] overflow-y-auto pr-2">
                      {articleContent.text || selectedArticle.summary || 'Sin contenido disponible.'}
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-[11px] text-gray-500">
                    Fuente: <span className="text-gray-400 font-bold">{selectedArticle.source}</span>
                  </span>
                  <a
                    href={selectedArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-blis-red text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-blis-red/80 transition-colors"
                  >
                    Leer artículo completo
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
