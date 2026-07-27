"use client"

export const dynamic = 'force-dynamic'

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Shield, ArrowLeft, Lock, CreditCard, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/sections/Header"
import { XpandFooter } from "@/components/sections/xpand/XpandFooter"
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
    <main className="min-h-screen bg-[#050505]">
      <Header />
      <div className="max-w-lg mx-auto px-4 pt-40 pb-20">
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/5 animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-36 bg-white/5 rounded-lg animate-pulse" />
              <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-white/[0.04] rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
      <XpandFooter />
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
  const displayMode = (searchParams.get('mode') || 'popup') as 'popup' | 'embedded'

  if (!formToken || !publicKey || !ordenId) {
    return (
      <main className="min-h-screen bg-[#050505]">
        <Header />
        <div className="max-w-lg mx-auto px-4 pt-40 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8 text-center"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <Shield className="w-7 h-7 text-red-400" />
            </div>
            <h2 className="text-xl font-black text-red-400 mb-2">Error de configuración</h2>
            <p className="text-gray-400 text-sm mb-6">Faltan parámetros de pago. Vuelve al checkout e intenta de nuevo.</p>
            <Link href="/tienda/checkout"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold rounded-2xl transition-all">
              <ArrowLeft className="w-4 h-4" /> Volver al checkout
            </Link>
          </motion.div>
        </div>
        <XpandFooter />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050505]">
      <Header />

      <div className="max-w-2xl mx-auto px-4 pt-32 pb-20">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/tienda/checkout"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al checkout
          </Link>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >

          {/* Security Header Bar */}
          <div className="flex items-center gap-3 px-6 py-4 bg-emerald-500/[0.06] border border-emerald-500/10 rounded-t-3xl">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-400">Conexión segura</p>
              <p className="text-[10px] text-emerald-400/60 uppercase tracking-widest">Encriptación SSL · PCI-DSS</p>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-[10px] text-gray-500 font-medium tracking-wider">
              <span>VISA</span>
              <span>MC</span>
              <span>AMEX</span>
              <span>DINERS</span>
              <span>YAPE</span>
              <span>PLIN</span>
            </div>
          </div>

          {/* White Card Body */}
          <div className="bg-white/90 backdrop-blur-xl border-x border-b border-white/20 rounded-b-3xl shadow-[0_20px_80px_rgba(0,0,0,0.5),0_0_60px_rgba(245,225,0,0.05)]">
            <div className="p-6 md:p-10">
              {/* Header */}
              <div className="flex items-start gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blis-red/10 to-blis-red/5 border border-blis-red/20 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-blis-red" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Pago Seguro</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Completa tu pago de <span className="font-bold text-gray-700">${totalUSD.toFixed(2)} USD</span> a través de Izipay
                  </p>
                </div>
              </div>

              {/* Payment Form Component */}
              <CheckoutIzipay
                formToken={formToken}
                publicKey={publicKey}
                ordenId={ordenId}
                totalUSD={totalUSD}
                displayMode={displayMode}
                onSuccess={() => {
                  window.location.href = `/tienda/checkout/status?izipay_success=1&order_id=${ordenId}&total=${totalUSD.toFixed(2)}`
                }}
                onError={(msg) => showToast(msg, 'error')}
              />
            </div>

            {/* Footer: card brands on mobile */}
            <div className="sm:hidden px-6 pb-6 flex items-center justify-center gap-3 opacity-40">
              <img src="/icons/brands/visa.svg" alt="Visa" className="h-4 w-auto opacity-50" />
              <img src="/icons/brands/mastercard.svg" alt="Mastercard" className="h-4 w-auto opacity-50" />
              <img src="/icons/brands/amex.svg" alt="Amex" className="h-4 w-auto opacity-50" />
              <img src="/icons/brands/diners-club.svg" alt="Diners" className="h-4 w-auto opacity-50" />
            </div>
          </div>
        </motion.div>

        {/* Trust footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-600"
        >
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> PCI-DSS Certified
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> SSL Encriptado
          </span>
          <span>Powered by Izipay / Micuentaveb</span>
        </motion.div>
      </div>

      <XpandFooter />
    </main>
  )
}

