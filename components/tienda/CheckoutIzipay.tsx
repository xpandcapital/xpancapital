"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Loader2, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react"
import Link from "next/link"
import Script from "next/script"

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
  const [sdkReady, setSdkReady] = useState(false)

  useEffect(() => {
    if (!sdkReady || typeof window === 'undefined' || !window.KR) return

    const timeout = setTimeout(() => {
      if (formState === 'loading') {
        setFormState('ready')
      }
    }, 10000)

    try {
      window.KR.onSubmit((response: any) => {
        setFormState('processing')
        const status = response?.clientAnswer?.orderStatus || response?.orderStatus

        if (status === 'PAID') {
          setFormState('success')
          onSuccess?.()
        } else {
          setFormState('error')
          setErrorMsg('El pago no pudo ser procesado.')
        }

        return true
      })

      window.KR.onError((error: any) => {
        setFormState('error')
        setErrorMsg(error?.message || error?.toString() || 'Error al procesar el pago.')
        return true
      })

      window.KR.onFormReady(() => {
        clearTimeout(timeout)
        setFormState('ready')
      })
    } catch (e) {
      console.error('[KR] setup error:', e)
    }

    return () => {
      clearTimeout(timeout)
      try {
        if (window.KR && typeof window.KR.removeForms === 'function') {
          window.KR.removeForms()
        }
      } catch {}
    }
  }, [sdkReady, formState, onSuccess, onError])

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="relative w-full">
      <Script
        src="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
        onError={() => {
          setFormState('error')
          setErrorMsg('No se pudo cargar la pasarela de pago.')
        }}
      />

      <AnimatePresence mode="wait">
        {(formState === 'loading' || formState === 'ready' || formState === 'processing') && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            <div
              className="kr-embedded w-full min-h-[400px]"
              kr-form-token={formToken}
              kr-public-key={publicKey}
              kr-language="es-ES"
            />
            {formState === 'loading' && (
              <div className="flex items-center justify-center gap-3 py-4 mt-4">
                <Loader2 className="w-5 h-5 text-blis-red animate-spin" />
                <p className="text-gray-500 text-sm">Cargando formulario de pago...</p>
              </div>
            )}
          </motion.div>
        )}

        {formState === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="text-center py-8 space-y-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
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

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-4"
            >
              <Link
                href="/miembros"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-blis-red hover:bg-blis-red/90 text-white font-black uppercase text-sm rounded-2xl transition-all shadow-[0_0_30px_rgba(255,30,86,0.3)]"
              >
                <ExternalLink className="w-4 h-4" /> Acceder a Mis Productos
              </Link>
            </motion.div>
          </motion.div>
        )}

        {formState === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 space-y-4"
          >
            <div className="w-16 h-16 mx-auto bg-red-100 border border-red-200 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Pago no completado</h3>
              <p className="text-gray-500 text-sm mt-1">{errorMsg || 'Error al procesar el pago.'}</p>
            </div>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blis-red hover:bg-blis-red/90 text-white font-bold rounded-xl transition-all"
            >
              <Shield className="w-4 h-4" /> Reintentar Pago
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
