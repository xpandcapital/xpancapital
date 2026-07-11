"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

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
    <section className="relative bg-[#0a0a0a] py-20 md:py-28">
      <div className="relative max-w-2xl mx-auto px-4 md:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 md:mb-16">
          <span className="text-[#d5c108] text-xs md:text-sm font-semibold tracking-widest uppercase">FAQ</span>
          <h2 className="text-2xl md:text-5xl font-bold mt-2 md:mt-3 mb-3 md:mb-4">Preguntas Frecuentes</h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 p-4 md:p-5 text-left">
                <span className="text-sm md:text-base font-medium pr-4">{faq.q}</span>
                <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0">
                  <ChevronDown className="w-5 h-5 text-[#d5c108]" />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <p className="px-4 md:px-5 pb-4 md:pb-5 text-sm text-white/50 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
