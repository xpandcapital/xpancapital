"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio, ExternalLink } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
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

function detectarTipoPagina(pathname: string): string | null {
  if (pathname === '/') return 'landing'
  if (pathname.startsWith('/tienda')) return 'tienda'
  if (pathname.startsWith('/blog')) return 'blog'
  if (pathname.startsWith('/miembros')) return 'miembros'
  // landing dinámicas: /[slug]
  if (pathname.split('/').filter(Boolean).length === 1) return 'landing'
  return null
}

function formatHora(iso: string | null | undefined): string {
  if (!iso) return '--:--'
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

export function LiveTransmissionBanner() {
  const pathname = usePathname()
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

  // Carga inicial
  useEffect(() => {
    async function cargarEstado() {
      try {
        const res = await fetch(`/api/transmisiones?empresa_id=${DEFAULT_EMPRESA_ID}`)
        const data = await res.json()
        if (data.success && data.data) {
          const t = data.data as TransmisionData
          const tipoPagina = detectarTipoPagina(pathname)
          if (tipoPagina && t.paginas.includes(tipoPagina)) {
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

  // Realtime subscription
  useEffect(() => {
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
            const tipoPagina = detectarTipoPagina(pathname)
            if (nuevo.activo && tipoPagina && nuevo.paginas.includes(tipoPagina)) {
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
              const tipoPagina = detectarTipoPagina(pathname)
              if (tipoPagina && nuevo.paginas.includes(tipoPagina)) {
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
  }, [pathname, limpiarTimeout, programarAutoOcultar])

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => limpiarTimeout()
  }, [limpiarTimeout])

  const tipoPaginaActual = detectarTipoPagina(pathname)

  if (!transmision || !tipoPaginaActual || !transmision.paginas.includes(tipoPaginaActual)) {
    return null
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="fixed top-20 left-0 right-0 z-40"
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 border-b border-emerald-500/30">
            {/* Fondo animado */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                className="absolute -top-40 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-40 right-1/4 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl"
                animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.2, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>

            <div className="max-w-screen-xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4 relative">
              {/* Izquierda: indicador EN VIVO */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="relative flex items-center justify-center">
                  <motion.div
                    className="absolute w-4 h-4 rounded-full bg-emerald-400/30"
                    animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute w-4 h-4 rounded-full bg-emerald-400/20"
                    animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  />
                  <motion.div
                    className="relative w-2.5 h-2.5 rounded-full bg-emerald-400"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </div>
                <span className="text-emerald-400 text-[10px] uppercase tracking-[0.2em] font-black">
                  EN VIVO
                </span>
              </div>

              {/* Centro: textos */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="min-w-0">
                  <p className="text-white text-sm md:text-base font-bold truncate">
                    {transmision.titulo}
                  </p>
                  {transmision.subtitulo && (
                    <p className="text-emerald-300/80 text-[11px] md:text-xs truncate">
                      {transmision.subtitulo}
                    </p>
                  )}
                </div>
                <span className="hidden sm:inline text-[10px] text-emerald-500/60 font-bold shrink-0">
                  Inició {formatHora(transmision.inicio)}
                </span>
              </div>

              {/* Derecha: botón */}
              <a
                href={transmision.link}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 group flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs md:text-sm font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
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
