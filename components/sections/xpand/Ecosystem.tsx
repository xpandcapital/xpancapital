"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { Award, Cpu, TrendingUp, Users } from "lucide-react"

const cards = [
  {
    icon: Award,
    title: "Experiencia Comprobada",
    desc: "Nuestra trayectoria nos respalda. Durante más de una década hemos ayudado a inversionistas y estudiantes a alcanzar sus metas financieras con estrategias efectivas y probadas.",
    size: "lg",
  },
  {
    icon: Cpu,
    title: "Metodología Innovadora",
    desc: "Integramos tecnología avanzada y técnicas pedagógicas modernas para ofrecerte un sistema educativo único, desde lo básico hasta estrategias de trading avanzadas.",
    size: "md",
  },
  {
    icon: TrendingUp,
    title: "Rendimientos Garantizados",
    desc: "Nuestro modelo de inversión combina seguridad y rentabilidad, entregando retornos confiables que protegen y hacen crecer tu capital.",
    size: "md",
  },
  {
    icon: Users,
    title: "Comunidad de Expertos",
    desc: "Formarás parte de una comunidad activa de traders, inversionistas y mentores que te guiarán y respaldarán en cada decisión, ayudándote a avanzar con confianza.",
    size: "wide",
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: i * 0.12, duration: 0.7, ease: "easeOut" as const },
  }),
}

const titleWords = "¿Por qué aprender en Xpand Capital?".split(" ")

function SpotlightCard({
  card,
  index,
  sizeClasses,
}: {
  card: (typeof cards)[0]
  index: number
  sizeClasses: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const Icon = card.icon

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`)
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`)
  }

  return (
    <motion.div
      ref={ref}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={cardVariants}
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      className={`group relative bg-white border border-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-2xl p-6 md:p-8 hover:border-[#e8c600]/70 hover:shadow-[0_12px_35px_rgba(232,198,0,0.18)] transition-all duration-500 ${sizeClasses} flex flex-col justify-between overflow-hidden`}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 md:group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(220px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(232,198,0,0.14), transparent 70%)",
        }}
      />
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#e8c600]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-[#e8c600]/15 flex items-center justify-center mb-5 group-hover:bg-[#e8c600]/30 group-hover:scale-110 transition-all duration-300">
          <Icon className="w-6 h-6 text-[#c4a500]" />
        </div>
        <h3 className="text-lg md:text-xl font-bold mb-3 text-zinc-900">{card.title}</h3>
        <p className="text-zinc-600 text-sm leading-relaxed">{card.desc}</p>
      </div>
    </motion.div>
  )
}

export function Ecosystem() {
  return (
    <section id="ecosistema" className="relative bg-[#fafaf8] py-24 md:py-32">
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/15 to-transparent" />
      <div className="absolute inset-0 texture-topo-light pointer-events-none" />
      <div className="absolute inset-0 texture-dots-light pointer-events-none" />
      <div className="absolute inset-0 texture-grain-light pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(232,198,0,0.09)_0%,transparent_55%)]" />

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#c4a500] text-sm font-semibold tracking-widest uppercase">
            La Diferencia Xpand
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4 text-zinc-900">
            {titleWords.map((word, i) => (
              <motion.span
                key={`${word}-${i}`}
                initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.5 }}
                className={`inline-block mr-[0.28em] ${
                  word === "Xpand" || word === "Capital?" ? "text-[#b09600]" : ""
                }`}
              >
                {word}
              </motion.span>
            ))}
          </h2>
          <p className="text-zinc-600 max-w-xl mx-auto">
            Combinamos educación de excelencia con oportunidades de inversión
            segura para ayudarte a alcanzar tus metas financieras.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
          {cards.map((card, i) => {
            const sizeClasses =
              card.size === "lg"
                ? "lg:row-span-2"
                : card.size === "wide"
                  ? "lg:col-span-2"
                  : ""

            return (
              <SpotlightCard
                key={card.title}
                card={card}
                index={i}
                sizeClasses={sizeClasses}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
