"use client"

import { motion } from "framer-motion"
import { Play } from "lucide-react"

const videos = [
  { title: "Análisis EUR/USD — Sesión London", duration: "12:34" },
  { title: "Estrategia de Scalping en M5", duration: "08:15" },
  { title: "Cómo usar Order Blocks correctamente", duration: "15:42" },
  { title: "Gestión de Riesgo Avanzada", duration: "10:08" },
]

export function VideoPreviews() {
  return (
    <section className="relative bg-[#050505] py-20 md:py-28">
      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 md:mb-16">
          <span className="text-[#d5c108] text-xs md:text-sm font-semibold tracking-widest uppercase">Sala de Análisis</span>
          <h2 className="text-2xl md:text-5xl font-bold mt-2 md:mt-3 mb-3 md:mb-4">Contenido Exclusivo</h2>
          <p className="text-white/50 text-sm md:text-base max-w-xl mx-auto">Análisis semanales y estrategias en video, directo desde el mercado.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {videos.map((v, i) => (
            <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="group relative aspect-video rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden cursor-pointer hover:border-[#d5c108]/40 hover:shadow-[0_0_20px_rgba(213,193,8,0.1)] transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#d5c108]/20 border border-[#d5c108]/40 flex items-center justify-center group-hover:bg-[#d5c108]/40 group-hover:scale-110 transition-all duration-300">
                  <Play className="w-5 h-5 md:w-6 md:h-6 text-[#d5c108] ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                <h3 className="text-white/80 text-xs md:text-sm font-medium leading-snug mb-1">{v.title}</h3>
                <span className="text-white/25 text-[10px] md:text-xs font-mono">{v.duration}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
