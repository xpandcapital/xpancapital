"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Loader2, CheckCircle2, ExternalLink, AlertCircle, Shield,
  ArrowRight, Lock
} from "lucide-react"
import Link from "next/link"

interface CheckoutIzipayProps {
  formToken: string
  publicKey: string
  ordenId: string
  totalUSD: number
  displayMode?: 'popup' | 'embedded'
  onSuccess?: () => void
  onError?: (msg: string) => void
}

type FormState = 'loading' | 'ready' | 'success' | 'error'

export function CheckoutIzipay({ formToken, publicKey, totalUSD, displayMode = 'popup', onSuccess }: CheckoutIzipayProps) {
  const [formState, setFormState] = useState<FormState>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current || typeof window === 'undefined' || !containerRef.current) return
    initializedRef.current = true

    const container = containerRef.current

    // Crear el div kr-embedded con vanilla JS antes de cargar el script
    const krDiv = document.createElement('div')
    krDiv.className = 'kr-embedded'
    krDiv.setAttribute('kr-form-token', formToken)
    krDiv.setAttribute('kr-public-key', publicKey)
    krDiv.setAttribute('kr-language', 'es-ES')
    krDiv.style.width = '100%'
    krDiv.style.minHeight = '500px'

    if (displayMode === 'popup') {
      krDiv.setAttribute('kr-popin', '')
      krDiv.style.height = '0'
      krDiv.style.overflow = 'hidden'
    }

    container.innerHTML = ''
    container.appendChild(krDiv)

    // Cargar el script después de que el div existe en el DOM
    const script = document.createElement('script')
    const baseUrl = 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js'
    script.src = displayMode === 'embedded'
      ? `${baseUrl}?mode=embedded&container=.kr-embedded`
      : baseUrl
    script.async = true

    script.onload = () => {
      let attempts = 0
      const waitForKR = () => {
        attempts++
        if (window.KR) {
          try {
            if (typeof window.KR.setFormToken === 'function') {
              window.KR.setFormToken(formToken)
            }
          } catch {}

          window.KR.onFormReady(() => setFormState('ready'))

          window.KR.onSubmit((response: any) => {
            const status = response?.clientAnswer?.orderStatus || response?.orderStatus
            if (status === 'PAID') {
              setFormState('success')
              onSuccess?.()
            } else {
              setFormState('error')
              setErrorMsg('El pago fue rechazado.')
            }
            return true
          })

          window.KR.onError((error: any) => {
            setFormState('error')
            setErrorMsg(error?.message || 'Error al procesar el pago.')
            return true
          })

          setTimeout(() => {
            if (formState === 'loading') setFormState('ready')
          }, 10000)
        } else if (attempts < 30) {
          setTimeout(waitForKR, 300)
        } else {
          setFormState('error')
          setErrorMsg('La pasarela de pago no respondió. Intenta de nuevo.')
        }
      }
      waitForKR()
    }

    script.onerror = () => {
      setFormState('error')
      setErrorMsg('No se pudo cargar la pasarela de pago.')
    }

    document.head.appendChild(script)

    return () => {
      try { window.KR?.removeForms() } catch {}
    }
  }, [])

  return (
    <div>
      <AnimatePresence mode="wait">
        {/* ── LOADING ─────────────────────────────────────────────── */}
        {formState === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="h-3 w-20 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="h-3 w-16 bg-gray-100 rounded-full animate-pulse" />
                  <div className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-12 bg-gray-100 rounded-full animate-pulse" />
                  <div className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
                </div>
              </div>
              <div className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
            </div>
            <div className="flex items-center justify-center gap-3 py-2">
              <Loader2 className="w-5 h-5 text-blis-red animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Conectando con la pasarela de pago...</p>
            </div>
          </motion.div>
        )}

        {/* ── READY ───────────────────────────────────────────────── */}
        {(formState === 'loading' || formState === 'ready') && (
          <div ref={containerRef} className="w-full" style={formState === 'loading' ? { display: 'none' } : undefined} />
        )}

        {/* ── READY: mensaje para popup ──────────────────────────── */}
        {formState === 'ready' && displayMode === 'popup' && (
          <motion.div key="ready-popup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="py-6 space-y-5">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blis-red/5 border border-blis-red/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-blis-red" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-gray-900">Verificación de pago</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                  Se abrirá una ventana emergente con el formulario de pago seguro de Izipay. Completa los datos de tu tarjeta para finalizar la compra.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blis-red/5 border border-blis-red/10 rounded-full">
                <div className="w-2 h-2 bg-blis-red rounded-full animate-pulse" />
                <span className="text-xs text-blis-red font-bold">Esperando pasarela de pago...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── SUCCESS ─────────────────────────────────────────────── */}
        {formState === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }} transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
            className="text-center py-10">
            <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.05 }}
              className="relative mx-auto mb-8 w-28 h-28">
              <div className="absolute inset-0 bg-emerald-400/20 rounded-[2rem] blur-2xl animate-pulse" />
              <div className="relative w-full h-full bg-emerald-100 border-2 border-emerald-200 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.15)]">
                <CheckCircle2 className="w-14 h-14 text-emerald-500" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="space-y-3 mb-10">
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">¡Pago Exitoso!</h3>
              <p className="text-gray-500">Hemos procesado tu pago de <span className="font-bold text-gray-800">${totalUSD.toFixed(2)} USD</span> correctamente.</p>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-xs text-emerald-700 font-medium">Pago confirmado</span>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="space-y-3">
              <Link href="/miembros"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blis-red to-blis-red/90 hover:from-blis-red/90 hover:to-blis-red text-white font-black uppercase text-sm rounded-2xl transition-all shadow-[0_0_30px_rgba(255,30,86,0.25)] hover:shadow-[0_0_50px_rgba(255,30,86,0.4)] group">
                Acceder a Mis Productos <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <br />
              <Link href="/tienda" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Continuar comprando</Link>
            </motion.div>
          </motion.div>
        )}

        {/* ── ERROR ────────────────────────────────────────────────── */}
        {formState === 'error' && (
          <motion.div key="error" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }} className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Pago no completado</h3>
            <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">{errorMsg || 'No se pudo procesar el pago.'}</p>
            <div className="space-y-3">
              <button onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-blis-red hover:bg-blis-red/90 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(255,30,86,0.15)]">
                <Shield className="w-4 h-4" /> Reintentar Pago
              </button>
              <br />
              <Link href="/tienda/checkout" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowRight className="w-3.5 h-3.5 inline mr-1 rotate-180" /> Elegir otro método de pago
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
