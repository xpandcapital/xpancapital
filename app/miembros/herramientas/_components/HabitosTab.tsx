"use client"

import { useState, useMemo, useEffect } from 'react'
import { Loader2, CheckSquare, CheckCircle2, Plus, Trash2, Settings, X } from 'lucide-react'
import { useHabitos, type HabitoPersonalizado } from '../_hooks/useHabitos'
import type { HabitosDiarios } from '../_hooks/useHabitos'

const ICONS = ['✅', '🧘', '📖', '🏃', '😴', '💧', '📝', '🚫', '🥗', '🙏', '📊', '📵', '🤸', '🎯', '💪', '🔥', '▶️', '🎧', '📜', '🏋️', '📰', '📈', '🔔', '📚', '⚔️', '🚿', '🥤', '📋']

function ProgressBar({ completados, total }: { completados: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((completados / total) * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-gray-400 font-bold tabular-nums w-8 text-right">{pct}%</span>
    </div>
  )
}

export function HabitosTab() {
  const { habitosHoy, historial, loading, historialLoading, saving, guardar, habitosConfig, fetchConfig } = useHabitos()
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [vista, setVista] = useState<'today' | 'calendario' | 'weekly'>('today')
  const [showConfig, setShowConfig] = useState(false)
  const [nuevoLabel, setNuevoLabel] = useState('')
  const [nuevoIcon, setNuevoIcon] = useState('✅')

  useEffect(() => {
    if (habitosHoy) setSeleccionados(habitosHoy.habitos || [])
  }, [habitosHoy])

  const habitosActivos = useMemo(() => habitosConfig.filter(h => h.activo), [habitosConfig])

  const toggle = async (id: string) => {
    const nuevos = seleccionados.includes(id) ? seleccionados.filter(h => h !== id) : [...seleccionados, id]
    setSeleccionados(nuevos)
    await guardar(nuevos)
  }

  const toggleHistorico = async (fecha: string, habitoId: string, habitosActuales: string[]) => {
    const nuevos = habitosActuales.includes(habitoId) ? habitosActuales.filter(h => h !== habitoId) : [...habitosActuales, habitoId]
    await guardar(nuevos, fecha)
  }

  const toggleActivo = async (habito: HabitoPersonalizado) => {
    await fetch('/api/miembros/habitos/personalizados', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: habito.id, activo: !habito.activo }),
    })
    await fetchConfig()
  }

  const addHabito = async () => {
    if (!nuevoLabel.trim()) return
    await fetch('/api/miembros/habitos/personalizados', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: (habitosConfig[0] as any)?.user_id, label: nuevoLabel.trim(), icon: nuevoIcon, activo: true }),
    })
    setNuevoLabel('')
    await fetchConfig()
  }

  const deleteHabito = async (id: string) => {
    await fetch(`/api/miembros/habitos/personalizados?id=${id}`, { method: 'DELETE' })
    await fetchConfig()
  }

  const completadosHoy = useMemo(() => {
    return habitosActivos.filter(h => seleccionados.includes(h.label)).length
  }, [habitosActivos, seleccionados])

  const historialMap = useMemo(() => {
    const map = new Map<string, HabitosDiarios>()
    for (const h of historial) map.set(h.fecha, h)
    return map
  }, [historial])

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-blis-red animate-spin" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
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
        <button onClick={() => setShowConfig(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white text-xs transition-colors">
          <Settings className="w-3.5 h-3.5" /> Personalizar
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1.5">
        {['today','calendario','weekly'].map(v => (
          <button key={v} onClick={() => setVista(v as any)} className={`px-3 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wider ${vista === v ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20' : 'bg-white/[0.03] text-gray-400 border border-white/5 hover:border-white/10 hover:text-white'}`}>
            {v === 'today' ? 'Today' : v === 'calendario' ? 'Calendario' : 'Weekly'}
          </button>
        ))}
      </div>

      {/* ===== VISTA TODAY ===== */}
      {vista === 'today' && (
        <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]"><h3 className="text-white font-black uppercase tracking-wider text-[11px]">Today</h3></div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {habitosActivos.map(h => {
                const active = seleccionados.includes(h.label)
                return (
                  <button key={h.label} onClick={() => toggle(h.label)} disabled={saving}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all disabled:opacity-50 ${
                      active ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.12)]' : 'bg-zinc-800/40 border-white/5 text-gray-400 hover:border-white/15 hover:bg-zinc-700/40'
                    }`}>
                    <span className="text-xl leading-none">{h.icon}</span>
                    <span className="text-[11px] font-bold text-center leading-tight">{h.label}</span>
                  </button>
                )
              })}
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Progreso</span>
                <span className="text-[10px] text-emerald-400 font-black">{completadosHoy}/{habitosActivos.length}</span>
              </div>
              <ProgressBar completados={completadosHoy} total={habitosActivos.length} />
            </div>
            <p className="text-[10px] text-gray-600 text-center">Se guarda automáticamente al tocar un hábito</p>
          </div>
        </div>
      )}

      {/* ===== VISTA CALENDARIO ===== */}
      {vista === 'calendario' && (
        <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]"><h3 className="text-white font-black uppercase tracking-wider text-[11px]">Calendario</h3></div>
          <div className="p-4">
            {historialLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-500" /></div>
            ) : !historial.length ? (
              <div className="text-center py-12 text-gray-500 text-xs">Sin registros de hábitos aún</div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {historial.filter(h => h.habitos?.length > 0).slice(0, 30).map(h => {
                  const fecha = new Date(h.fecha + 'T12:00:00')
                  const completados = habitosActivos.filter(ha => h.habitos?.includes(ha.label)).length
                  const pct = habitosActivos.length ? Math.round((completados / habitosActivos.length) * 100) : 0
                  return (
                    <div key={h.fecha} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02]">
                      <span className="text-[10px] text-gray-500 w-16 shrink-0">{fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-400 w-8 text-right">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== VISTA WEEKLY ===== */}
      {vista === 'weekly' && (
        <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]"><h3 className="text-white font-black uppercase tracking-wider text-[11px]">Resumen Semanal</h3></div>
          <div className="p-4">
            {historialLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-500" /></div>
            ) : !historial.length ? (
              <div className="text-center py-12 text-gray-500 text-xs">Sin registros de hábitos aún</div>
            ) : (
              <div className="space-y-3">
                {(() => {
                  const weeks: Record<string, HabitosDiarios[]> = {}
                  for (const h of historial) {
                    const d = new Date(h.fecha + 'T12:00:00')
                    const weekStart = new Date(d)
                    weekStart.setDate(d.getDate() - d.getDay())
                    const key = weekStart.toISOString().split('T')[0]
                    if (!weeks[key]) weeks[key] = []
                    weeks[key].push(h)
                  }
                  return Object.entries(weeks).slice(0, 12).map(([weekStart, days]) => {
                    const avgPct = Math.round(days.reduce((sum, d) => {
                      const c = habitosActivos.filter(ha => d.habitos?.includes(ha.label)).length
                      return sum + (habitosActivos.length ? (c / habitosActivos.length) * 100 : 0)
                    }, 0) / days.length)
                    return (
                      <div key={weekStart} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]">
                        <span className="text-[10px] text-gray-400 w-28 shrink-0">Sem. {new Date(weekStart + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${avgPct >= 80 ? 'bg-emerald-500' : avgPct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${avgPct}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-400 w-8 text-right">{avgPct}%</span>
                        <span className="text-[10px] text-gray-600">{days.length}d</span>
                      </div>
                    )
                  })
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== MODAL PERSONALIZACIÓN ===== */}
      {showConfig && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowConfig(false)} />
          <div className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-white font-black text-sm">Personalizar Hábitos</h3>
              <button onClick={() => setShowConfig(false)} className="p-1 hover:bg-white/5 rounded text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-2 overflow-y-auto flex-1">
              {habitosConfig.map(h => (
                <div key={h.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/[0.02]">
                  <button onClick={() => toggleActivo(h)} className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${h.activo ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-600 bg-transparent'}`}>
                    {h.activo && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12" /></svg>}
                  </button>
                  <span className="text-lg shrink-0">{h.icon}</span>
                  <span className={`text-sm flex-1 truncate ${h.activo ? 'text-white' : 'text-gray-600 line-through'}`}>{h.label}</span>
                  <button onClick={() => deleteHabito(h.id)} className="p-1 hover:bg-red-500/10 rounded text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-white/5 flex gap-2">
              <div className="flex-1 flex gap-1">
                <select value={nuevoIcon} onChange={e => setNuevoIcon(e.target.value)} className="bg-zinc-800 border border-white/10 rounded-lg px-2 py-2 text-sm">
                  {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                <input value={nuevoLabel} onChange={e => setNuevoLabel(e.target.value)} placeholder="Nuevo hábito" onKeyDown={e => e.key === 'Enter' && addHabito()}
                  className="flex-1 bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blis-red/50" />
              </div>
              <button onClick={addHabito} disabled={!nuevoLabel.trim()} className="px-3 py-2 bg-blis-red/15 border border-blis-red/30 text-blis-red rounded-lg text-xs font-bold hover:bg-blis-red/25 disabled:opacity-50">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
