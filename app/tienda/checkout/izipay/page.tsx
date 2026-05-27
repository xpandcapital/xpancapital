"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/sections/Header"
import { FooterSections } from "@/components/sections/Footer"
import { CheckoutIzipay } from "@/components/tienda/CheckoutIzipay"
import { useToast } from "@/components/ui/Toast"

export default function IzipayPage() {
  return (
    <Suspense fallback={<IzipayLoading />}>
      <IzipayContent />
    </Suspense>
  )
}

function IzipayLoading() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Header />
      <div className="max-w-2xl mx-auto px-4 pt-40 pb-20">
        <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-3xl p-8 animate-pulse">
          <div className="h-8 w-48 bg-white/10 rounded mb-4" />
          <div className="h-4 w-64 bg-white/10 rounded mb-6" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      <FooterSections />
    </main>
  )
}

function IzipayContent() {
  const searchParams = useSearchParams()
  const { showToast } = useToast()

  const formToken = searchParams.get('form_token') || ''
  const publicKey = searchParams.get('public_key') || ''
  const ordenId = searchParams.get('order_id') || ''
  const totalUSD = parseFloat(searchParams.get('total') || '0')

  if (!formToken || !publicKey || !ordenId) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <Header />
        <div className="max-w-xl mx-auto px-4 pt-40 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 border border-red-500/20 rounded-3xl p-8"
          >
            <h2 className="text-xl font-black text-red-400 mb-2">Error de configuración</h2>
            <p className="text-gray-400 text-sm mb-6">Faltan parámetros de pago. Vuelve al checkout e intenta de nuevo.</p>
            <Link href="/tienda/checkout" className="text-blis-red hover:underline font-bold">
              Volver al checkout
            </Link>
          </motion.div>
        </div>
        <FooterSections />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Header />

      <div className="max-w-2xl mx-auto px-4 pt-32 pb-20">
        <Link
          href="/tienda/checkout"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al checkout
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_0_60px_rgba(255,30,86,0.08)] overflow-hidden"
        >
          <div className="p-6 md:p-8 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Pago Seguro</h2>
                <p className="text-xs text-gray-500">PCI-DSS Certified · Encriptación SSL</p>
              </div>
            </div>

            <CheckoutIzipay
              formToken={formToken}
              publicKey={publicKey}
              ordenId={ordenId}
              totalUSD={totalUSD}
              onSuccess={() => {
                showToast('¡Pago procesado con éxito!', 'success')
              }}
              onError={(msg) => {
                showToast(msg, 'error')
              }}
            />
          </div>

          <div className="px-6 md:px-8 py-4 flex items-center justify-center gap-3 opacity-40">
            <span className="text-xs text-gray-500 font-medium">Aceptamos:</span>
            <span className="text-xs text-gray-600 font-bold tracking-wider">VISA</span>
            <span className="text-xs text-gray-600 font-bold tracking-wider">MC</span>
            <span className="text-xs text-gray-600 font-bold tracking-wider">AMEX</span>
            <span className="text-xs text-gray-600 font-bold tracking-wider">DINERS</span>
            <span className="text-xs text-gray-600 font-bold tracking-wider">YAPE</span>
            <span className="text-xs text-gray-600 font-bold tracking-wider">PLIN</span>
          </div>
        </motion.div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Tus datos de pago son procesados de forma segura por Izipay / Micuentaveb.
          No almacenamos información sensible de tu tarjeta.
        </p>
      </div>

      <FooterSections />
    </main>
  )
}
