"use client"

import { motion } from "framer-motion"
import { Check, Zap, ArrowRight, Terminal } from "lucide-react"
import Link from "next/link"

const bullets = [
  "Herramientas profesionales de trading",
  "Estrategias probadas en el mercado real",
  "Mentorías diseñadas para transformar tus metas en resultados",
  "Acceso continuo 24/7 a todos los contenidos",
  "Comunidad activa de traders e inversionistas",
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
}

export function MasterclassCTA() {
  return (
    <section className="relative bg-[#0a0a0a] py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 texture-topo-dark pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(213,193,8,0.05)_0%,transparent_70%)]" />

      <div className="relative max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <motion.div
            animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.004, 1] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute -inset-px rounded-3xl bg-gradient-to-br from-[#d5c108]/40 via-[#d5c108]/10 to-transparent blur-sm"
          />
          <div className="relative bg-[#050505] border border-[#d5c108]/20 rounded-3xl p-8 md:p-12">
            <div className="flex items-center gap-2 text-[#d5c108]/60 text-xs font-mono mb-6">
              <Terminal className="w-3.5 h-3.5" />
              <span>xpand-terminal ~ tu-futuro</span>
            </div>

            <div className="grid md:grid-cols-2 gap-10 items-center">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.span
                  variants={itemVariants}
                  className="text-[#d5c108] text-sm font-semibold tracking-widest uppercase"
                >
                  El primer paso hacia el éxito
                </motion.span>
                <motion.h2
                  variants={itemVariants}
                  className="text-3xl md:text-4xl font-bold mt-3 mb-4 leading-tight"
                >
                  INVIERTE EN TU
                  <span className="block text-[#d5c108]">FUTURO HOY</span>
                </motion.h2>
                <motion.p variants={itemVariants} className="text-white/50 text-sm md:text-base mb-6">
                  El conocimiento es el primer paso hacia el éxito financiero. Con
                  nuestra suscripción anual, tendrás acceso a todo lo que necesitas
                  para transformar tus metas en resultados reales.
                </motion.p>

                <ul className="space-y-3 mb-8">
                  {bullets.map((b) => (
                    <motion.li
                      key={b}
                      variants={itemVariants}
                      className="flex items-start gap-3 text-white/70"
                    >
                      <Check className="w-5 h-5 text-[#d5c108] shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </motion.li>
                  ))}
                </ul>

                <motion.div variants={itemVariants}>
                  <motion.div whileTap={{ scale: 0.95 }} className="inline-block">
                    <Link
                      href="#pricing"
                      className="group inline-flex items-center gap-3 bg-[#d5c108] text-black font-bold px-8 md:px-10 py-4 md:py-5 rounded-xl text-base md:text-lg hover:bg-[#e5d100] transition-all hover:shadow-[0_0_40px_rgba(213,193,8,0.4)] hover:scale-[1.02]"
                    >
                      <Zap className="w-5 h-5" />
                      ¡Únete ahora!
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                  <p className="text-white/30 text-xs mt-3">
                    No dejes pasar esta oportunidad única de construir un futuro sólido y próspero.
                  </p>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="hidden md:block"
              >
                <div className="relative aspect-square rounded-2xl bg-[#d5c108]/5 border border-[#d5c108]/10 flex items-center justify-center overflow-hidden">
                  <motion.div
                    animate={{ opacity: [0.15, 0.35, 0.15] }}
                    transition={{ duration: 3.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(213,193,8,0.2)_0%,transparent_70%)]"
                  />
                  <div className="relative text-center">
                    <div className="text-7xl font-black text-[#d5c108]/25 mb-2">365</div>
                    <p className="text-[#d5c108]/50 font-mono text-sm">DÍAS DE ACCESO</p>
                    <p className="text-white/20 text-xs mt-2">Suscripción Anual</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
