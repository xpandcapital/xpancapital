"use client"

import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Suspense } from "react"
import { ArrowLeft, Check, Zap, Crown, ArrowRight } from "lucide-react"
import Link from "next/link"

const plans = {
  trimestral: { name: "Plan Trimestral", icon: Zap, price: "115", period: "cada 4 meses", total: "$345 al año" },
  anual: { name: "Plan Anual", icon: Crown, price: "300", period: "pago único", total: "$300 al año" },
}

function PlanCheckoutInner() {
  const params = useSearchParams()
  const plan = params.get("plan") || "anual"
  const data = plans[plan as keyof typeof plans] || plans.anual

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link href="/#pricing" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-8 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver a planes
        </Link>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <data.icon className="w-6 h-6 text-[#d5c108]" />
            <h1 className="text-xl font-bold">{data.name}</h1>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-[#d5c108]">${data.price}</span>
              <span className="text-white/30 text-sm">/{data.period}</span>
            </div>
            <p className="text-white/20 text-xs mt-1">{data.total}</p>
          </div>

          <div className="space-y-3 mb-8 text-sm text-white/50">
            {["Acceso completo a cursos", "Señales de trading diarias", "Mentorías en vivo", "Comunidad VIP"].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#d5c108] shrink-0" />
                {f}
              </div>
            ))}
          </div>

          <Link
            href="https://wa.me/?text=Hola%20Xpand%20Capital%2C%20quiero%20adquirir%20el%20${encodeURIComponent(data.name)}"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full bg-[#d5c108] text-black font-bold py-4 rounded-xl hover:bg-[#e5d100] transition-all"
          >
            Comprar por WhatsApp
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="text-center text-[10px] text-white/15 mt-4">
            Serás redirigido a WhatsApp para completar tu inscripción
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function PlanCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
      <PlanCheckoutInner />
    </Suspense>
  )
}
