"use client"

import { useState, useMemo } from 'react'
import { Loader2, CheckSquare, ChevronLeft, ChevronRight } from 'lucide-react'
import { useHabitos, HABITOS_FIJOS } from '../_hooks/useHabitos'
import type { HabitosDiarios } from '../_hooks/useHabitos'

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// ============ HOOK DE CALENDARIO ============
function useCalendario() {
  const [fecha, setFecha] = useState(new Date())
  const mes = fecha.getMonth()
  const año = fecha.getFullYear()
  const primerDia = new Date(año, mes, 1).getDay()
  const ultimoDia = new Date(año, mes + 1, 0).getDate()
  const hoy = new Date().toISOString().split('T')[0]

  const dias = useMemo(() => {
    const result: (number | null)[] = []
    for (let i = 0; i < primerDia; i++) result.push(null)
    for (let d = 1; d <= ultimoDia; d++) result.push(d)
    return result
  }, [primerDia, ultimoDia])

  const cambiarMes = (delta: number) => setFecha(new Date(año, mes + delta, 1))

  return { dias, mes, año, hoy, cambiarMes }
}

// ============ COMPONENTES ============
function ProgressBar({ completados, total }: { completados: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((completados / total) * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-gray-400 font-bold tabular-nums w-8 text-right">{pct}%</span>
    </div>
  )
}

function HabitoCheck({ id, label, completado, onToggle, small }: {
  id: string; label: string; completado: boolean; onToggle: () => void; small?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 w-full text-left rounded-lg transition-all ${
        small ? 'px-2 py-1' : 'px-3 py-2'
      } ${
        completado
          ? 'bg-emerald-500/10 text-emerald-400'
          : 'bg-zinc-800/30 text-gray-500 hover:bg-zinc-700/30 hover:text-gray-400'
      }`}
    >
      <div className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
        completado ? 'border-emerald-500 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]' : 'border-zinc-600 bg-transparent'
      }`}>
        {completado && (
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-2.5 h-2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <span className={`text-xs font-medium truncate ${completado ? 'line-through opacity-60' : ''}`}>{label}</span>
    </button>
  )
}

// ============ COMPONENTE PRINCIPAL ============
export function HabitosTab() {
  const { habitosHoy, historial, loading, historialLoading, saving, guardar } = useHabitos()
  const { dias, mes, año, hoy, cambiarMes } = useCalendario()

  const [vista, setVista] = useState<'today' | 'calendario' | 'weekly'>('today')
  const [seleccionados, setSeleccionados] = useState<string[]>(habitosHoy?.habitos || [])

  // Sincronizar seleccionados con datos cargados
  useState(() => { if (habitosHoy) setSeleccionados(habitosHoy.habitos || []) })

  const toggle = async (id: string) => {
    const nuevos = seleccionados.includes(id) ? seleccionados.filter(h => h !== id) : [...seleccionados, id]
    setSeleccionados(nuevos)
    await guardar(nuevos)
  }

  const toggleHistorico = async (fecha: string, habitoId: string, habitosActuales: string[]) => {
    const nuevos = habitosActuales.includes(habitoId)
      ? habitosActuales.filter(h => h !== habitoId)
      : [...habitosActuales, habitoId]
    await guardar(nuevos, fecha)
  }

  // Mapa de historial por fecha para acceso rápido
  const historialMap = useMemo(() => {
    const map = new Map<string, HabitosDiarios>()
    for (const h of historial) map.set(h.fecha, h)
    return map
  }, [historial])

  const completadosHoy = seleccionados.length
  const totalHabitos = HABITOS_FIJOS.length

  // Métricas semanales para footer
  const metricasColumna = useMemo(() => {
    const counts: Record<string, number> = {}
    const total = historial.length || 1
    for (const h of historial) {
      for (const hab of h.habitos) {
        counts[hab] = (counts[hab] || 0) + 1
      }
    }
    return HABITOS_FIJOS.map(h => ({ id: h.id, pct: Math.round(((counts[h.id] || 0) / total) * 100) }))
  }, [historial])

  const vistas = [
    { id: 'today' as const, label: 'Today' },
    { id: 'calendario' as const, label: 'Calendario' },
    { id: 'weekly' as const, label: 'Weekly' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-blis-red animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header con ícono */}
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <CheckSquare className="w-4.5 h-4.5" />
        </div>
        <div>
          <h2 className="text-white font-black uppercase tracking-wider text-xs">Hábitos</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>

      {/* Sub-tabs: Today | Calendario | Weekly */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {vistas.map(v => (
          <button
            key={v.id}
            onClick={() => setVista(v.id)}
            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all whitespace-nowrap ${
              vista === v.id
                ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20'
                : 'bg-white/[0.03] text-gray-400 border border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* ===== VISTA TODAY ===== */}
      {vista === 'today' && (
        <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-white font-black uppercase tracking-wider text-[11px]">Today</h3>
          </div>
          <div className="p-4 space-y-4">
            {/* Grid de pills tipo Notion */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {HABITOS_FIJOS.map(h => {
                const active = seleccionados.includes(h.id)
                return (
                  <button
                    key={h.id}
                    onClick={() => toggle(h.id)}
                    disabled={saving}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all disabled:opacity-50 ${
                      active
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.12)]'
                        : 'bg-zinc-800/40 border-white/5 text-gray-400 hover:border-white/15 hover:bg-zinc-700/40'
                    }`}
                  >
                    <span className="text-xl leading-none">{h.icon}</span>
                    <span className="text-[11px] font-bold text-center leading-tight">{h.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Barra de progreso */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Progreso</span>
                <span className="text-[10px] text-emerald-400 font-black">{completadosHoy}/{totalHabitos}</span>
              </div>
              <ProgressBar completados={completadosHoy} total={totalHabitos} />
            </div>

            <p className="text-[10px] text-gray-600 text-center">Se guarda automáticamente al tocar un hábito</p>
          </div>
        </div>
      )}

      {/* ===== VISTA CALENDARIO ===== */}
      {vista === 'calendario' && (
        <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
          {/* Navegación del mes */}
          <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <button onClick={() => cambiarMes(-1)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="text-white font-black uppercase tracking-wider text-xs">{MESES[mes]} {año}</h3>
            <button onClick={() => cambiarMes(1)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Grid calendario */}
          <div className="p-3">
            {/* Días de la semana */}
            <div className="grid grid-cols-7 mb-1.5">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="text-center text-[9px] text-gray-500 font-bold uppercase tracking-wider py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {dias.map((d, i) => {
                if (d === null) return <div key={`empty-${i}`} className="aspect-square" />
                const fechaStr = `${año}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                const entry = historialMap.get(fechaStr)
                const isHoy = fechaStr === hoy
                const completados = entry?.habitos?.length || 0

                return (
                  <div key={fechaStr}
                    className={`rounded-xl p-1.5 border transition-colors ${
                      isHoy ? 'border-emerald-500/40 bg-emerald-500/5' : entry ? 'border-white/5 bg-white/[0.02]' : 'border-transparent bg-transparent'
                    }`}
                  >
                    <div className="text-center mb-1">
                      <span className={`text-[10px] font-black ${isHoy ? 'text-emerald-400' : entry ? 'text-white/70' : 'text-gray-600'}`}>
                        {d}
                      </span>
                    </div>
                    {entry && (
                      <div className="space-y-0.5 max-h-[120px] overflow-y-auto">
                        {HABITOS_FIJOS.map(h => {
                          const done = entry.habitos.includes(h.id)
                          return (
                            <HabitoCheck
                              key={h.id}
                              id={h.id}
                              label={h.label}
                              completado={done}
                              onToggle={() => toggleHistorico(fechaStr, h.id, entry.habitos)}
                              small
                            />
                          )
                        })}
                      </div>
                    )}
                    {entry && (
                      <div className="mt-1 pt-1 border-t border-white/5">
                        <ProgressBar completados={completados} total={totalHabitos} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== VISTA WEEKLY ===== */}
      {vista === 'weekly' && (
        <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-white font-black uppercase tracking-wider text-[11px]">Historial Semanal</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5 text-gray-500">
                  <th className="text-left py-3 px-3 font-bold uppercase tracking-wider text-[10px]">Día</th>
                  {HABITOS_FIJOS.map(h => (
                    <th key={h.id} className="text-center py-3 px-1 font-bold uppercase tracking-wider text-[10px]">
                      <span className="text-base block leading-none">{h.icon}</span>
                      <span className="sr-only">{h.label}</span>
                    </th>
                  ))}
                  <th className="text-right py-3 px-3 font-bold uppercase tracking-wider text-[10px] w-10">%</th>
                </tr>
              </thead>
              <tbody>
                {historialLoading ? (
                  <tr><td colSpan={10} className="text-center py-8"><Loader2 className="w-5 h-5 text-blis-red animate-spin mx-auto" /></td></tr>
                ) : historial.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-8 text-gray-500 text-xs">Sin datos. Registra tus hábitos en la vista Today.</td></tr>
                ) : (
                  historial.slice(0, 30).map(entry => {
                    const c = entry.habitos.length
                    const pct = Math.round((c / totalHabitos) * 100)
                    const fecha = new Date(entry.fecha + 'T12:00:00')
                    const diaLabel = entry.fecha === hoy ? 'Hoy' : `${DIAS_SEMANA[fecha.getDay()]} ${fecha.getDate()}`
                    return (
                      <tr key={entry.fecha} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black ${
                              c >= 6 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              c >= 3 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-zinc-800 text-gray-500 border border-white/5'
                            }`}>
                              {c}
                            </div>
                            <span className="text-white/70 font-bold truncate max-w-[70px]">{diaLabel}</span>
                          </div>
                        </td>
                        {HABITOS_FIJOS.map(h => {
                          const done = entry.habitos.includes(h.id)
                          return (
                            <td key={h.id} className="text-center py-2.5 px-1">
                              <button
                                onClick={() => toggleHistorico(entry.fecha, h.id, entry.habitos)}
                                disabled={saving}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-colors disabled:opacity-50 ${
                                  done ? 'border-emerald-500 bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.3)]' : 'border-zinc-700 bg-transparent hover:border-zinc-500'
                                }`}
                              >
                                {done && (
                                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </button>
                            </td>
                          )
                        })}
                        <td className="py-2.5 px-3 text-right">
                          <span className={`text-[10px] font-black tabular-nums ${pct >= 75 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-gray-500'}`}>
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
              {/* Footer con métricas */}
              {historial.length > 0 && (
                <tfoot>
                  <tr className="border-t border-white/10 bg-white/[0.01]">
                    <td className="py-3 px-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider">Promedio</td>
                    {metricasColumna.map(m => (
                      <td key={m.id} className="text-center py-3 px-1">
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-10 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500/60 rounded-full transition-all" style={{ width: `${m.pct}%` }} />
                          </div>
                          <span className="text-[9px] text-gray-500 font-bold tabular-nums">{m.pct}%</span>
                        </div>
                      </td>
                    ))}
                    <td className="py-3 px-3 text-right text-[9px] text-gray-500 font-bold">Hist.</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
