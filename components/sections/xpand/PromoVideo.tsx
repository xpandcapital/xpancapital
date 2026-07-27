"use client"

import { motion } from "framer-motion"

export function PromoVideo() {
  return (
    <section id="video" className="relative bg-[#050505] py-12 md:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,198,0,0.04)_0%,transparent_70%)]" />

      <div className="relative max-w-4xl mx-auto px-4 md:px-6">
        <div className="relative">
          <div className="absolute -inset-px rounded-2xl md:rounded-3xl bg-gradient-to-br from-[#e8c600]/40 via-[#e8c600]/10 to-transparent blur-sm" />
          <div className="relative bg-[#0a0a0a] border border-[#e8c600]/20 rounded-2xl md:rounded-3xl overflow-hidden">
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


      </div>
    </section>
  )
}
