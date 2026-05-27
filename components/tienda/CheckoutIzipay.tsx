"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, CheckCircle2, ExternalLink, Shield, AlertCircle } from "lucide-react"
import Link from "next/link"

interface CheckoutIzipayProps {
  formToken: string
  publicKey: string
  ordenId: string
  totalUSD: number
  onSuccess?: () => void
  onError?: (msg: string) => void
}

type FormState = 'loading' | 'ready' | 'processing' | 'success' | 'error'

export function CheckoutIzipay({ formToken, publicKey, ordenId, totalUSD, onSuccess, onError }: CheckoutIzipayProps) {
  const [formState, setFormState] = useState<FormState>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const loadScript = () => {
      if (scriptLoadedRef.current) return
      scriptLoadedRef.current = true

      const script = document.createElement('script')
      script.src = 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js'
      script.async = true
      script.onload = () => setupKRCallbacks()
      script.onerror = () => {
        setFormState('error')
        setErrorMsg('No se pudo cargar la pasarela de pago.')
      }
      document.head.appendChild(script)
    }

    const setupKRCallbacks = () => {
      if (!window.KR) {
        setTimeout(setupKRCallbacks, 200)
        return
      }

      const timeout = setTimeout(() => {
        if (formState === 'loading') setFormState('ready')
      }, 15000)

      try {
        window.KR.onSubmit((response: any) => {
          setFormState('processing')
          const status = response?.clientAnswer?.orderStatus || response?.orderStatus
          if (status === 'PAID') {
            clearTimeout(timeout)
            setFormState('success')
            onSuccess?.()
          } else {
            clearTimeout(timeout)
            setFormState('error')
            setErrorMsg('El pago no pudo ser procesado.')
          }
          return true
        })

        window.KR.onError((error: any) => {
          clearTimeout(timeout)
          setFormState('error')
          setErrorMsg(error?.message || 'Error al procesar el pago.')
          return true
        })

        window.KR.onFormReady(() => {
          clearTimeout(timeout)
          setFormState('ready')
        })
      } catch (e) {
        console.error('[KR] setup error:', e)
      }

      return () => clearTimeout(timeout)
    }

    loadScript()

    return () => {
      try {
        if (window.KR?.removeForms) window.KR.removeForms()
      } catch {}
    }
  }, [])

  return (
    <div className="relative w-full">
      {/* El div kr-embedded SIEMPRE está presente — nunca se desmonta */}
      <div
        className="kr-embedded w-full"
        style={{ minHeight: formState === 'loading' || formState === 'error' ? '100px' : '400px' }}
        kr-form-token={formToken}
        kr-public-key={publicKey}
        kr-language="es-ES"
      />

      {/* Overlay de estados encima del div kr-embedded */}
      <AnimatePresence>
        {formState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#f1f2f4]/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10"
          >
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-blis-red animate-spin" />
              <p className="text-gray-600 font-medium">Cargando formulario de pago...</p>
            </div>
          </motion.div>
        )}

        {formState === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#f1f2f4]/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-20"
          >
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blis-red animate-spin mx-auto" />
              <p className="text-gray-600 font-medium">Procesando tu pago...</p>
              <p className="text-xs text-gray-400">No cierres esta ventana</p>
            </div>
          </motion.div>
        )}

        {formState === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center z-30"
          >
            <div className="text-center py-8 space-y-6">
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-24 h-24 mx-auto bg-emerald-100 border border-emerald-200 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)]"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-2xl font-black text-gray-900">¡Pago Exitoso!</h3>
                <p className="text-gray-500 mt-2">
                  Tu pago de <span className="font-bold text-gray-900">${totalUSD.toFixed(2)}</span> ha sido procesado.
                </p>
              </motion.div>

              <Link
                href="/miembros"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-blis-red hover:bg-blis-red/90 text-white font-black uppercase text-sm rounded-2xl transition-all shadow-[0_0_30px_rgba(255,30,86,0.3)]"
              >
                <ExternalLink className="w-4 h-4" /> Acceder a Mis Productos
              </Link>
            </div>
          </motion.div>
        )}

        {formState === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center z-30"
          >
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto bg-red-100 border border-red-200 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Pago no completado</h3>
              <p className="text-gray-500 text-sm">{errorMsg || 'Error al procesar el pago.'}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blis-red hover:bg-blis-red/90 text-white font-bold rounded-xl transition-all"
              >
                <Shield className="w-4 h-4" /> Reintentar Pago
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
