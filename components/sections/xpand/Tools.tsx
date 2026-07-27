"use client"

import { motion } from "framer-motion"
import { Monitor, Code, Calculator, BookOpen, Calendar } from "lucide-react"

const tools = [
  { icon: Monitor, title: "MetaTrader Templates", desc: "Templates pre-configurados con indicadores profesionales listos para usar en MT4/MT5. Incluye medias móviles exponenciales, RSI estocástico, y bandas de Bollinger calibradas para timeframes de 15min a 4H. Solo arrastra y suelta el archivo .tpl en tu carpeta de plantillas." },
  { icon: Code, title: "TradingView Scripts", desc: "Colección de indicadores personalizados en Pine Script v5 para análisis de precisión. Incluye detector de FVG (Fair Value Gaps), scanner de Order Blocks, alertas automáticas por Telegram, y heatmap de sesiones. Código fuente comentado para que aprendas a modificarlos." },
  { icon: Calculator, title: "Calculadora de Riesgo", desc: "Determina el tamaño de lote exacto según tu capital, porcentaje de riesgo (1-2% recomendado) y distancia del stop loss en pips. Calcula automáticamente el valor del pip según el par de divisas y te muestra el riesgo en USD antes de entrar a la operación." },
  { icon: BookOpen, title: "Diario de Trading", desc: "Plantilla descargable en Excel y Notion para registrar cada operación con fecha, par, entrada, salida, pips, resultado y captura de pantalla. Incluye gráficos automáticos de rendimiento mensual, win rate por sesión y análisis de errores recurrentes." },
  { icon: Calendar, title: "Calendario Económico", desc: "Noticias de alto impacto con horarios en GMT-5, previsión vs dato real, e impacto estimado en pares específicos. Filtra por divisa (USD, EUR, GBP) y nivel de impacto para anticipar volatilidad. Se actualiza semanalmente con datos de fuentes institucionales." },
]

export function Tools() {
  return (
    <section id="recursos" className="relative bg-[#fafaf8] py-20 md:py-28">
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/15 to-transparent" />
      <div className="absolute inset-0 texture-topo-light pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(232,198,0,0.09)_0%,transparent_55%)]" />
      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 md:mb-16">
          <span className="text-[#c4a500] text-xs md:text-sm font-semibold tracking-widest uppercase">Recursos</span>
          <h2 className="text-2xl md:text-5xl font-bold mt-2 md:mt-3 mb-3 md:mb-4 text-zinc-900">Herramientas Profesionales</h2>
          <p className="text-zinc-600 text-sm md:text-base max-w-xl mx-auto">Todo lo que necesitas para operar como un profesional.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {tools.map((t, i) => (
            <motion.div key={t.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="group bg-white border border-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-xl p-5 md:p-6 hover:border-[#e8c600]/70 hover:shadow-[0_8px_25px_rgba(232,198,0,0.15)] transition-all duration-500"
            >
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-[#e8c600]/15 flex items-center justify-center mb-4 group-hover:bg-[#e8c600]/30 transition-colors">
                <t.icon className="w-5 h-5 md:w-5 md:h-5 text-[#c4a500]" />
              </div>
              <h3 className="text-base md:text-lg font-bold mb-2 text-zinc-900">{t.title}</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
