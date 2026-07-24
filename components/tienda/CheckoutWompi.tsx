"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Loader2, CheckCircle2, AlertCircle, Shield, Lock } from "lucide-react"

declare global { interface Window { WompiCheckout: any } }

interface CheckoutWompiProps {
  publicKey: string
  reference: string
  amountInCents: number
  currency: string
  ordenId: string
  redirectUrl: string
  onSuccess?: () => void
  onError?: (msg: string) => void
}

type FormState = 'loading' | 'ready' | 'processing' | 'success' | 'error'

export function CheckoutWompi({ publicKey, reference, amountInCents, currency, ordenId, redirectUrl, onSuccess, onError }: CheckoutWompiProps) {
  const [formState, setFormState] = useState<FormState>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)
  const amountFormatted = (amountInCents / 100).toLocaleString('es-CO', { style: 'currency', currency })

  useEffect(() => {
    if (initializedRef.current || typeof window === 'undefined') return
    initializedRef.current = true

    const loadWidget = async () => {
      try {
        // Cargar script del widget
        if (!document.querySelector('script[src*="checkout.wompi.co/widget.js"]')) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://checkout.wompi.co/widget.js'
            script.setAttribute('data-render', '#' + containerRef.current?.id)
            script.onload = () => resolve()
            script.onerror = () => reject(new Error('No se pudo cargar la pasarela de pago'))
            document.head.appendChild(script)
          })
        }

        setFormState('ready')

        // Renderizar widget
        const checkout = new window.WompiCheckout({
          currency,
          amountInCents,
          reference,
          publicKey,
          redirectUrl,
          onApprove: () => {
            setFormState('processing')
            fetch('/api/wompi-confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ordenId }),
            }).then(async (res) => {
              const data = await res.json()
              if (data.success) {
                setFormState('success')
                onSuccess?.()
              } else {
                setFormState('error')
                setErrorMsg(data.error || 'Error al confirmar el pago')
                onError?.(data.error || 'Error al confirmar el pago')
              }
            }).catch(() => {
              setFormState('error')
              setErrorMsg('Error de conexión al confirmar el pago')
            })
          },
          onLoad: () => setFormState('ready'),
          onError: (err: any) => {
            setFormState('error')
            setErrorMsg(err?.message || 'Error en el pago')
            onError?.(err?.message || 'Error en el pago')
          },
          onClose: () => {
            if (formState !== 'success') {
              setFormState('ready')
            }
          },
        })

        // Montar en el contenedor
        if (containerRef.current) {
          checkout.mount('#' + containerRef.current.id)
        }
      } catch (err: any) {
        setFormState('error')
        setErrorMsg(err.message || 'Error al cargar la pasarela')
      }
    }

    loadWidget()
  }, [])

  return (
    <div className="space-y-4">
      {/* Trust bar */}
      <div className="flex items-center justify-center gap-4 md:gap-8 py-3 px-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
          <Lock className="w-3 h-3" /> SSL Seguro
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
          <Shield className="w-3 h-3" /> PCI-DSS
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-3 h-3" /> Pago Seguro
        </div>
      </div>

      {/* Amount summary */}
      <div className="text-center py-2">
        <p className="text-gray-500 text-xs uppercase tracking-wider">Total a pagar</p>
        <p className="text-white font-black text-2xl md:text-3xl">{amountFormatted}</p>
        <p className="text-gray-600 text-[10px] mt-1">Referencia: {reference}</p>
      </div>

      {/* Widget container */}
      <div className="space-y-3">
        <div ref={containerRef} id={`wompi-widget-${reference}`} className="min-h-[350px] flex items-center justify-center bg-zinc-900/50 border border-white/5 rounded-2xl">
          {(formState === 'loading' || formState === 'ready') && (
            <div className="text-center py-8">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl bg-[#e8c600]/10 border border-[#e8c600]/20 flex items-center justify-center mx-auto mb-4"
              >
                <Loader2 className="w-8 h-8 text-[#e8c600] animate-spin" />
              </motion.div>
              <p className="text-white font-bold text-sm mb-1">Cargando pasarela de pago</p>
              <p className="text-gray-500 text-xs">Serás redirigido al formulario seguro de pago</p>
            </div>
          )}

          {formState === 'error' && (
            <div className="text-center py-8 px-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-red-400 font-bold text-sm mb-2">Error al procesar el pago</p>
              <p className="text-gray-400 text-xs max-w-xs mx-auto">{errorMsg}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Intentar de nuevo
              </button>
            </div>
          )}
        </div>

        {/* Payment methods badge */}
        <div className="flex items-center justify-center gap-3 text-[10px] text-gray-600">
          <span>💳 Tarjetas</span>
          <span>·</span>
          <span>🏦 PSE</span>
          <span>·</span>
          <span>📱 Nequi</span>
          <span>·</span>
          <span>🏛️ Bancolombia</span>
        </div>

        <p className="text-[9px] text-gray-700 text-center">
          Al continuar, aceptas los términos y condiciones. Tus datos están protegidos.
        </p>
      </div>
    </div>
  )
}
