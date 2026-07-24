"use client"

import { motion } from "framer-motion"
import { ArrowRight, Play, Target, Users, Zap, TrendingUp, Activity, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef } from "react"

const forexPairs = [
  { pair: "EUR/USD", price: "1.0850", change: "+0.32" },
  { pair: "GBP/USD", price: "1.2640", change: "-0.18" },
  { pair: "USD/JPY", price: "151.30", change: "+0.45" },
  { pair: "XAU/USD", price: "2,345", change: "+1.22" },
  { pair: "BTC/USD", price: "67,420", change: "+2.15" },
  { pair: "USD/MXN", price: "17.85", change: "-0.09" },
  { pair: "EUR/JPY", price: "164.20", change: "+0.67" },
  { pair: "GBP/JPY", price: "191.50", change: "+0.28" },
]

const signals = [
  "EUR/USD +45 pips — Sesión London",
  "XAU/USD rompiendo resistencia 2,350",
  "GBP/JPY señal de compra activada",
  "BTC/USD tendencia alcista — objetivo 70K",
]

const cornerWidgets = [
  { position: "top-24 left-4 md:top-28 md:left-8", icon: TrendingUp, label: "EUR/USD", value: "1.0850", change: "+0.32%", up: true },
  { position: "top-24 right-4 md:top-28 md:right-8", icon: BarChart3, label: "Volatilidad", value: "Media", change: "Sesión London", up: true },
  { position: "bottom-28 left-4 md:bottom-32 md:left-8", icon: Activity, label: "Señales hoy", value: "12", change: "Activas", up: true },
  { position: "bottom-28 right-4 md:bottom-32 md:right-8", icon: Target, label: "Win Rate", value: "78%", change: "Este mes", up: true },
]

function ParticleGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize(); window.addEventListener("resize", resize)
    const particles: { x: number; y: number; vx: number; vy: number; r: number }[] = []
    for (let i = 0; i < 80; i++) {
      particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 1.5 + 0.5 })
    }
    let anim: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "rgba(232,198,0,0.15)"
      for (const p of particles) {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x; const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) { ctx.strokeStyle = `rgba(232,198,0,${0.06 * (1 - dist / 120)})`; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke() }
        }
      }
      anim = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(anim); window.removeEventListener("resize", resize) }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.7, ease: "easeOut" as const } }),
}

export function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#050505]">
      <ParticleGrid />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,198,0,0.05)_0%,transparent_70%)] z-[1]" />

      {/* 4 corner widgets */}
      {cornerWidgets.map((w, idx) => (
        <motion.div key={w.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, y: [0, -9, 0] }}
          transition={{
            opacity: { delay: 0.8, duration: 0.5 },
            scale: { delay: 0.8, duration: 0.5 },
            y: { delay: 1.3 + idx * 0.4, duration: 3.5 + idx * 0.6, repeat: Infinity, ease: "easeInOut" },
          }}
          className={`absolute z-20 hidden sm:flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm ${w.position}`}
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ delay: 1.3 + idx * 0.4, duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <w.icon className="w-5 h-5 text-[#e8c600]/60" />
          </motion.div>
          <div className="text-left">
            <div className="text-xs text-white/30 uppercase tracking-wider mb-0.5">{w.label}</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white/80">{w.value}</span>
              <span className={`text-xs ${w.up ? "text-emerald-400" : "text-red-400"}`}>{w.change}</span>
            </div>
          </div>
        </motion.div>
      ))}

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6 flex flex-col items-center text-center pb-16 md:pb-0 md:pt-0">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="w-full flex flex-col items-center">

          <motion.div custom={0} variants={fadeUp} className="mb-6 md:mb-14">
            <span className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full border border-[#e8c600]/30 bg-[#e8c600]/5 text-[#e8c600] text-xs md:text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Academia de Trading &amp; Forex
            </span>
          </motion.div>

          <motion.h1 custom={1} variants={fadeUp}
            className="relative text-center mb-6 md:mb-12"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            <span className="relative glitch-text block md:inline text-[clamp(5.3rem,18vw,12rem)] font-black tracking-tighter leading-[0.85]" data-text="XPAND" style={{ color: "#e8c600" }}>XPAND</span>
            <span className="relative glitch-text block md:inline text-[clamp(5.3rem,18vw,12rem)] font-black tracking-tighter leading-[0.85] md:ml-4" data-text="CAPITAL" style={{ color: "rgba(255,255,255,0.9)" }}>CAPITAL</span>
          </motion.h1>

          <motion.p custom={2} variants={fadeUp}
            className="text-sm md:text-xl text-white/50 max-w-xs md:max-w-xl mx-auto mb-8 md:mb-14 leading-relaxed px-2"
          >
            Educación financiera de élite y estrategias de inversión diseñadas para generar resultados reales en el mercado de divisas.
          </motion.p>

          <motion.div custom={2.5} variants={fadeUp}
            className="mb-8 md:mb-16 w-full max-w-2xl overflow-hidden"
          >
            <div className="flex animate-marquee-slow whitespace-nowrap">
              {[...signals, ...signals].map((s, i) => (
                <span key={i} className="inline-flex items-center gap-2 px-4 text-xs md:text-sm text-white/20 font-mono whitespace-nowrap">
                  <span className="w-1 h-1 rounded-full bg-[#e8c600]/40" />
                  {s}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div custom={3} variants={fadeUp}
            className="flex flex-row items-center justify-center gap-2 md:gap-4 w-full px-2 md:px-0"
          >
            <Link href="#pricing" className="group inline-flex items-center justify-center gap-1.5 md:gap-2 bg-[#e8c600] text-black font-bold px-4 py-3 md:px-8 md:py-4 rounded-xl text-sm md:text-base flex-1 md:flex-none hover:bg-[#e5d100] transition-all hover:shadow-[0_0_30px_rgba(232,198,0,0.4)] whitespace-nowrap">
              Inscríbete Ahora
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#ecosistema" className="group inline-flex items-center justify-center gap-1.5 md:gap-2 border border-white/20 text-white font-semibold px-4 py-3 md:px-8 md:py-4 rounded-xl text-sm md:text-base flex-1 md:flex-none hover:border-[#e8c600]/60 hover:text-[#e8c600] hover:shadow-[0_0_15px_rgba(232,198,0,0.2)] transition-all whitespace-nowrap">
              <Play className="w-4 h-4 md:w-5 md:h-5" />
              Ver Campus
            </Link>
          </motion.div>

          <motion.div custom={4} variants={fadeUp}
            className="mt-12 md:mt-20 grid grid-cols-3 gap-3 md:gap-4 w-full max-w-md md:max-w-lg px-2"
          >
            {[
              { icon: Target, value: "94%", label: "Tasa de éxito" },
              { icon: Users, value: "2,340", label: "Traders" },
              { icon: Zap, value: "1,245", label: "Pips este mes" },
            ].map((m) => (
              <div key={m.label} className="flex flex-col items-center gap-1 p-3 md:p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-[#e8c600]/30 transition-colors">
                <m.icon className="w-4 h-4 md:w-5 md:h-5 text-[#e8c600]/70" />
                <span className="text-lg md:text-xl font-bold text-[#e8c600] tabular-nums">{m.value}</span>
                <span className="text-[10px] md:text-xs text-white/30 uppercase tracking-wider text-center">{m.label}</span>
              </div>
            ))}
          </motion.div>

        </motion.div>
      </div>

      <div className="absolute bottom-20 md:bottom-0 left-0 right-0 z-10 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap border-t border-white/[0.03] py-2">
          {[...forexPairs, ...forexPairs].map((f, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 md:px-5 text-xs md:text-sm font-mono whitespace-nowrap">
              <span className="text-white/30">{f.pair}</span>
              <span className="text-white/60">{f.price}</span>
              <span className={f.change.startsWith("+") ? "text-emerald-400" : "text-red-400"}>{f.change}%</span>
            </span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 md:h-28 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-[1]" />
    </section>
  )
}
