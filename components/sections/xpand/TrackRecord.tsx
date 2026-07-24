"use client"

import { motion } from "framer-motion"
import { BarChart3, TrendingUp, Shield, Activity } from "lucide-react"

const trades = [
  { pair: "EUR/USD", pips: 42, result: "win" },
  { pair: "GBP/JPY", pips: -15, result: "loss" },
  { pair: "XAU/USD", pips: 88, result: "win" },
  { pair: "USD/JPY", pips: 33, result: "win" },
  { pair: "BTC/USD", pips: 120, result: "win" },
  { pair: "EUR/JPY", pips: -22, result: "loss" },
]

export function TrackRecord() {
  return (
    <section id="resultados" className="relative bg-[#050505] py-20 md:py-28">
      <div className="absolute inset-0 texture-grid-dark pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(232,198,0,0.04)_0%,transparent_60%)]" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 md:mb-16">
          <span className="text-[#e8c600] text-xs md:text-sm font-semibold tracking-widest uppercase">Track Record</span>
          <h2 className="text-2xl md:text-5xl font-bold mt-2 md:mt-3 mb-3 md:mb-4">Resultados Reales</h2>
          <p className="text-white/50 text-sm md:text-base max-w-xl mx-auto">Transparencia total. Estos son nuestros números.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10 md:mb-14">
          {[
            { icon: Activity, value: "78%", label: "Tasa de acierto" },
            { icon: TrendingUp, value: "+12.4%", label: "Retorno mensual" },
            { icon: Shield, value: "-4.2%", label: "Drawdown máx." },
            { icon: BarChart3, value: "2.9", label: "Profit Factor" },
          ].map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="group bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-xl p-4 md:p-6 text-center hover:border-[#e8c600]/30 transition-all duration-500"
            >
              <m.icon className="w-5 h-5 md:w-6 md:h-6 text-[#e8c600]/70 mx-auto mb-2 md:mb-3" />
              <div className="text-xl md:text-3xl font-bold text-[#e8c600] mb-1">{m.value}</div>
              <div className="text-[10px] md:text-xs text-white/40 uppercase tracking-wider">{m.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative overflow-hidden rounded-xl md:rounded-2xl border border-white/5 bg-white/[0.02]"
        >

          <div className="px-2 md:px-10 py-4 md:py-8">
            <svg className="w-full h-32 md:h-56" viewBox="0 0 900 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e8c600" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#e8c600" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                d="M0,150 C45,140 90,130 135,120 C180,110 225,100 270,95 C315,90 360,85 405,78 C450,70 495,65 540,55 C585,45 630,38 675,35 C720,32 765,28 810,22 C855,15 900,10 900,10"
                fill="none" stroke="#e8c600" strokeWidth="2.5"
                initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              <motion.path
                d="M0,150 C45,140 90,130 135,120 C180,110 225,100 270,95 C315,90 360,85 405,78 C450,70 495,65 540,55 C585,45 630,38 675,35 C720,32 765,28 810,22 C855,15 900,10 900,10 L900,200 L0,200 Z"
                fill="url(#equityGrad)"
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.5, duration: 1 }}
              />
            </svg>
          </div>

          <div className="overflow-x-auto border-t border-white/5">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="text-white/30 border-b border-white/5">
                  <th className="text-left py-2 md:py-3 px-3 md:px-5 font-medium">Par</th>
                  <th className="text-right py-2 md:py-3 px-3 md:px-5 font-medium">Pips</th>
                  <th className="text-right py-2 md:py-3 px-3 md:px-5 font-medium">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t, i) => (
                  <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                    <td className="py-2 md:py-3 px-3 md:px-5 text-white/60 font-mono">{t.pair}</td>
                    <td className={`py-2 md:py-3 px-3 md:px-5 text-right font-mono ${t.result === "win" ? "text-emerald-400" : "text-red-400"}`}>
                      {t.result === "win" ? "+" : ""}{t.pips}
                    </td>
                    <td className="py-2 md:py-3 px-3 md:px-5 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] md:text-xs font-medium ${t.result === "win" ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"}`}>
                        {t.result === "win" ? "WIN" : "LOSS"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <p className="text-center text-[10px] md:text-xs text-white/15 mt-4 md:mt-6 max-w-md mx-auto">
          Resultados pasados no garantizan rendimientos futuros. El trading conlleva riesgos.
        </p>
      </div>
    </section>
  )
}
