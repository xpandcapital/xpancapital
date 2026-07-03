"use client"

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar, Newspaper, Loader2, Clock,
  MapPin, Shield, RefreshCw, TrendingUp, AlertCircle,
  Filter, ChevronDown
} from 'lucide-react'

interface ForexEvent {
  id: string
  event: string
  currency: string
  time: string
  impact: string
  outcome: string
  strength: string
  quality: string
  forecast: string | null
  previous: string | null
  actual: string | null
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

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'NZD', 'CAD']

export function PortalNoticias() {
  const [forexEvents, setForexEvents] = useState<ForexEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<ForexEvent[]>([])
  const [mentorEvents, setMentorEvents] = useState<MentorEvent[]>([])
  const [loadingForex, setLoadingForex] = useState(true)
  const [loadingMentor, setLoadingMentor] = useState(true)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)

  // Filtros
  const [filterImpact, setFilterImpact] = useState<string[]>(['high', 'medium'])
  const [filterCurrency, setFilterCurrency] = useState<string[]>(CURRENCIES)
  const [showFilters, setShowFilters] = useState(false)

  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    fetchForexNews()
    fetchMentorEvents()
    return () => { abortRef.current?.abort() }
  }, [])

  // Aplicar filtros cuando cambian eventos o filtros
  useEffect(() => {
    setFilteredEvents(
      forexEvents.filter(e =>
        filterImpact.includes(e.impact) &&
        filterCurrency.includes(e.currency)
      )
    )
  }, [forexEvents, filterImpact, filterCurrency])

  const fetchForexNews = async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoadingForex(true)
    setError('')
    setDebugInfo(null)
    try {
      const res = await fetch('/api/portal/forex-news?type=today&debug=true')
      const data = await res.json()
      if (data.debug) setDebugInfo(data.debug)
      if (data.success) {
        setForexEvents(data.data?.events || [])
      } else {
        setError(data.error || data.data?.hint || 'Error cargando forex')
      }
    } catch (e: any) {
      setError('Error de conexión: ' + (e.message || 'desconocido'))
    } finally {
      setLoadingForex(false)
    }
  }

  const fetchMentorEvents = async () => {
    setLoadingMentor(true)
    try {
      const res = await fetch('/api/comunidad?es_evento_mentor=true&limit=15')
      const data = await res.json()
      if (data.success) setMentorEvents(data.data || [])
    } catch { /* silencioso */ }
    finally { setLoadingMentor(false) }
  }

  const toggleFilter = (type: 'impact' | 'currency', value: string) => {
    if (type === 'impact') {
      setFilterImpact(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])
    } else {
      setFilterCurrency(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])
    }
  }

  const impactConfig = (impact: string) => {
    const map: Record<string, { color: string; bg: string; border: string; label: string; dot: string }> = {
      high: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Alto', dot: 'bg-red-400' },
      medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Medio', dot: 'bg-amber-400' },
      low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Bajo', dot: 'bg-emerald-400' },
    }
    return map[impact] || map.low
  }

  const strengthBadge = (s: string) => {
    if (!s) return null
    return s.toLowerCase().includes('strong') || s.toLowerCase().includes('fuerte')
      ? <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">FUERTE</span>
      : <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-gray-500 border border-white/10">DÉBIL</span>
  }

  const qualityBadge = (q: string) => {
    if (!q) return null
    return q.toLowerCase().includes('good') || q.toLowerCase().includes('bueno')
      ? <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">BUENO</span>
      : <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">MALO</span>
  }

  const outcomeIcon = (o: string) => {
    if (!o) return null
    const v = o.toLowerCase()
    if (v.includes('actual >') || v.includes('better') || v.includes('above')) return '▲'
    if (v.includes('actual <') || v.includes('worse') || v.includes('below')) return '▼'
    return '●'
  }

  const outcomeColor = (o: string) => {
    if (!o) return 'text-gray-500'
    const v = o.toLowerCase()
    if (v.includes('actual >') || v.includes('better') || v.includes('above')) return 'text-emerald-400'
    if (v.includes('actual <') || v.includes('worse') || v.includes('below')) return 'text-red-400'
    return 'text-gray-400'
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

  const formatTime = (t: string) => {
    try {
      const d = new Date(t)
      return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
    } catch { return t }
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
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Eventos del mentor · Forex News IA</p>
            </div>
          </div>
          <button
            onClick={fetchForexNews}
            disabled={loadingForex}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] text-gray-400 font-bold uppercase tracking-wider hover:text-white hover:border-white/20 transition-colors disabled:opacity-50"
          >
            {loadingForex ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
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
                            <img src={event.evento.imagen_url} alt="" className="w-full h-full object-contain bg-zinc-900" loading="lazy" />
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

        {/* RIGHT: Forex News (JBlanked) */}
        <div className="order-1 lg:order-2">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-black text-cyan-400 uppercase tracking-wider">Forex News IA</h2>
            <span className="text-[9px] text-gray-600">· JBlanked</span>
          </div>

          {/* Filtros */}
          <div className="mb-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-white transition-colors"
            >
              <Filter className="w-3 h-3" />
              Filtros
              <span className="text-gray-600">
                ({filterImpact.length + filterCurrency.length})
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {showFilters && (
              <div className="mt-2 p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                {/* Impacto */}
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Impacto</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {['high', 'medium', 'low'].map(impact => {
                      const cfg = impactConfig(impact)
                      return (
                        <button
                          key={impact}
                          onClick={() => toggleFilter('impact', impact)}
                          className={`text-[9px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
                            filterImpact.includes(impact)
                              ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                              : 'bg-white/5 text-gray-600 border-white/5 hover:border-white/10'
                          }`}
                        >
                          {cfg.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                {/* Divisa */}
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Divisa</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {CURRENCIES.map(c => (
                      <button
                        key={c}
                        onClick={() => toggleFilter('currency', c)}
                        className={`text-[9px] font-bold px-2 py-1 rounded-full border transition-colors ${
                          filterCurrency.includes(c)
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-white/5 text-gray-600 border-white/5 hover:border-white/10'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Forex Events List */}
          {loadingForex ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-zinc-950 border border-white/5 rounded-xl p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-white/[0.06]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-white/[0.04] rounded w-3/4" />
                      <div className="h-2 bg-white/[0.03] rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error || filteredEvents.length === 0 ? (
            <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 text-center space-y-2">
              {error ? (
                <>
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-amber-400 text-xs font-bold">{error}</p>
                </>
              ) : (
                <>
                  <Calendar className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Sin eventos disponibles</p>
                  <p className="text-gray-600 text-xs mt-1">Configura tu API key de JBlanked en api-nube</p>
                </>
              )}
              {debugInfo && (
                <div className="mt-3 p-3 bg-black/30 border border-white/5 rounded-lg text-left max-h-[300px] overflow-y-auto">
                  <p className="text-[9px] text-cyan-400 uppercase tracking-wider font-bold mb-2">Debug</p>
                  {Object.entries(debugInfo).map(([k, v]) => (
                    <p key={k} className="text-[10px] text-gray-400 leading-relaxed">
                      <span className="text-gray-500 font-bold">{k}:</span>{' '}
                      <span className="text-gray-300 break-all">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                    </p>
                  ))}
                </div>
              )}
              <button onClick={fetchForexNews} className="mt-2 px-3 py-1.5 bg-white/5 rounded-lg text-[10px] text-gray-400 hover:text-white">
                Reintentar
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-zinc-950 border border-white/5 rounded-2xl p-8 text-center">
              <Calendar className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Sin eventos disponibles</p>
              <p className="text-gray-600 text-xs mt-1">Configura tu API key de JBlanked en api-nube</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredEvents.map((event, i) => {
                const cfg = impactConfig(event.impact)
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <button
                      onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-colors ${
                        expandedEvent === event.id
                          ? `${cfg.bg} ${cfg.border}`
                          : 'bg-zinc-950 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Impact dot */}
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="text-white text-xs font-bold leading-snug">{event.event}</h4>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-[9px] text-gray-400 font-bold">{event.currency}</span>
                                <span className="text-gray-600">·</span>
                                <span className="flex items-center gap-1 text-[9px] text-gray-500">
                                  <Clock className="w-2.5 h-2.5" />
                                  {formatTime(event.time)}
                                </span>
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border} uppercase tracking-wider`}>
                                  {cfg.label}
                                </span>
                              </div>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 text-gray-500 mt-1 shrink-0 transition-transform ${expandedEvent === event.id ? 'rotate-180' : ''}`} />
                          </div>

                          {/* Expanded details */}
                          {expandedEvent === event.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="mt-3 pt-3 border-t border-white/5 space-y-2 overflow-hidden"
                            >
                              {/* Forecast / Previous */}
                              {(event.forecast || event.previous) && (
                                <div className="grid grid-cols-2 gap-2">
                                  {event.forecast && (
                                    <div className="bg-white/[0.02] rounded-lg p-2">
                                      <p className="text-[8px] text-gray-500 uppercase tracking-wider">Forecast</p>
                                      <p className="text-white text-xs font-bold">{event.forecast}</p>
                                    </div>
                                  )}
                                  {event.previous && (
                                    <div className="bg-white/[0.02] rounded-lg p-2">
                                      <p className="text-[8px] text-gray-500 uppercase tracking-wider">Previous</p>
                                      <p className="text-white text-xs font-bold">{event.previous}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Outcome */}
                              {event.outcome && (
                                <div className="flex items-center gap-2 text-[10px]">
                                  <span className={`font-black ${outcomeColor(event.outcome)}`}>
                                    {outcomeIcon(event.outcome)} {event.outcome}
                                  </span>
                                </div>
                              )}

                              {/* Strength + Quality */}
                              <div className="flex items-center gap-2">
                                {strengthBadge(event.strength)}
                                {qualityBadge(event.quality)}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </button>
                  </motion.div>
                )
              })}

              <p className="text-center text-[9px] text-gray-600 pt-2">
                {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
