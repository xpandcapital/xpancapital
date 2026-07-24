"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { GraduationCap, Landmark, Check, ArrowRight } from "lucide-react"
import Link from "next/link"

const services = [
  {
    number: "01",
    icon: GraduationCap,
    tag: "Aprende",
    title: "Educación Financiera",
    desc: "Desde lo básico hasta lo avanzado, aprende a dominar los mercados financieros con mentorías personalizadas.",
    bullets: [
      "Gestión de riesgos",
      "Análisis técnico y fundamental",
      "Psicología del trading",
      "Mentorías personalizadas",
    ],
    cta: "Empieza a aprender",
    href: "#pricing",
  },
  {
    number: "02",
    icon: Landmark,
    tag: "Invierte",
    title: "Inversión Financiera",
    desc: "Ofrecemos un modelo de inversión seguro y transparente diseñado para maximizar tus rendimientos de forma constante.",
    bullets: [
      "Rendimientos garantizados",
      "Gestión profesional",
      "Transparencia total",
      "Crecimiento constante de tu capital",
    ],
    cta: "Conoce el modelo",
    href: "#pricing",
  },
]

function ServicePanel({ service, index }: { service: (typeof services)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const numberY = useTransform(scrollYProgress, [0, 1], [40, -40])
  const Icon = service.icon
  const fromLeft = index % 2 === 0

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: fromLeft ? -40 : 40, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
      className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-7 md:p-12 hover:border-[#e8c600]/30 hover:shadow-[0_0_35px_rgba(232,198,0,0.08)] transition-all duration-500"
    >
      <motion.span
        style={{ y: numberY }}
        aria-hidden
        className="pointer-events-none absolute -top-4 right-2 md:-top-8 md:right-6 text-[110px] md:text-[200px] font-black leading-none text-white/[0.03] group-hover:text-[#e8c600]/[0.06] transition-colors duration-700 select-none"
      >
        {service.number}
      </motion.span>

      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#e8c600]/10 border border-[#e8c600]/20 flex items-center justify-center group-hover:bg-[#e8c600]/20 group-hover:scale-110 transition-all duration-300">
            <Icon className="w-6 h-6 md:w-7 md:h-7 text-[#e8c600]" />
          </div>
          <span className="text-[#e8c600]/60 text-xs font-mono tracking-widest uppercase">
            {service.tag}
          </span>
        </div>

        <h3 className="text-2xl md:text-4xl font-bold mb-4">{service.title}</h3>
        <p className="text-white/50 text-sm md:text-base leading-relaxed mb-8 max-w-md">
          {service.desc}
        </p>

        <ul className="space-y-3 mb-10">
          {service.bullets.map((b, i) => (
            <motion.li
              key={b}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              className="flex items-start gap-3 text-white/70 text-sm md:text-base"
            >
              <span className="mt-0.5 w-5 h-5 rounded-full bg-[#e8c600]/10 border border-[#e8c600]/30 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-[#e8c600]" />
              </span>
              {b}
            </motion.li>
          ))}
        </ul>

        <Link
          href={service.href}
          className="group/btn inline-flex items-center gap-2 text-sm md:text-base font-semibold text-[#e8c600] hover:text-[#e5d100] transition-colors"
        >
          {service.cta}
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />
        </Link>
      </div>
    </motion.div>
  )
}

export function Services() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.8", "end 0.5"],
  })

  return (
    <section ref={sectionRef} id="servicios" className="relative bg-[#0a0a0a] py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 texture-grid-dark pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(232,198,0,0.04)_0%,transparent_55%)]" />
      <div className="hidden md:block absolute -left-32 top-1/3 w-[400px] h-[400px] rounded-full bg-[#e8c600]/[0.03] blur-[120px]" />

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14 md:mb-20"
        >
          <span className="text-[#e8c600] text-xs md:text-sm font-semibold tracking-widest uppercase">
            Nuestros Servicios
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">
            Dos caminos, <span className="text-[#e8c600]">un mismo destino</span>
          </h2>
          <p className="text-white/50 text-sm md:text-base max-w-xl mx-auto">
            Fórmate como trader profesional o deja que tu capital trabaje por ti.
            En Xpand Capital tienes ambas puertas abiertas.
          </p>
        </motion.div>

        <div className="relative grid md:grid-cols-2 gap-6 md:gap-10">
          <svg
            aria-hidden
            className="hidden md:block absolute left-1/2 top-0 -translate-x-1/2 h-full w-8 pointer-events-none"
            viewBox="0 0 8 400"
            preserveAspectRatio="none"
            fill="none"
          >
            <motion.line
              x1="4"
              y1="0"
              x2="4"
              y2="400"
              stroke="#e8c600"
              strokeOpacity="0.25"
              strokeWidth="1.5"
              style={{ pathLength: scrollYProgress }}
            />
          </svg>

          {services.map((service, i) => (
            <ServicePanel key={service.title} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
