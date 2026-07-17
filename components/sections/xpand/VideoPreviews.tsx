"use client"

import { motion } from "framer-motion"

const videos = [
  {
    id: "7445095892782255415",
    title: "El Secreto de la Vela Seek and Destroy",
    desc: "Descubre los secretos de la manipulación del precio en el mercado.",
  },
  {
    id: "7579706355154488587",
    title: "El Origen del Gráfico",
    desc: "Entiende cómo se forma cada vela y qué información revela sobre el mercado.",
  },
  {
    id: "7445310551581838598",
    title: "Gaps de Valor Justo (FVG)",
    desc: "Identifica zonas de liquidez institucional y opera con precisión quirúrgica.",
  },
]

export function VideoPreviews() {
  return (
    <section id="contenido" className="relative bg-[#050505] py-20 md:py-28">
      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 md:mb-16">
          <span className="text-[#d5c108] text-xs md:text-sm font-semibold tracking-widest uppercase">Contenido Exclusivo</span>
          <h2 className="text-2xl md:text-5xl font-bold mt-2 md:mt-3 mb-3 md:mb-4">Aprende con Xpand Capital</h2>
          <p className="text-white/50 text-sm md:text-base max-w-xl mx-auto">Síguenos en TikTok para contenido diario de trading, forex y análisis de mercado.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {videos.map((v, i) => (
            <motion.div key={v.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="relative bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden hover:border-[#d5c108]/30 transition-all duration-500">
                <div className="aspect-[9/16] w-full max-w-[320px] mx-auto">
                  <iframe
                    src={`https://www.tiktok.com/embed/v2/${v.id}`}
                    className="w-full h-full"
                    allow="encrypted-media"
                    title={v.title}
                  />
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="text-white/80 text-xs md:text-sm font-bold mb-1">{v.title}</h3>
                  <p className="text-white/30 text-[10px] md:text-xs leading-relaxed">{v.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
