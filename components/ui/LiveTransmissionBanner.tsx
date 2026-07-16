"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useShop } from '@/context/ShopContext'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

interface TransmisionData {
  id: string
  empresa_id: string
  tipo: string
  titulo: string
  subtitulo?: string | null
  link: string
  texto_boton: string
  activo: boolean
  duracion_minutos: number
  inicio: string
  fin: string
  color: string
  paginas: string[]
  productos_ids: string[]
}

type PaletteKey = 'verde' | 'azul'

interface Palette {
  bg: string
  border: string
  orb1: string
  orb2: string
  dot1: string
  dot2: string
  dot3: string
  text: string
  subtext: string
  time: string
  btn: string
  btnHover: string
  btnShadow: string
  badge: string
  badgeBorder: string
}

const PALETTES: Record<PaletteKey, Palette> = {
  verde: {
    bg: 'from-emerald-950 via-emerald-900 to-emerald-950',
    border: 'border-emerald-500/30',
    orb1: 'bg-emerald-500/10',
    orb2: 'bg-emerald-400/10',
    dot1: 'bg-emerald-400/30',
    dot2: 'bg-emerald-400/20',
    dot3: 'bg-emerald-400',
    text: 'text-emerald-400',
    subtext: 'text-emerald-300/80',
    time: 'text-emerald-500/60',
    btn: 'bg-emerald-500',
    btnHover: 'hover:bg-emerald-400',
    btnShadow: 'shadow-emerald-500/25 hover:shadow-emerald-500/40',
    badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    badgeBorder: 'border-emerald-500/30',
  },
  azul: {
    bg: 'from-blue-950 via-blue-900 to-blue-950',
    border: 'border-blue-500/30',
    orb1: 'bg-blue-500/10',
    orb2: 'bg-blue-400/10',
    dot1: 'bg-blue-400/30',
    dot2: 'bg-blue-400/20',
    dot3: 'bg-blue-400',
    text: 'text-blue-400',
    subtext: 'text-blue-300/80',
    time: 'text-blue-500/60',
    btn: 'bg-blue-500',
    btnHover: 'hover:bg-blue-400',
    btnShadow: 'shadow-blue-500/25 hover:shadow-blue-500/40',
    badge: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    badgeBorder: 'border-blue-500/30',
  },
}

function detectarTipoPagina(pathname: string): string | null {
  if (pathname === '/') return 'landing'
  if (pathname.startsWith('/tienda')) return 'tienda'
  if (pathname.startsWith('/blog')) return 'blog'
  if (pathname.startsWith('/miembros')) return 'miembros'
  if (pathname.split('/').filter(Boolean).length === 1) return 'landing'
  return null
}

function formatHora(iso: string | null | undefined): string {
  if (!iso) return '--:--'
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

function tieneAccesoCompra(t: TransmisionData, purchasedProducts: { id: string }[]): boolean {
  if (t.tipo !== 'clase') return true
  if (!t.productos_ids || t.productos_ids.length === 0) return false
  return t.productos_ids.some((pid) => purchasedProducts.some((p) => p.id === pid))
}

export function LiveTransmissionBanner() {
  const pathname = usePathname()

  // No mostrar en panel admin — solo en páginas públicas
  const isAdminPage = pathname.startsWith('/superadmin') || pathname.startsWith('/admin')

  const { user } = useAuth()
  const { purchasedProducts } = useShop()

  const [transmision, setTransmision] = useState<TransmisionData | null>(null)
  const [visible, setVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null)

  const limpiarTimeout = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
  }, [timeoutId])

  const programarAutoOcultar = useCallback((finISO: string) => {
    limpiarTimeout()
    const fin = new Date(finISO).getTime()
    const restante = fin - Date.now()
    if (restante > 0) {
      const id = setTimeout(() => {
        setVisible(false)
        setTransmision(null)
      }, restante)
      setTimeoutId(id)
    } else {
      setVisible(false)
      setTransmision(null)
    }
  }, [limpiarTimeout])

  const puedeMostrar = useCallback((t: TransmisionData): boolean => {
    const tipoPagina = detectarTipoPagina(pathname)
    if (!tipoPagina || !t.paginas.includes(tipoPagina)) return false
    if (t.tipo === 'clase') {
      if (!user) return false
      if (!tieneAccesoCompra(t, purchasedProducts)) return false
    }
    return true
  }, [pathname, user, purchasedProducts])

  useEffect(() => {
    if (isAdminPage) return
    async function cargarEstado() {
      try {
        const res = await fetch(`/api/transmisiones?empresa_id=${DEFAULT_EMPRESA_ID}`)
        const data = await res.json()
        if (data.success && data.data) {
          const t = data.data as TransmisionData
          if (puedeMostrar(t)) {
            setTransmision(t)
            setVisible(true)
            programarAutoOcultar(t.fin)
          }
        }
      } catch {
        // Silencioso
      }
    }
    cargarEstado()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isAdminPage) return
    const supabase = getSupabase()
    if (!supabase) return

    const channel = supabase
      .channel('transmisiones-public')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transmisiones',
          filter: `empresa_id=eq.${DEFAULT_EMPRESA_ID}`,
        },
        (payload) => {
          const nuevo = payload.new as TransmisionData

          if (payload.eventType === 'INSERT') {
            if (nuevo.activo && puedeMostrar(nuevo)) {
              setTransmision(nuevo)
              setVisible(true)
              programarAutoOcultar(nuevo.fin)
            }
          } else if (payload.eventType === 'UPDATE') {
            if (!nuevo.activo) {
              setVisible(false)
              limpiarTimeout()
              setTimeout(() => setTransmision(null), 500)
            } else {
              if (puedeMostrar(nuevo)) {
                setTransmision(nuevo)
                setVisible(true)
                programarAutoOcultar(nuevo.fin)
              }
            }
          } else if (payload.eventType === 'DELETE') {
            setVisible(false)
            limpiarTimeout()
            setTimeout(() => setTransmision(null), 500)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [puedeMostrar, limpiarTimeout, programarAutoOcultar, isAdminPage])

  useEffect(() => {
    return () => limpiarTimeout()
  }, [limpiarTimeout])

  if (isAdminPage || !transmision || !puedeMostrar(transmision)) {
    return null
  }

  const palette = PALETTES[(transmision.color as PaletteKey) || 'verde']
  const isClase = transmision.tipo === 'clase'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="sticky top-20 z-[149]"
        >
          <div className={`relative overflow-hidden bg-gradient-to-r ${palette.bg} border-b ${palette.border}`}>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                className={`absolute -top-40 left-1/4 w-96 h-96 ${palette.orb1} rounded-full blur-3xl`}
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className={`absolute -bottom-40 right-1/4 w-80 h-80 ${palette.orb2} rounded-full blur-3xl`}
                animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.2, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>

            <div className="max-w-screen-xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4 relative">
              <div className="flex items-center gap-3 shrink-0">
                <div className="relative flex items-center justify-center">
                  <motion.div
                    className={`absolute w-4 h-4 rounded-full ${palette.dot1}`}
                    animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className={`absolute w-4 h-4 rounded-full ${palette.dot2}`}
                    animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  />
                  <motion.div
                    className={`relative w-2.5 h-2.5 rounded-full ${palette.dot3}`}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </div>
                <span className={`${palette.text} text-[10px] uppercase tracking-[0.2em] font-black`}>
                  {isClase ? 'CLASE PRIVADA' : 'EN VIVO'}
                </span>
              </div>

              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="min-w-0">
                  <p className="text-white text-sm md:text-base font-bold truncate">
                    {transmision.titulo}
                  </p>
                  {transmision.subtitulo && (
                    <p className={`${palette.subtext} text-[11px] md:text-xs truncate`}>
                      {transmision.subtitulo}
                    </p>
                  )}
                </div>
                <span className={`hidden sm:inline text-[10px] ${palette.time} font-bold shrink-0`}>
                  Inició {formatHora(transmision.inicio)}
                </span>
              </div>

              <a
                href={transmision.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`shrink-0 group flex items-center gap-2 px-4 py-2 rounded-xl ${palette.btn} text-white text-xs md:text-sm font-bold ${palette.btnHover} transition-all shadow-lg ${palette.btnShadow}`}
              >
                {transmision.texto_boton}
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
