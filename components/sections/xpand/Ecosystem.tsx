"use client"

import { motion } from "framer-motion"
import { BookOpen, Shield, Headphones, Users } from "lucide-react"

const cards = [
  {
    icon: BookOpen,
    title: "Micro-Learning y Clases en Vivo",
    desc: "Cursos de 2 horas en píldoras de 10 minutos con interacción en vivo. Aprende a tu ritmo sin perder la conexión humana.",
    size: "lg",
  },
  {
    icon: Shield,
    title: "Tecnología y Rendimientos",
    desc: "Gestión segura del capital con retornos confiables respaldados por estrategias probadas en el mercado real.",
    size: "md",
  },
  {
    icon: Headphones,
    title: "Mentorías 24/7",
    desc: "Videollamadas en vivo y feedback constante de traders experimentados. Nunca estarás solo en tu camino.",
    size: "md",
  },
  {
    icon: Users,
    title: "Comunidad de Expertos",
    desc: "Traders activos respaldando cada decisión. Una red de profesionales que comparten análisis, señales y estrategias en tiempo real.",
    size: "wide",
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
}

export function Ecosystem() {
  return (
    <section id="ecosistema" className="relative bg-[#050505] py-24 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(213,193,8,0.04)_0%,transparent_60%)]" />

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#d5c108] text-sm font-semibold tracking-widest uppercase">
            Ecosistema Xpand
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">
            Todo lo que necesitas en un solo lugar
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            Una plataforma integral diseñada para transformar tu comprensión del
            mercado financiero.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
          {cards.map((card, i) => {
            const Icon = card.icon
            const sizeClasses =
              card.size === "lg"
                ? "lg:row-span-2"
                : card.size === "wide"
                  ? "lg:col-span-2"
                  : ""

            return (
              <motion.div
                key={card.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={cardVariants}
                className={`group relative bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8 hover:border-[#d5c108]/40 hover:shadow-[0_0_20px_rgba(213,193,8,0.1)] transition-all duration-500 ${sizeClasses} flex flex-col justify-between`}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#d5c108]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-[#d5c108]/10 flex items-center justify-center mb-5 group-hover:bg-[#d5c108]/20 transition-colors">
                    <Icon className="w-6 h-6 text-[#d5c108]" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-3">{card.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
