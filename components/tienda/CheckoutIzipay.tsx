"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Loader2, CheckCircle2, ExternalLink, Shield, AlertCircle } from "lucide-react"
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
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current || typeof window === 'undefined') return
    loadedRef.current = true

    const script = document.createElement('script')
    script.src = 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js'
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

          window.KR.onFormReady(() => {
            setFormState('ready')
          })

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
            setErrorMsg(error?.message || 'Error en la pasarela.')
            return true
          })
        } else if (attempts < 30) {
          setTimeout(waitForKR, 300)
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

  if (formState === 'success') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="text-center py-8 space-y-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
          className="w-24 h-24 mx-auto bg-emerald-100 border border-emerald-200 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </motion.div>
        <div>
          <h3 className="text-2xl font-black text-gray-900">¡Pago Exitoso!</h3>
          <p className="text-gray-500 mt-2">Tu pago de <span className="font-bold text-gray-900">${totalUSD.toFixed(2)}</span> ha sido procesado.</p>
        </div>
        <Link href="/miembros"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-blis-red hover:bg-blis-red/90 text-white font-black uppercase text-sm rounded-2xl transition-all shadow-[0_0_30px_rgba(255,30,86,0.3)]">
          <ExternalLink className="w-4 h-4" /> Acceder a Mis Productos
        </Link>
      </motion.div>
    )
  }

  if (formState === 'error') {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 mx-auto bg-red-100 border border-red-200 rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Pago no completado</h3>
        <p className="text-gray-500 text-sm">{errorMsg || 'Error al procesar el pago.'}</p>
        <button onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blis-red hover:bg-blis-red/90 text-white font-bold rounded-xl transition-all">
          <Shield className="w-4 h-4" /> Reintentar Pago
        </button>
      </div>
    )
  }

  return (
    <div className="text-center py-4 space-y-3">
      <div
        className="kr-embedded"
        kr-form-token={formToken}
        kr-public-key={publicKey}
        {...(displayMode === 'popup' ? { 'kr-popin': '' } : {})}
        kr-language="es-ES"
      />

      {formState === 'loading' && (
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-blis-red animate-spin" />
          <p className="text-gray-500 text-sm">Preparando pasarela de pago segura...</p>
        </div>
      )}

      {formState === 'ready' && (
        <p className="text-gray-400 text-xs">
          {displayMode === 'popup'
            ? 'El formulario de pago se abrirá en una ventana emergente.'
            : 'Completa los datos de tu tarjeta para realizar el pago.'}
        </p>
      )}
    </div>
  )
}
