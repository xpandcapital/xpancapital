"use client"

import { motion } from "framer-motion"
import { BookOpen, LineChart, Brain, Shield, Target } from "lucide-react"

const stages = [
  { icon: BookOpen, title: "Fundamentos", desc: "Conceptos clave del mercado Forex, pares de divisas y terminología esencial." },
  { icon: LineChart, title: "Análisis Técnico", desc: "Velas japonesas, soportes, resistencias, indicadores y patrones de precio." },
  { icon: Brain, title: "Psicología", desc: "Control emocional, disciplina y mentalidad del trader profesional." },
  { icon: Shield, title: "Gestión de Riesgo", desc: "Tamaño de lote, stop loss, risk/reward ratio y protección del capital." },
  { icon: Target, title: "Consistencia", desc: "Ejecución impecable, journaling y mejora continua para resultados estables." },
]

export function Roadmap() {
  return (
    <section className="relative bg-[#fafaf8] py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/15 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(213,193,8,0.07)_0%,transparent_60%)]" />

      <div className="relative max-w-5xl mx-auto px-4 md:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 md:mb-16">
          <span className="text-[#8f8200] text-xs md:text-sm font-semibold tracking-widest uppercase">Tu Camino</span>
          <h2 className="text-2xl md:text-5xl font-bold mt-2 md:mt-3 mb-3 md:mb-4 text-zinc-900">Roadmap del Trader</h2>
          <p className="text-zinc-600 text-sm md:text-base max-w-xl mx-auto">Cinco etapas que te llevarán de principiante a trader consistente.</p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-px bg-zinc-200 md:-translate-x-px" />

          {stages.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative flex items-start gap-4 md:gap-8 mb-10 md:mb-14 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
            >
              <div className="relative z-10 flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border-2 border-[#d5c108] shadow-[0_0_12px_rgba(213,193,8,0.25)] flex items-center justify-center">
                <s.icon className="w-4 h-4 md:w-5 md:h-5 text-[#8f8200]" />
              </div>

              <div className={`flex-1 md:w-1/2 ${i % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12"}`}>
                <div className="bg-white border border-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-xl p-4 md:p-6 hover:border-[#d5c108]/70 hover:shadow-[0_8px_25px_rgba(213,193,8,0.15)] transition-all">
                  <span className="text-[#8f8200] text-xs font-mono">Etapa {i + 1}</span>
                  <h3 className="text-lg md:text-xl font-bold mt-1 mb-2 text-zinc-900">{s.title}</h3>
                  <p className="text-zinc-600 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
