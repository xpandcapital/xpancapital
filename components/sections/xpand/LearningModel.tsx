"use client"

import { useRef } from "react"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from "framer-motion"
import { Clapperboard, Radio, Infinity as InfinityIcon, MessagesSquare, Check } from "lucide-react"

const modes = [
  {
    icon: Clapperboard,
    title: "Clases Cortas",
    subtitle: "Micro-Learning",
    desc: "Aprende con cursos concisos de 2 horas en promedio, subdivididos en videos de máximo 10 minutos.",
    bullets: [
      "Información concisa sobre skills específicos",
      "Más fáciles de aprender y súper prácticos",
    ],
  },
  {
    icon: Radio,
    title: "Clases Online",
    subtitle: "En Vivo + Grabadas",
    desc: "Todas las clases son grabadas y podrás acceder a ellas tantas veces como lo necesites, con foros de discusión entre estudiantes y maestros.",
    bullets: [
      "Interacción en vivo por video",
      "Resolución de dudas en vivo",
      "Networking con tus compañeros",
    ],
  },
  {
    icon: InfinityIcon,
    title: "Acceso Continuo",
    subtitle: "24/7 Sin Horarios",
    desc: "Tendrás acceso a los contenidos grabados las 24 horas durante todo tu periodo de inscripción.",
    bullets: [
      "Accede a tus clases cuando quieras, sin horarios",
      "Feedback constante de mentores",
    ],
  },
  {
    icon: MessagesSquare,
    title: "Mentorías",
    subtitle: "Personalizadas",
    desc: "Tendrás acceso a videollamadas en vivo para que puedas absolver cualquier duda que surja.",
    bullets: [
      "Interacción en vivo por chat",
      "Acompañamiento en el desarrollo de tus cursos",
    ],
  },
]

function TiltCard({ mode, index }: { mode: (typeof modes)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 200, damping: 20 })
  const Icon = mode.icon

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mx.set((e.clientX - rect.left) / rect.width)
    my.set((e.clientY - rect.top) / rect.height)
  }

  const handleMouseLeave = () => {
    mx.set(0.5)
    my.set(0.5)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.12, duration: 0.7, ease: "easeOut" }}
      className="[perspective:1000px]"
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileTap={{ scale: 0.97 }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="group relative h-full bg-white border border-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-2xl p-6 md:p-8 hover:border-[#d5c108]/70 hover:shadow-[0_12px_35px_rgba(213,193,8,0.18)] transition-[border-color,box-shadow] duration-500"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#d5c108]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative" style={{ transform: "translateZ(30px)" }}>
          <div className="flex items-center gap-4 mb-5">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 + index * 0.12, type: "spring", bounce: 0.5 }}
              className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#d5c108]/15 border border-[#d5c108]/40 flex items-center justify-center shrink-0"
            >
              <Icon className="w-6 h-6 md:w-7 md:h-7 text-[#8f8200]" />
            </motion.div>
            <div>
              <h3 className="text-lg md:text-xl font-bold leading-tight text-zinc-900">{mode.title}</h3>
              <span className="text-[#8f8200] text-xs md:text-sm font-mono uppercase tracking-wider">
                {mode.subtitle}
              </span>
            </div>
          </div>

          <p className="text-zinc-600 text-sm leading-relaxed mb-5">{mode.desc}</p>

          <ul className="space-y-2.5">
            {mode.bullets.map((b, i) => (
              <motion.li
                key={b}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + index * 0.12 + i * 0.08 }}
                className="flex items-start gap-2.5 text-zinc-700 text-sm"
              >
                <Check className="w-4 h-4 text-[#8f8200] shrink-0 mt-0.5" />
                {b}
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function LearningModel() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  const orbY = useTransform(scrollYProgress, [0, 1], [80, -80])

  return (
    <section ref={sectionRef} id="educacion" className="relative bg-[#fafaf8] py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/15 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(213,193,8,0.09)_0%,transparent_55%)]" />
      <motion.div
        style={{ y: orbY }}
        className="hidden md:block absolute -right-40 top-1/4 w-[450px] h-[450px] rounded-full bg-[#d5c108]/[0.10] blur-[130px]"
      />

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14 md:mb-20"
        >
          <motion.span
            animate={{
              boxShadow: [
                "0 0 0px rgba(213,193,8,0.0)",
                "0 0 18px rgba(213,193,8,0.45)",
                "0 0 0px rgba(213,193,8,0.0)",
              ],
            }}
            transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d5c108]/60 bg-[#d5c108]/15 text-[#8f8200] text-xs md:text-sm font-bold tracking-widest uppercase"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b8a600] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b8a600]" />
            </span>
            ¡Oferta por tiempo limitado!
          </motion.span>
          <h2 className="text-3xl md:text-5xl font-bold mt-5 mb-4 text-zinc-900">
            Así aprenderás en <span className="text-[#a08e00]">la Academia</span>
          </h2>
          <p className="text-zinc-600 text-sm md:text-base max-w-xl mx-auto">
            Un sistema educativo diseñado para que aprendas a tu ritmo, con
            acompañamiento real y sin horarios.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
          {modes.map((mode, i) => (
            <TiltCard key={mode.title} mode={mode} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
