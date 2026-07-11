"use client"

import { motion } from "framer-motion"
import { Monitor, Code, Calculator, BookOpen, Calendar } from "lucide-react"

const tools = [
  { icon: Monitor, title: "MetaTrader Templates", desc: "Templates pre-configurados con indicadores profesionales listos para usar en MT4/MT5." },
  { icon: Code, title: "TradingView Scripts", desc: "Indicadores personalizados y alertas automatizadas en Pine Script para trading de precisión." },
  { icon: Calculator, title: "Calculadora de Riesgo", desc: "Calcula el tamaño de lote ideal según tu capital, % de riesgo y stop loss en pips." },
  { icon: BookOpen, title: "Diario de Trading", desc: "Plantilla descargable de journaling para registrar y analizar cada operación." },
  { icon: Calendar, title: "Calendario Económico", desc: "Noticias de alto impacto, horarios y previsiones para anticipar movimientos del mercado." },
]

export function Tools() {
  return (
    <section className="relative bg-[#050505] py-20 md:py-28">
      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 md:mb-16">
          <span className="text-[#d5c108] text-xs md:text-sm font-semibold tracking-widest uppercase">Recursos</span>
          <h2 className="text-2xl md:text-5xl font-bold mt-2 md:mt-3 mb-3 md:mb-4">Herramientas Profesionales</h2>
          <p className="text-white/50 text-sm md:text-base max-w-xl mx-auto">Todo lo que necesitas para operar como un profesional.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {tools.map((t, i) => (
            <motion.div key={t.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="group bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-xl p-5 md:p-6 hover:border-[#d5c108]/40 hover:shadow-[0_0_20px_rgba(213,193,8,0.08)] transition-all duration-500"
            >
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-[#d5c108]/10 flex items-center justify-center mb-4 group-hover:bg-[#d5c108]/20 transition-colors">
                <t.icon className="w-5 h-5 md:w-5 md:h-5 text-[#d5c108]" />
              </div>
              <h3 className="text-base md:text-lg font-bold mb-2">{t.title}</h3>
              <p className="text-white/45 text-sm leading-relaxed">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
