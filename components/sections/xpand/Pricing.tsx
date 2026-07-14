"use client"

import { motion } from "framer-motion"
import { Check, Zap, Crown, ArrowRight } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Plan Trimestral",
    icon: Zap,
    price: "115",
    period: "cada 4 meses",
    total: "$345 al año",
    breakdown: "3 pagos de $115",
    features: ["Cursos completos 24/7", "Señales de trading diarias", "Mentorías grupales semanales", "Comunidad VIP en Telegram", "Acceso al calendario económico", "Soporte prioritario"],
    cta: "Elegir Trimestral",
    highlight: false,
  },
  {
    name: "Plan Anual",
    icon: Crown,
    price: "300",
    period: "pago único anual",
    total: "$300 al año",
    breakdown: "1 solo pago",
    features: ["Todo lo del Plan Trimestral", "2 Mentorías 1:1 con Hebed", "Acceso anticipado a nuevos cursos", "Señales en tiempo real优先", "Análisis personalizado de cartera", "Certificado de finalización"],
    cta: "Elegir Anual",
    highlight: true,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="relative bg-[#0a0a0a] py-20 md:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(213,193,8,0.04)_0%,transparent_70%)]" />

      <div className="relative max-w-4xl mx-auto px-4 md:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 md:mb-16">
          <span className="text-[#d5c108] text-xs md:text-sm font-semibold tracking-widest uppercase">Planes</span>
          <h2 className="text-2xl md:text-5xl font-bold mt-2 md:mt-3 mb-3 md:mb-4">Invierte en tu educación</h2>
          <p className="text-white/50 text-sm md:text-base max-w-xl mx-auto">Elige el plan que mejor se adapte a tus objetivos.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className={`relative group bg-white/[0.03] backdrop-blur-md border rounded-2xl p-6 md:p-8 flex flex-col transition-all duration-500 hover:shadow-[0_0_25px_rgba(213,193,8,0.15)] ${
                plan.highlight ? "border-[#d5c108]/50 shadow-[0_0_15px_rgba(213,193,8,0.12)]" : "border-white/5 hover:border-white/10"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#d5c108] text-black text-xs font-bold rounded-full">MEJOR VALOR</div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${plan.highlight ? "bg-[#d5c108]/15" : "bg-white/5"}`}>
                  <plan.icon className={`w-5 h-5 md:w-6 md:h-6 ${plan.highlight ? "text-[#d5c108]" : "text-white/50"}`} />
                </div>
                <h3 className="text-lg md:text-xl font-bold">{plan.name}</h3>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl md:text-5xl font-black text-[#d5c108]">${plan.price}</span>
                  <span className="text-white/30 text-sm">/{plan.period}</span>
                </div>
                <p className="text-white/20 text-xs mt-1">{plan.total} — {plan.breakdown}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 md:gap-3 text-sm text-white/60">
                    <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlight ? "text-[#d5c108]" : "text-white/20"}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/tienda/checkout"
                className={`group flex items-center justify-center gap-2 w-full py-3 md:py-4 rounded-xl font-bold text-sm md:text-base transition-all ${
                  plan.highlight
                    ? "bg-[#d5c108] text-black hover:bg-[#e5d100] hover:shadow-[0_0_30px_rgba(213,193,8,0.4)]"
                    : "border border-white/20 text-white hover:border-[#d5c108]/50 hover:text-[#d5c108]"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-[10px] md:text-xs text-white/15 mt-8 max-w-md mx-auto">El trading conlleva riesgos. Infórmate adecuadamente antes de invertir.</p>
      </div>
    </section>
  )
}
