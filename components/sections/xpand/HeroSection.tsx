"use client"

import { motion } from "framer-motion"
import { TrendingUp, ArrowRight, Play, ChevronDown, Target, Users, Zap } from "lucide-react"
import Link from "next/link"

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.7, ease: "easeOut" } }),
}

const forexPairs = [
  { pair: "EUR/USD", price: "1.0850", change: "+0.32" },
  { pair: "GBP/USD", price: "1.2640", change: "-0.18" },
  { pair: "USD/JPY", price: "151.30", change: "+0.45" },
  { pair: "XAU/USD", price: "2,345.80", change: "+1.22" },
  { pair: "BTC/USD", price: "67,420", change: "+2.15" },
  { pair: "USD/MXN", price: "17.85", change: "-0.09" },
  { pair: "EUR/JPY", price: "164.20", change: "+0.67" },
  { pair: "GBP/JPY", price: "191.50", change: "+0.28" },
]

const signals = [
  "EUR/USD +45 pips — Sesión London",
  "XAU/USD rompiendo resistencia clave en 2,350",
  "GBP/JPY señal de compra activada",
  "USD/JPY consolidando — esperar breakout",
  "BTC/USD en tendencia alcista — objetivo 70K",
]

function ForexTicker() {
  return (
    <div className="absolute top-0 left-0 right-0 h-9 bg-white/[0.02] border-b border-white/[0.04] overflow-hidden z-20">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...forexPairs, ...forexPairs].map((f, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-4 text-xs font-mono shrink-0">
            <span className="text-white/40">{f.pair}</span>
            <span className="text-white/80">{f.price}</span>
            <span className={f.change.startsWith("+") ? "text-emerald-400" : "text-red-400"}>
              {f.change}%
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

function LiveBadge() {
  return (
    <div className="absolute top-12 left-6 md:left-10 z-20 flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
      </span>
      <span className="text-emerald-400/80 text-xs font-mono tracking-wider">EN VIVO · SESIÓN LONDON</span>
    </div>
  )
}

function SignalMarquee() {
  return (
    <div className="flex animate-marquee-slow whitespace-nowrap pt-3">
      {[...signals, ...signals].map((s, i) => (
        <span key={i} className="inline-flex items-center gap-2 px-6 text-sm text-white/25 font-mono shrink-0">
          <span className="w-1 h-1 rounded-full bg-[#d5c108]/50" />
          {s}
        </span>
      ))}
    </div>
  )
}

function FloatingMetrics() {
  return (
    <motion.div
      custom={5}
      variants={fadeUp}
      className="mt-12 grid grid-cols-3 gap-3 md:gap-4 max-w-lg mx-auto"
    >
      {[
        { icon: Target, value: "94%", label: "Tasa de éxito" },
        { icon: Users, value: "2,340", label: "Traders activos" },
        { icon: Zap, value: "1,245", label: "Pips este mes" },
      ].map((m) => (
        <div
          key={m.label}
          className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-[#d5c108]/30 transition-colors"
        >
          <m.icon className="w-4 h-4 text-[#d5c108]/70" />
          <span className="text-lg font-bold text-[#d5c108] tabular-nums">{m.value}</span>
          <span className="text-[10px] text-white/30 uppercase tracking-wider">{m.label}</span>
        </div>
      ))}
    </motion.div>
  )
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505]">
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 1200 800">
        {[...Array(5)].map((_, i) => (
          <rect key={i} x={120 + i * 200} y={100} width="8" height={`${40 + Math.random() * 120}`} fill="#d5c108" rx="1" opacity="0.6" />
        ))}
        {[...Array(5)].map((_, i) => (
          <rect key={`r-${i}`} x={130 + i * 200} y={150} width="8" height={`${30 + Math.random() * 100}`} fill="#ef4444" rx="1" opacity="0.3" />
        ))}
        <line x1="100" y1="600" x2="1100" y2="100" stroke="#d5c108" strokeWidth="0.5" opacity="0.1" />
      </svg>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(213,193,8,0.06)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIwLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

      <LiveBadge />
      <ForexTicker />

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-16">
        <motion.div custom={0} variants={fadeUp} className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d5c108]/30 bg-[#d5c108]/5 text-[#d5c108] text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            Academia de Trading &amp; Forex
          </span>
        </motion.div>

        <motion.h1 custom={1} variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6">
          TRANSFORMA TU{" "}
          <span className="text-[#d5c108] block md:inline">FUTURO FINANCIERO</span>
        </motion.h1>

        <motion.p custom={2} variants={fadeUp} className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-4 leading-relaxed">
          Educación financiera de élite y estrategias de inversión diseñadas para generar resultados reales en el mercado de divisas.
        </motion.p>

        <SignalMarquee />

        <motion.div custom={3} variants={fadeUp} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login" className="group inline-flex items-center gap-2 bg-[#d5c108] text-black font-bold px-8 py-4 rounded-xl text-lg hover:bg-[#e5d100] transition-all hover:shadow-[0_0_30px_rgba(213,193,8,0.4)]">
            Inscríbete Ahora
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="#ecosistema" className="group inline-flex items-center gap-2 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl text-lg hover:border-[#d5c108]/60 hover:text-[#d5c108] hover:shadow-[0_0_15px_rgba(213,193,8,0.2)] transition-all">
            <Play className="w-5 h-5" />
            Ver Campus
          </Link>
        </motion.div>

        <FloatingMetrics />
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <ChevronDown className="w-6 h-6 text-white/20" />
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
    </section>
  )
}
