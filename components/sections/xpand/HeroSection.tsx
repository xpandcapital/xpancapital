"use client"

import { motion } from "framer-motion"
import { TrendingUp, ArrowRight, Play } from "lucide-react"
import Link from "next/link"

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: "easeOut" },
  }),
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(213,193,8,0.06)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIwLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative z-10 max-w-5xl mx-auto px-6 text-center"
      >
        <motion.div custom={0} variants={fadeUp} className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d5c108]/30 bg-[#d5c108]/5 text-[#d5c108] text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            Academia de Trading &amp; Forex
          </span>
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6"
        >
          TRANSFORMA TU{" "}
          <span className="text-[#d5c108] block md:inline">FUTURO FINANCIERO</span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Educación financiera de élite y estrategias de inversión diseñadas para
          generar resultados reales en el mercado de divisas.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 bg-[#d5c108] text-black font-bold px-8 py-4 rounded-xl text-lg hover:bg-[#e5d100] transition-all hover:shadow-[0_0_30px_rgba(213,193,8,0.4)]"
          >
            Inscríbete Ahora
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#ecosistema"
            className="group inline-flex items-center gap-2 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl text-lg hover:border-[#d5c108]/60 hover:text-[#d5c108] hover:shadow-[0_0_15px_rgba(213,193,8,0.2)] transition-all"
          >
            <Play className="w-5 h-5" />
            Ver Campus
          </Link>
        </motion.div>

        <motion.div
          custom={4}
          variants={fadeUp}
          className="mt-16 flex items-center justify-center gap-6 text-white/30 text-sm"
        >
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d5c108]" />
            MetaTrader
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d5c108]" />
            TradingView
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d5c108]" />
            Forex
          </span>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
    </section>
  )
}
