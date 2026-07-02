"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar, Newspaper, TrendingUp, ExternalLink, Loader2, Clock,
  MapPin, Globe, AlertCircle, User, ChevronRight, Shield, RefreshCw
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

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

interface CalendarItem {
  date: string
  time: string
  country: string
  event: string
  actual: string | null
  previous: string | null
  estimate: string | null
  impact: string
  unit: string
}

interface MentorEvent {
  id: string
  autor: { nombre: string; apellido?: string; avatar_url?: string }
  contenido?: string
  evento?: {
    titulo: string
    descripcion?: string
    fecha_inicio: string
    hora_inicio?: string
    tipo: string
    ubicacion?: string
  }
  created_at: string
}

export function PortalNoticias() {
  const { user } = useAuth()
  const [news, setNews] = useState<NewsItem[]>([])
  const [calendar, setCalendar] = useState<CalendarItem[]>([])
  const [mentorEvents, setMentorEvents] = useState<MentorEvent[]>([])
  const [loadingNews, setLoadingNews] = useState(true)
  const [loadingMentor, setLoadingMentor] = useState(true)

  useEffect(() => {
    fetchNews()
    fetchMentorEvents()
  }, [])

  const fetchNews = async (force = false) => {
    setLoadingNews(true)
    try {
      const cacheBust = force ? '&force=true' : ''
      const t = Date.now()
      const [newsRes, calRes] = await Promise.all([
        fetch(`/api/portal/noticias?type=news&cacheBust=${t}${cacheBust}`),
        fetch(`/api/portal/noticias?type=calendar&cacheBust=${t}${cacheBust}`),
      ])
      const newsData = await newsRes.json()
      const calData = await calRes.json()
      if (newsData.success) setNews(newsData.data?.news || [])
      if (calData.success) setCalendar(calData.data?.calendar || [])
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

  const impactColor = (impact: string) => {
    if (!impact) return 'text-gray-600 bg-white/5'
    const v = impact.toLowerCase()
    if (v.includes('high') || v.includes('alta') || v.includes('3') || v.includes('alto')) return 'text-red-400 bg-red-500/10 border-red-500/20'
    if (v.includes('med') || v.includes('media') || v.includes('2') || v.includes('moderado')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
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
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Eventos del mentor · Calendario macro · Noticias globales</p>
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

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        {/* LEFT: Mentor Events */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-black text-amber-400 uppercase tracking-wider">Eventos Clave del Mentor</h2>
          </div>

          {loadingMentor ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
            </div>
          ) : mentorEvents.length === 0 ? (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center">
              <Calendar className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No hay eventos del mentor aún</p>
              <p className="text-gray-600 text-xs mt-1">Los admins pueden crear eventos destacados desde el PostCreator</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mentorEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-zinc-950 border border-white/5 rounded-2xl p-5 hover:border-amber-500/20 transition-colors"
                >
                  {event.evento ? (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-sm">{event.evento.titulo}</h3>
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
                                {event.evento.tipo === 'digital' ? '💻 Digital' : event.evento.tipo === 'presencial' ? '📍 Presencial' : '🔀 Híbrido'}
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
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                            <User className="w-3 h-3 text-gray-500" />
                          </div>
                          <span className="text-[10px] text-gray-500">
                            {event.autor?.nombre || 'Mentor'}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-600">{timeAgo(event.created_at)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-300 text-sm">{event.contenido || 'Anuncio del mentor'}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-gray-500">{event.autor?.nombre}</span>
                          <span className="text-[10px] text-gray-600">{timeAgo(event.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Global News + Calendar */}
        <div className="space-y-6">
          {/* News Feed */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-black text-blue-400 uppercase tracking-wider">Noticias Globales</h2>
            </div>

            {loadingNews ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              </div>
            ) : news.length === 0 ? (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center">
                <Globe className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Sin noticias disponibles</p>
                <p className="text-gray-600 text-xs mt-1">Configura tu API key de Finnhub en api-nube</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {news.map((item, i) => (
                  <a
                    key={item.id || i}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white/[0.02] border border-white/5 rounded-xl p-3.5 hover:border-blue-500/20 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      {item.image && (
                        <img src={item.image} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" loading="lazy" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white text-xs font-bold line-clamp-2 group-hover:text-blue-400 transition-colors leading-snug">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[9px] text-gray-500">{item.source}</span>
                          <span className="text-[9px] text-gray-600">·</span>
                          <span className="text-[9px] text-gray-500">{timeAgo(item.date)}</span>
                        </div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-blue-400 transition-colors shrink-0 mt-1" />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Economic Calendar */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-black text-emerald-400 uppercase tracking-wider">Calendario Económico</h2>
            </div>

            {loadingNews ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
              </div>
            ) : calendar.length === 0 ? (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center">
                <Calendar className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Próximamente</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                {calendar.map((item, i) => (
                  <div key={`${item.date}-${item.event}-${i}`} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-xs font-medium line-clamp-1">{item.event}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-gray-500 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {item.time || '—'} · {formatDate(item.date)}
                          </span>
                          <span className="text-[9px] text-gray-600">{item.country}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        {item.impact && (
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${impactColor(item.impact)}`}>
                            {item.impact}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 text-[9px]">
                          {item.actual && <span className="text-white font-bold">{item.actual}{item.unit}</span>}
                          {item.previous && <span className="text-gray-600">Prev: {item.previous}{item.unit}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
