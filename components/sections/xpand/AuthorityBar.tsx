"use client"

import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 2000
          const start = Date.now()
          const tick = () => {
            const elapsed = Date.now() - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return (
    <span ref={ref} className="text-[#d5c108] font-bold text-3xl md:text-4xl tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

const stats = [
  { target: 10, suffix: "+", label: "Años de Experiencia" },
  { target: 5240, suffix: "+", label: "Estudiantes Registrados" },
  { target: 1320, suffix: "+", label: "Certificados Entregados" },
  { target: 100, suffix: "%", label: "Satisfacción" },
]

export function AuthorityBar() {
  return (
    <section className="relative bg-[#0a0a0a] border-y border-white/5">
      <div className="absolute inset-0 bg-[#d5c108]/[0.02]" />
      <div className="relative max-w-6xl mx-auto px-6 py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="text-center"
            >
              <AnimatedCounter target={stat.target} suffix={stat.suffix} />
              <p className="text-white/40 text-sm mt-2 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
