"use client"

import { motion } from "framer-motion"
import { BookOpen, LineChart, Brain, Shield, Target } from "lucide-react"

const stages = [
  { icon: BookOpen, title: "Fundamentos", desc: "Aprenderás los conceptos clave del mercado Forex: pares de divisas, horarios de sesiones (Londres, NY, Asia), terminología esencial, y cómo funciona el mercado de divisas desde cero. Conocerás MetaTrader y TradingView como plataformas de trading." },
  { icon: LineChart, title: "Análisis Técnico", desc: "Dominarás velas japonesas y sus patrones, soportes y resistencias, líneas de tendencia, indicadores como RSI, MACD y medias móviles. Aprenderás a identificar zonas de oferta y demanda, y a leer la acción del precio en tiempo real." },
  { icon: Brain, title: "Psicología", desc: "Desarrollarás control emocional y disciplina mental. Aprenderás a manejar el miedo, la codicia y la ansiedad al operar. Trabajarás en tu mentalidad de trader profesional, construyendo hábitos que eliminen decisiones impulsivas." },
  { icon: Shield, title: "Gestión de Riesgo", desc: "Calcularás el tamaño de lote ideal según tu capital, definirás stop loss y take profit con criterio técnico, y aplicarás el risk/reward ratio correcto. Protegerás tu cuenta con reglas claras: máximo 1-2% de riesgo por operación." },
  { icon: Target, title: "Consistencia", desc: "Integrarás todo lo aprendido en un plan de trading sólido. Llevarás un journal detallado de cada operación, analizarás tus estadísticas, refinarás tu estrategia y alcanzarás la consistencia que diferencia a un trader rentable de uno que no lo es." },
]

export function Roadmap() {
  return (
    <section id="roadmap" className="relative bg-[#fafaf8] py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/15 to-transparent" />
      <div className="absolute inset-0 texture-topo-light pointer-events-none" />
      <div className="absolute inset-0 texture-grid-light pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(232,198,0,0.09)_0%,transparent_55%)]" />

      <div className="relative max-w-5xl mx-auto px-4 md:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 md:mb-16">
          <span className="text-[#c4a500] text-xs md:text-sm font-semibold tracking-widest uppercase">Tu Camino</span>
          <h2 className="text-2xl md:text-5xl font-bold mt-2 md:mt-3 mb-3 md:mb-4 text-zinc-900">Roadmap del Trader</h2>
          <p className="text-zinc-600 text-sm md:text-base max-w-xl mx-auto">Cinco etapas que te llevarán de principiante a trader consistente.</p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#e8c600]/60 via-[#e8c600]/30 to-[#e8c600]/10 md:-translate-x-1/2" />

          {stages.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative flex items-start mb-10 md:mb-16 ${i % 2 === 0 ? "md:justify-start" : "md:justify-end"}`}
            >
              <div className="relative z-10 flex-shrink-0 w-10 h-10 md:w-14 md:h-14 rounded-full bg-white border-[3px] border-[#e8c600] shadow-[0_0_16px_rgba(232,198,0,0.3)] flex items-center justify-center md:absolute md:left-1/2 md:top-0 md:-translate-x-1/2 ml-3 md:ml-0">
                <s.icon className="w-4 h-4 md:w-5 md:h-5 text-[#c4a500]" />
              </div>

              <div className={`flex-1 ml-12 md:ml-0 md:w-[42%] ${i % 2 === 0 ? "md:text-right md:mr-[8%]" : "md:text-left md:ml-[8%]"}`}>
                <div className="bg-white border border-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-xl p-4 md:p-6 hover:border-[#e8c600]/70 hover:shadow-[0_8px_25px_rgba(232,198,0,0.15)] transition-all">
                  <span className="text-[#c4a500] text-xs font-mono">Etapa {i + 1}</span>
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
