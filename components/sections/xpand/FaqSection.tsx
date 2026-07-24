"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, MessageCircle, Sparkles } from "lucide-react"

const faqs = [
  { q: "¿Cuánto dinero necesito para empezar en Forex?", a: "Puedes comenzar con tan solo $50 USD en una cuenta demo o $100 en cuenta real. Lo importante no es el capital inicial sino la educación y disciplina para hacerlo crecer." },
  { q: "¿Es seguro operar en el mercado de divisas?", a: "Sí, el mercado Forex está regulado globalmente. La seguridad depende de operar con brókers regulados y aplicar siempre una gestión de riesgo adecuada." },
  { q: "¿Cuánto tiempo toma volverse rentable?", a: "Depende de tu dedicación. Con nuestro método, los estudiantes comienzan a ver consistencia entre 3 y 6 meses de práctica disciplinada." },
  { q: "¿Qué necesito para tomar las clases?", a: "Solo necesitas un dispositivo con internet (celular, tablet o computadora) y muchas ganas de aprender. Todo el contenido está en nuestra plataforma." },
  { q: "¿Ofrecen señales de trading?", a: "Sí. Los planes incluyen señales diarias con puntos de entrada, stop loss y take profit. También enseñamos a generar tus propias señales." },
  { q: "¿Puedo operar desde mi celular?", a: "Absolutamente. MetaTrader y TradingView tienen apps móviles. Nuestra plataforma de aprendizaje también es 100% responsive." },
]

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="relative bg-[#0b0a00] py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 texture-topo-dark pointer-events-none opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,198,0,0.14)_0%,transparent_60%)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#e8c600]/[0.06] blur-[150px]" />

      <div className="relative max-w-2xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#e8c600]/50 bg-[#e8c600]/10 mb-5"
          >
            <Sparkles className="w-4 h-4 text-[#e8c600]" />
            <span className="text-[#e8c600] text-xs md:text-sm font-bold tracking-widest uppercase">FAQ</span>
            <MessageCircle className="w-4 h-4 text-[#e8c600]" />
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold text-center">
            <span className="text-white">Preguntas </span>
            <span className="text-[#e8c600]">Frecuentes</span>
          </h2>
          <p className="text-[#e8c600]/40 text-sm mt-3 max-w-md mx-auto">
            Resolvemos tus dudas sobre trading, educación y nuestra academia
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/[0.03] backdrop-blur-md border border-[#e8c600]/20 rounded-xl overflow-hidden hover:border-[#e8c600]/50 hover:shadow-[0_0_25px_rgba(232,198,0,0.15)] transition-all duration-500"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-4 md:p-5 text-left group"
              >
                <span className={`text-sm md:text-base font-medium pr-4 transition-colors ${
                  open === i ? "text-[#e8c600]" : "text-white/80 group-hover:text-white"
                }`}>
                  {faq.q}
                </span>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    open === i ? "bg-[#e8c600]/20 text-[#e8c600]" : "bg-white/5 text-white/40 group-hover:text-[#e8c600]"
                  }`}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 md:px-5 pb-4 md:pb-5">
                      <div className="pt-3 border-t border-[#e8c600]/10">
                        <p className="text-sm text-white/60 leading-relaxed">{faq.a}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
