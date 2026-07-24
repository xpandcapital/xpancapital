"use client"

import { useEffect, useState, useRef } from "react"
import { Loader2, AlertCircle, Shield, Lock, CheckCircle2 } from "lucide-react"

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
    if (initializedRef.current || typeof window === 'undefined' || !containerRef.current) return
    initializedRef.current = true

    try {
      // Limpiar scripts anteriores del widget
      document.querySelectorAll('script[src*="checkout.wompi.co/widget.js"]').forEach(s => s.remove())

      const script = document.createElement('script')
      script.src = 'https://checkout.wompi.co/widget.js'
      script.setAttribute('data-render', 'BUTTON')
      script.setAttribute('data-public-key', publicKey)
      script.setAttribute('data-currency', currency)
      script.setAttribute('data-amount-in-cents', String(amountInCents))
      script.setAttribute('data-reference', reference)
      script.setAttribute('data-redirect-url', redirectUrl)

      script.onload = () => setFormState('ready')
      script.onerror = () => { setFormState('error'); setErrorMsg('No se pudo cargar la pasarela') }

      containerRef.current.innerHTML = ''
      containerRef.current.appendChild(script)

      // Escuchar evento de aprobación de Wompi (vía postMessage)
      const handler = async (e: MessageEvent) => {
        if (e.data?.type === 'WOMPI_PAYMENT_APPROVED' || e.data?.transactionId) {
          setFormState('processing')
          try {
            const res = await fetch('/api/wompi-confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ordenId }),
            })
            const data = await res.json()
            if (data.success) {
              setFormState('success')
              onSuccess?.()
            }
          } catch {
            // El redirect lo maneja Wompi
          }
        }
      }
      window.addEventListener('message', handler)
      return () => window.removeEventListener('message', handler)
    } catch (err: any) {
      setFormState('error')
      setErrorMsg(err.message || 'Error al cargar')
    }
  }, [publicKey, reference, amountInCents, currency, ordenId, redirectUrl])

  return (
    <div className="space-y-4">
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

      <div className="text-center py-2">
        <p className="text-gray-500 text-xs uppercase tracking-wider">Total a pagar</p>
        <p className="text-white font-black text-2xl md:text-3xl">{amountFormatted}</p>
        <p className="text-gray-600 text-[10px] mt-1">Ref: {reference}</p>
      </div>

      <div ref={containerRef} id={`wompi-container-${reference}`} className="min-h-[120px] flex flex-col items-center justify-center bg-zinc-800/30 border border-white/5 rounded-2xl p-4">
        {formState === 'loading' && (
          <div className="text-center py-6">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto mb-2" />
            <p className="text-gray-500 text-xs">Cargando pasarela...</p>
          </div>
        )}

        {formState === 'error' && (
          <div className="text-center py-6">
            <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-red-400 text-sm font-bold mb-1">Error</p>
            <p className="text-gray-400 text-xs">{errorMsg}</p>
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
  )
}
