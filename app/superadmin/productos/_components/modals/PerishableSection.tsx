"use client"

import { Calendar, AlertCircle, Sparkles, RotateCw, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { PerishableHandling } from '../../_types'

interface PerishableSectionProps {
  isPerishable: boolean
  purchaseDate: string
  expirationDate: string
  perishableHandling: PerishableHandling
  onPerishableChange: (isPerishable: boolean) => void
  onPurchaseDateChange: (date: string) => void
  onExpirationDateChange: (date: string) => void
  onPerishableHandlingChange: (handling: PerishableHandling) => void
}

export function PerishableSection({
  isPerishable,
  purchaseDate,
  expirationDate,
  perishableHandling,
  onPerishableChange,
  onPurchaseDateChange,
  onExpirationDateChange,
  onPerishableHandlingChange
}: PerishableSectionProps) {
  return (
    <div className="md:col-span-2 overflow-hidden">
      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-8 relative group">
        <div className="absolute top-0 right-0 p-8">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isPerishable ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/5 border border-white/10'}`}>
            <Calendar className={`w-6 h-6 ${isPerishable ? 'text-amber-500' : 'text-gray-600'}`} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Gestión de Perecibles</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isPerishable} onChange={(e) => onPerishableChange(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Activar para productos con fecha de caducidad</p>
        </div>

        <AnimatePresence>
          {isPerishable && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-indigo-500" /> Fecha de Compra / Lote
                  </label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => onPurchaseDateChange(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-rose-500" /> Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => onExpirationDateChange(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-rose-500 transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Estrategia de Logística Inversa</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'reimburse', label: 'Reembolsable', icon: RotateCw, desc: 'Devolver al proveedor' },
                    { id: 'discard', label: 'Descartar', icon: Trash2, desc: 'Eliminar del inventario' }
                  ].map((strat) => (
                    <label key={strat.id} className="relative cursor-pointer group">
                      <input
                        type="radio"
                        name="perishable_handling"
                        checked={perishableHandling === strat.id}
                        onChange={() => onPerishableHandlingChange(strat.id as PerishableHandling)}
                        className="sr-only peer"
                      />
                      <div className={`p-5 rounded-2xl border border-white/5 bg-white/5 transition-all flex flex-col items-center text-center gap-3 hover:bg-white/[0.08] peer-checked:border-emerald-500/50 peer-checked:bg-emerald-500/10 ${perishableHandling === strat.id ? 'text-emerald-500' : ''}`}>
                        <strat.icon className="w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest mb-1">{strat.label}</p>
                          <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest leading-none">{strat.desc}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {expirationDate && (
                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Análisis de Ciclo de Vida</p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                      {(() => {
                        const diff = (new Date(expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
                        if (diff < 0) return <span className="text-rose-500">PRODUCTO VENCIDO HACE {Math.abs(Math.round(diff))} DÍAS</span>
                        if (diff < 30) return <span className="text-amber-500">CRÍTICO: VENCE EN {Math.round(diff)} DÍAS</span>
                        return <span>Producto saludable: {Math.round(diff)} días restantes</span>
                      })()}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}