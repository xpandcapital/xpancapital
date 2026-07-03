"use client"

import { TrendingUp, ExternalLink } from 'lucide-react'

export default function ForexPage() {
  return (
    <div className="space-y-4 px-4 md:px-8 pt-8 pb-20 w-full mx-auto h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">Forex Factory</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Calendario económico en tiempo real</p>
          </div>
        </div>
        <a
          href="https://www.forexfactory.com/calendar"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] text-gray-400 font-bold uppercase tracking-wider hover:text-white hover:border-white/20 transition-colors"
        >
          Abrir en nueva pestaña
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Embedded iframe */}
      <div className="flex-1 min-h-0 rounded-2xl overflow-hidden border border-white/5 bg-white">
        <iframe
          src="https://www.forexfactory.com/calendar"
          className="w-full h-full"
          title="Forex Factory Calendar"
          sandbox="allow-scripts allow-same-origin allow-forms"
          loading="lazy"
        />
      </div>
    </div>
  )
}
