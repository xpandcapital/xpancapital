"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Juan Buendía",
    text: "Entré sin saber nada de trading. El módulo de Análisis Técnico me abrió los ojos: aprendí a leer velas japonesas y a identificar zonas de oferta y demanda. Hoy genero ingresos constantes operando en sesión London. ¡Una experiencia que transformó mi vida financiera!",
  },
  {
    name: "Marisol Tanta",
    text: "Empecé desde cero absoluto, sin entender qué era un pip. Las clases de Fundamentos me dieron la base, y las mentorías personalizadas con Hebed me ayudaron a refinar mi estrategia. Ahora me siento segura invirtiendo y ya estoy en mi tercer mes consecutivo en verde.",
  },
  {
    name: "Carlos Londoño",
    text: "Lo que más valoro es el enfoque en psicología del trading. Antes operaba con miedo y cerraba operaciones ganadoras demasiado pronto. El módulo de Psicología me enseñó a controlar mis emociones, y el journaling diario cambió mi disciplina. La estabilidad llega cuando trabajas la mente.",
  },
  {
    name: "Yuliana Guerrero",
    text: "Llevaba años perdiendo dinero por no gestionar el riesgo. El curso de Gestión de Riesgo me enseñó a calcular el tamaño de lote correcto y a respetar el 2% máximo por operación. No solo crecieron mis inversiones: recuperé la confianza en mí misma como trader. Xpand cambió mi forma de ver el mercado.",
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
    <section id="testimonios" className="relative bg-[#fafaf8] py-24 md:py-32">
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/15 to-transparent" />
      <div className="absolute inset-0 texture-topo-light pointer-events-none" />
      <div className="absolute inset-0 texture-grain-light pointer-events-none" />
      <div className="absolute inset-0 texture-dots-light pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(232,198,0,0.09)_0%,transparent_55%)]" />

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#c4a500] text-sm font-semibold tracking-widest uppercase">
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
              className="break-inside-avoid group relative bg-white border border-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-2xl p-6 md:p-8 hover:border-[#e8c600]/70 hover:shadow-[0_10px_30px_rgba(232,198,0,0.15)] transition-all duration-500"
            >
              <Quote className="w-8 h-8 text-[#e8c600]/40 mb-4" />
              <p className="text-zinc-700 text-base leading-relaxed mb-6">{t.text}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e8c600]/20 flex items-center justify-center text-[#c4a500] font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-zinc-900 font-semibold text-sm">{t.name}</p>
                  <div className="flex gap-0.5 mt-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-3 h-3 fill-[#e8c600] text-[#e8c600]" />
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
