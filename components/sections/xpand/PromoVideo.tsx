"use client"

import { motion } from "framer-motion"

export function PromoVideo() {
  return (
    <section className="relative bg-[#050505] py-12 md:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(213,193,8,0.04)_0%,transparent_70%)]" />

      <div className="relative max-w-4xl mx-auto px-4 md:px-6">
        <div className="relative">
          <div className="absolute -inset-px rounded-2xl md:rounded-3xl bg-gradient-to-br from-[#d5c108]/40 via-[#d5c108]/10 to-transparent blur-sm" />
          <div className="relative bg-[#0a0a0a] border border-[#d5c108]/20 rounded-2xl md:rounded-3xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.04] bg-[#050505]">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              <span className="text-white/20 text-xs font-mono ml-3 tracking-wider hidden sm:inline">
                xpand-terminal ~ presentacion.mp4
              </span>
            </div>

            <div className="aspect-video w-full">
              <iframe
                src="https://adilo.bigcommand.com/watch/bOtdel7H"
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
                title="Xpand Capital — Video de Presentación"
              />
            </div>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-white/20 text-xs mt-4 font-mono"
        >
          PRESENTACIÓN INSTITUCIONAL · XPAND CAPITAL
        </motion.p>
      </div>
    </section>
  )
}
