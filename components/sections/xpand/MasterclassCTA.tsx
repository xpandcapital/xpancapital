"use client"

import { motion } from "framer-motion"
import { Check, Zap, ArrowRight, Terminal } from "lucide-react"
import Link from "next/link"

const bullets = [
  "Fundamentos de Forex desde cero",
  "Uso profesional de MetaTrader y TradingView",
  "Gestión de riesgo institucional",
  "Psicología del trader avanzada",
  "Acceso a señales y análisis en vivo",
]

export function MasterclassCTA() {
  return (
    <section className="relative bg-[#0a0a0a] py-24 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(213,193,8,0.05)_0%,transparent_70%)]" />

      <div className="relative max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-[#d5c108]/40 via-[#d5c108]/10 to-transparent blur-sm" />
          <div className="relative bg-[#050505] border border-[#d5c108]/20 rounded-3xl p-8 md:p-12">
            <div className="flex items-center gap-2 text-[#d5c108]/60 text-xs font-mono mb-6">
              <Terminal className="w-3.5 h-3.5" />
              <span>xpand-terminal ~ masterclass</span>
            </div>

            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="text-[#d5c108] text-sm font-semibold tracking-widest uppercase">
                  Oferta Exclusiva
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-6 leading-tight">
                  MASTERCLASS GRATUITA
                  <span className="block text-[#d5c108]">
                    El Camino al Éxito Financiero
                  </span>
                </h2>

                <ul className="space-y-3 mb-8">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-white/70">
                      <Check className="w-5 h-5 text-[#d5c108] shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className="group inline-flex items-center gap-3 bg-[#d5c108] text-black font-bold px-10 py-5 rounded-xl text-lg hover:bg-[#e5d100] transition-all hover:shadow-[0_0_40px_rgba(213,193,8,0.4)] hover:scale-[1.02]"
                >
                  <Zap className="w-5 h-5" />
                  Reserva tu lugar ahora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <p className="text-white/30 text-xs mt-3">Suscripción Anual Disponible</p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="hidden md:block"
              >
                <div className="relative aspect-square rounded-2xl bg-[#d5c108]/5 border border-[#d5c108]/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-7xl font-black text-[#d5c108]/20 mb-2">
                      100%
                    </div>
                    <p className="text-[#d5c108]/50 font-mono text-sm">GRATIS</p>
                    <p className="text-white/20 text-xs mt-2">Acceso inmediato</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
