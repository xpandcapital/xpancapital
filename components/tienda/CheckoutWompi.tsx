"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Loader2, AlertCircle, Shield, Lock, CheckCircle2 } from "lucide-react"

declare global { interface Window { WidgetCheckout: any } }

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
  const amountFormatted = (amountInCents / 100).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })

  useEffect(() => {
    if (initializedRef.current || typeof window === 'undefined') return
    initializedRef.current = true

    const loadWidget = async () => {
      try {
        // Cargar script del widget si no existe
        if (!document.querySelector('script[src*="checkout.wompi.co/widget.js"]')) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://checkout.wompi.co/widget.js'
            script.setAttribute('data-render', '#' + containerRef.current?.id)
            script.onload = () => resolve()
            script.onerror = () => reject(new Error('No se pudo cargar el widget'))
            document.head.appendChild(script)
          })
        }

        // Crear widget — se auto-renderiza en el container
        new window.WidgetCheckout({
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
                setErrorMsg(data.error || 'Error al confirmar')
                onError?.(data.error || 'Error al confirmar')
              }
            }).catch(() => {
              setFormState('error')
              setErrorMsg('Error de conexión')
            })
          },
          onError: (err: any) => {
            setFormState('error')
            setErrorMsg(err?.message || 'Error en el pago')
            onError?.(err?.message || 'Error en el pago')
          },
          onClose: () => {
            if (formState !== 'success' && formState !== 'processing') {
              setFormState('ready')
            }
          },
        })

        // Widget creado — el botón de pago ya se renderizó en el container
        setFormState('ready')
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
      <div className="flex items-center justify-center gap-4 py-3 px-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
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
        <p className="text-gray-600 text-[10px] mt-1">Ref: {reference}</p>
      </div>

      {/* Widget container */}
      <div className="space-y-3">
        <div
          ref={containerRef}
          id={`wompi-widget-${reference}`}
          className="min-h-[120px] flex items-center justify-center bg-zinc-800/30 border border-white/5 rounded-2xl"
        >
          {formState === 'loading' && (
            <div className="text-center py-6">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto mb-2" />
              <p className="text-gray-500 text-xs">Cargando pasarela...</p>
            </div>
          )}

          {formState === 'error' && (
            <div className="text-center py-6 px-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-red-400 font-bold text-sm mb-1">Error</p>
              <p className="text-gray-400 text-xs max-w-xs mx-auto">{errorMsg}</p>
              <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-colors">
                Reintentar
              </button>
            </div>
          )}

          {formState === 'processing' && (
            <div className="text-center py-6">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto mb-2" />
              <p className="text-gray-300 text-xs">Confirmando pago...</p>
            </div>
          )}

          {formState === 'success' && (
            <div className="text-center py-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-emerald-400 font-bold">¡Pago exitoso!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
