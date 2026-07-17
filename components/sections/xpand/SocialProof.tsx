"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Juan Buendía",
    text: "Me ayudó a generar ingresos constantes. ¡Una experiencia transformadora!",
  },
  {
    name: "Marisol Tanta",
    text: "Entendí Forex desde cero y hoy me siento segura invirtiendo.",
  },
  {
    name: "Carlos Londoño",
    text: "La estabilidad nace de la disciplina. Su guía transformó mi manera de ver el dinero.",
  },
  {
    name: "Yuliana Guerrero",
    text: "No solo crecieron mis inversiones, también mi seguridad personal.",
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const },
  }),
}

export function SocialProof() {
  return (
    <section className="relative bg-[#fafaf8] py-24 md:py-32">
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/15 to-transparent" />
      <div className="absolute inset-0 texture-grain-light pointer-events-none" />
      <div className="absolute inset-0 texture-dots-light pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(213,193,8,0.07)_0%,transparent_60%)]" />

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#8f8200] text-sm font-semibold tracking-widest uppercase">
            Social Proof
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4 text-zinc-900">
            Lo que dicen nuestros estudiantes
          </h2>
          <p className="text-zinc-600 max-w-xl mx-auto">
            Historias reales de personas que transformaron su relación con el dinero.
          </p>
        </motion.div>

        <div className="columns-1 md:columns-2 gap-6 space-y-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              className="break-inside-avoid group relative bg-white border border-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-2xl p-6 md:p-8 hover:border-[#d5c108]/70 hover:shadow-[0_10px_30px_rgba(213,193,8,0.15)] transition-all duration-500"
            >
              <Quote className="w-8 h-8 text-[#d5c108]/40 mb-4" />
              <p className="text-zinc-700 text-base leading-relaxed mb-6">{t.text}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#d5c108]/20 flex items-center justify-center text-[#8f8200] font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-zinc-900 font-semibold text-sm">{t.name}</p>
                  <div className="flex gap-0.5 mt-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-3 h-3 fill-[#d5c108] text-[#d5c108]" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
