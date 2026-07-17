"use client"

import { motion } from "framer-motion"
import { Award, ShieldCheck, TrendingUp } from "lucide-react"

export function InstructorProfile() {
  return (
    <section className="relative bg-[#0a0a0a] py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 texture-topo-dark pointer-events-none" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#d5c108]/5 blur-[120px]" />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[#d5c108] text-sm font-semibold tracking-widest uppercase">
              Conoce a tu Instructor
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-6 leading-tight">
              Hola, soy Hebed Berrio
              <span className="block text-white/60 text-xl md:text-2xl font-normal mt-2">
                Empresario y Trader Profesional
              </span>
            </h2>

            <div className="space-y-4 text-white/60 text-base leading-relaxed mb-8">
              <p>
                Director de Xpand Capital, con más de{" "}
                <span className="text-[#d5c108] font-semibold">13 años</span> de
                experiencia en los mercados financieros y{" "}
                <span className="text-[#d5c108] font-semibold">8 años</span> de
                especialización en el mercado Forex, consolidando una trayectoria
                enfocada en análisis estratégico y gestión eficiente del capital.
              </p>
              <p className="text-white/40 italic border-l-2 border-[#d5c108]/50 pl-4">
                &ldquo;Mi enfoque se fundamenta en una gestión de riesgo sólida, el
                entendimiento profundo de la psicología del trading y la lectura
                institucional del precio.&rdquo;
              </p>
              <p>
                Comprometido con la formación de traders disciplinados y el desarrollo
                de estrategias con visión de largo plazo, orientadas a la consistencia,
                la claridad operativa y la evolución personal dentro del mercado.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              {[
                { icon: ShieldCheck, label: "Gestión de Riesgo" },
                { icon: TrendingUp, label: "Psicología del Trading" },
                { icon: Award, label: "Lectura Institucional" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 15, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.12, type: "spring", bounce: 0.4 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-white/70 hover:border-[#d5c108]/40 hover:text-white transition-colors"
                >
                  <item.icon className="w-4 h-4 text-[#d5c108]" />
                  {item.label}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#d5c108]/30 to-transparent blur-sm opacity-50" />
            <div className="relative aspect-[3/4] rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
              <img
                src="/images/hebed%20perfil%20p.png"
                alt="Hebed Berrio — Director & Trader Profesional"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
