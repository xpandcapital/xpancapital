"use client"

import { Package, ShoppingBag, AlertCircle, RotateCw, Clock, CheckCircle2, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { AnalyticsData } from '../../_types'

interface AnalyticsSectionProps {
  isAnalyticsOpen: boolean
  onToggle: () => void
  analytics: AnalyticsData
  selectedCurrencySymbol: string
  totalProducts: number
  enablePerishables: boolean
}

export function AnalyticsSection({
  isAnalyticsOpen,
  onToggle,
  analytics,
  selectedCurrencySymbol,
  totalProducts,
  enablePerishables
}: AnalyticsSectionProps) {
  const { inventoryValue, lowStockCount, outOfStockCount, totalPhysicalItems, inventoryStatusData, topCategoriesByStock, perishableStats } = analytics

  const quickStats = [
    { label: "Valor de Inventario", value: `${selectedCurrencySymbol}${inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, trend: "Valor Total Real", icon: ShoppingBag, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Existencias Físicas", value: totalPhysicalItems.toLocaleString(), trend: "Unidades en Almacén", icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Artículos Críticos", value: (lowStockCount + outOfStockCount).toString(), trend: `${outOfStockCount} Agotados / ${lowStockCount} Bajos`, icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
    { label: "Rotación Mensual", value: "14.2%", trend: "Estimado Logístico", icon: RotateCw, color: "text-amber-500", bg: "bg-amber-500/10" }
  ]

  const kpis = [
    { label: "Tiempo de Entrega", value: "1.2 días", icon: Clock, color: "text-indigo-400" },
    { label: "Precisión Picking", value: "99.8%", icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Devoluciones", value: "0.4%", icon: RotateCw, color: "text-rose-400" }
  ]

  const healthStats = [
    { label: "En Stock / Ilimitado", count: inventoryStatusData.disponible, color: "bg-emerald-500" },
    { label: "Bajo Stock", count: inventoryStatusData.bajoStock, color: "bg-amber-500" },
    { label: "Agotado", count: inventoryStatusData.agotado, color: "bg-rose-500" }
  ]

  return (
    <div className="mt-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Package className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">Logística de Inventario</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1.5">Control de Existencias, Salud del Stock y Operaciones</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-all group"
        >
          <span>{isAnalyticsOpen ? 'OCULTAR' : 'MOSTRAR'}</span>
          <ChevronUp className={`w-3 h-3 transition-transform duration-500 ${isAnalyticsOpen ? 'rotate-0' : 'rotate-180'}`} />
        </button>
      </div>

      <AnimatePresence>
        {isAnalyticsOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickStats.map((stat, i) => (
                <div key={i} className="bg-zinc-950/50 border border-white/5 p-5 rounded-[2.5rem] flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
                    <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white tracking-tighter">{stat.value}</h4>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">{stat.trend}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-zinc-950/50 border border-white/5 p-4 md:p-6 rounded-[2.5rem]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Flujo de Operaciones</h3>
                  <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Actividad 24h</span>
                </div>
                <div className="h-40 flex items-end gap-1 px-2">
                  {[15, 20, 10, 5, 5, 10, 30, 60, 85, 95, 80, 70, 65, 75, 85, 90, 80, 60, 50, 45, 40, 35, 25, 20].map((h, i) => (
                    <div key={i} className="flex-1 bg-white/5 rounded-t-sm relative group">
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-500/50 to-purple-500/50 rounded-t-sm transition-all duration-1000" style={{ height: `${h}%` }} />
                      {i % 4 === 0 && <span className="absolute -bottom-4 left-0 text-[8px] text-gray-600 font-bold">{i}h</span>}
                    </div>
                  ))}
                </div>
                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-8">Carga máxima en almacén: <span className="text-indigo-500">8:00 AM - 11:00 AM</span></p>
              </div>

              <div className="bg-zinc-950/50 border border-white/5 p-4 md:p-6 rounded-[2.5rem]">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">Stock por Categoría</h3>
                <div className="space-y-4">
                  {topCategoriesByStock.length > 0 ? topCategoriesByStock.map((cat, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                        <span className="text-gray-400">{cat.name}</span>
                        <span className="text-white">{cat.stock.toLocaleString()} Un.</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (cat.stock / (totalPhysicalItems || 1)) * 100)}%` }}
                          className="h-full bg-indigo-500"
                        />
                      </div>
                    </div>
                  )) : (
                    <div className="h-full flex items-center justify-center text-[10px] text-gray-600 font-black uppercase tracking-widest">No hay datos</div>
                  )}
                </div>
              </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 ${enablePerishables ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
              <div className="bg-zinc-950/50 border border-white/5 p-4 md:p-6 rounded-[2.5rem]">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">Salud del Inventario</h3>
                <div className="space-y-5">
                  {healthStats.map((s, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                        <span className="text-gray-400">{s.label}</span>
                        <span className="text-white">{s.count} artículos</span>
                      </div>
                      <div className="flex gap-1 h-1.5">
                        {Array.from({ length: 12 }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`flex-1 rounded-full ${idx < Math.round((s.count / (totalProducts || 1)) * 12) ? s.color : 'bg-white/5'}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-950/50 border border-white/5 p-4 md:p-6 rounded-[2.5rem]">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">Eficiencia de Reabasto</h3>
                <div className="h-32 flex items-end gap-4 px-4 overflow-hidden">
                  {[85, 92, 78, 95, 88].map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-white/5 rounded-t-xl relative group">
                        <div className={`absolute bottom-0 left-0 right-0 bg-indigo-500/30 rounded-t-xl ${i === 3 ? 'bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : ''}`} style={{ height: `${v}%` }} />
                        {i === 3 && <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-black text-indigo-500 tracking-widest">{v}%</span>}
                      </div>
                      <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest shrink-0">{["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"][i]}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-6 text-center">Promedio semanal: <span className="text-indigo-500">89.6%</span></p>
              </div>

              <div className="bg-zinc-950/50 border border-white/5 p-6 rounded-[2.5rem]">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">KPIs Logísticos</h3>
                <div className="space-y-5">
                  {kpis.map((kpi, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-3">
                        <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{kpi.label}</span>
                      </div>
                      <span className="text-[10px] font-black text-white tracking-widest">{kpi.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-8 italic px-2">Cumplimiento del 98% de SLAs</p>
              </div>

              {enablePerishables && (
                <div className="bg-zinc-950/50 border border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full" />
                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <div>
                      <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Control de Perecibles</h3>
                      <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1">Ingeniería de Vencimientos</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <Clock className="w-5 h-5 text-amber-500" />
                    </div>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Críticos</span>
                        <h4 className={`text-2xl font-black tracking-tighter ${perishableStats?.critical > 0 ? 'text-amber-500' : 'text-white'}`}>
                          {perishableStats?.critical || 0}
                        </h4>
                      </div>
                      <div className="space-y-1 text-right">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Vencidos</span>
                        <h4 className={`text-2xl font-black tracking-tighter ${perishableStats?.expired > 0 ? 'text-rose-500' : 'text-white'}`}>
                          {perishableStats?.expired || 0}
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                        <span className="text-gray-400">Salud del Lote</span>
                        <span className="text-emerald-500">
                          {perishableStats?.total > 0
                            ? `${Math.round(((perishableStats.total - (perishableStats.critical + perishableStats.expired)) / perishableStats.total) * 100)}%`
                            : '100%'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full flex overflow-hidden">
                        <div className="h-full bg-rose-500" style={{ width: `${(perishableStats?.expired / (perishableStats?.total || 1)) * 100}%` }} />
                        <div className="h-full bg-amber-500" style={{ width: `${(perishableStats?.critical / (perishableStats?.total || 1)) * 100}%` }} />
                        <div className="h-full bg-emerald-500" style={{ width: `${((perishableStats?.total - (perishableStats?.critical + perishableStats?.expired)) / (perishableStats?.total || 1)) * 100}%` }} />
                      </div>
                    </div>

                    {perishableStats?.critical > 0 && (
                      <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center justify-between">
                        <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Acción Requerida</span>
                        <button className="text-[8px] font-black text-white hover:text-amber-500 transition-colors uppercase tracking-widest flex items-center gap-1">
                          VER LOTES <ChevronUp className="w-2.5 h-2.5 rotate-90" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}