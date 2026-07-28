"use client"

import { useState, useMemo, useEffect } from 'react'
import { Loader2, CheckSquare, TrendingUp, Settings, Plus, Trash2, X } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { useChecklist, type ChecklistPersonalizado } from '../_hooks/useChecklist'

const ICONS = ['✅','🌅','📊','📝','🌙','🚿','🥤','🙏','📋','⚔️','📰','🚫','📈','🔔','📚','🏋️','📖','🧘','😴','▶️','🎧','📜','📱']

const SECCIONES = ['Pre-Session (Antes)', 'In-Session (En Sesión)', 'Post-Session (Después)', 'End of Day (Fuera Del Trading)']

const PERIODS = [{ id: '7d', label: '7 Días' },{ id: '30d', label: '30 Días' },{ id: '90d', label: '90 Días' }]

function ProgressBar({ pct, completados, total }: { pct: number; completados: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-black text-emerald-400 tabular-nums">{pct}%</span>
      <span className="text-[10px] text-gray-500 tabular-nums">({completados}/{total})</span>
    </div>
  )
}

function CheckItem({ label, done, onToggle, saving }: { label: string; done: boolean; onToggle: () => void; saving: boolean }) {
  return (
    <button onClick={onToggle} disabled={saving} className="flex items-start gap-3 w-full text-left py-2.5 group disabled:opacity-60">
      <div className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-all ${
        done ? 'border-emerald-500 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]' : 'border-zinc-700 bg-transparent group-hover:border-zinc-500'
      }`}>
        {done && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12" /></svg>}
      </div>
      <span className={`text-sm leading-snug flex-1 ${done ? 'text-gray-500 line-through' : 'text-gray-300 group-hover:text-white'}`}>{label}</span>
    </button>
  )
}

export function ChecklistTab() {
  const { checklistHoy, historial, loading, saving, toggleItem, fetchHistorial, config, fetchConfig } = useChecklist()
  const [periodo, setPeriodo] = useState('30d')
  const [showConfig, setShowConfig] = useState(false)
  const [nuevoLabel, setNuevoLabel] = useState('')
  const [nuevoIcon, setNuevoIcon] = useState('✅')
  const [nuevaSeccion, setNuevaSeccion] = useState(SECCIONES[0])

  const items = checklistHoy?.items || {}
  const activos = useMemo(() => config.filter(c => c.activo), [config])
  const completados = Object.values(items).filter(v => v === true).length
  const total = activos.length || 17
  const pct = checklistHoy?.score_cumplimiento || 0

  const chartData = historial.map((e: any) => ({ fecha: new Date(e.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }), score: e.score_cumplimiento || 0 }))

  const sectionsGrouped = useMemo(() => {
    const groups: Record<string, ChecklistPersonalizado[]> = {}
    for (const item of activos) {
      if (!groups[item.seccion]) groups[item.seccion] = []
      groups[item.seccion].push(item)
    }
    return groups
  }, [activos])

  const toggleActivo = async (item: ChecklistPersonalizado) => {
    await fetch('/api/miembros/checklist/personalizado', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, activo: !item.activo }) })
    await fetchConfig()
  }

  const addItem = async () => {
    if (!nuevoLabel.trim()) return
    await fetch('/api/miembros/checklist/personalizado', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: (config[0] as any)?.user_id, label: nuevoLabel.trim(), seccion: nuevaSeccion, icon: nuevoIcon, activo: true }) })
    setNuevoLabel('')
    await fetchConfig()
  }

  const deleteItem = async (id: string) => {
    await fetch(`/api/miembros/checklist/personalizado?id=${id}`, { method: 'DELETE' })
    await fetchConfig()
  }

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-blis-red animate-spin" /></div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0"><CheckSquare className="w-4.5 h-4.5" /></div>
          <div>
            <h2 className="text-white font-black uppercase tracking-wider text-xs">Lista de Procesos</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
          </div>
        </div>
        <button onClick={() => setShowConfig(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white text-xs transition-colors">
          <Settings className="w-3.5 h-3.5" /> Personalizar
        </button>
      </div>

      {/* Progress bar */}
      <div className="bg-zinc-950 border border-white/5 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-2"><span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cumplimiento del Día</span></div>
        <ProgressBar pct={pct} completados={completados} total={total} />
      </div>

      {/* Stations */}
      <div className="space-y-4">
        {Object.entries(sectionsGrouped).map(([seccion, items]) => {
          const sectionCompletados = items.filter(i => checklistHoy?.items?.[i.label] === true).length
          const icons: Record<string, string> = { 'Pre-Session (Antes)': '🌅', 'In-Session (En Sesión)': '📊', 'Post-Session (Después)': '📝', 'End of Day (Fuera Del Trading)': '🌙' }
          return (
            <div key={seccion} className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center gap-2.5">
                <span className="text-lg">{icons[seccion] || '✅'}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-black uppercase tracking-wider text-[11px]">{seccion}</h3>
                  <p className="text-[10px] text-gray-500">{sectionCompletados}/{items.length} completados</p>
                </div>
              </div>
              <div className="px-4 py-1 divide-y divide-white/[0.03]">
                {items.map(item => (
                  <CheckItem key={item.label} label={item.label} done={checklistHoy?.items?.[item.label] === true} onToggle={() => toggleItem(item.label)} saving={saving} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart */}
      <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400" /><h3 className="text-white font-black uppercase tracking-wider text-[11px]">Cumplimiento</h3></div>
          <div className="flex gap-1">{PERIODS.map(p => <button key={p.id} onClick={() => { setPeriodo(p.id); fetchHistorial(p.id) }} className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider ${periodo === p.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/[0.03] text-gray-500 border border-white/5 hover:text-gray-300'}`}>{p.label}</button>)}</div>
        </div>
        <div className="p-3">
          {chartData.length === 0 ? <div className="text-center py-16"><TrendingUp className="w-8 h-8 text-gray-700 mx-auto mb-2" /><p className="text-gray-500 text-xs">Completa tareas para ver tu progreso</p></div> : (
            <div className="h-[280px] md:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs><linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.25} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
                  <XAxis dataKey="fecha" stroke="#52525b" tick={{ fontSize: 10, fontWeight: 700 }} />
                  <YAxis stroke="#52525b" tick={{ fontSize: 10 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0.75rem', fontSize: '12px' }} formatter={(value) => [`${value}%`, 'Cumplimiento']} />
                  <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} fill="url(#scoreGrad)" dot={{ r: 2, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* MODAL PERSONALIZACIÓN */}
      {showConfig && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowConfig(false)} />
          <div className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-white font-black text-sm">Personalizar Lista</h3>
              <button onClick={() => setShowConfig(false)} className="p-1 hover:bg-white/5 rounded text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-2 overflow-y-auto flex-1">
              {config.map(c => (
                <div key={c.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/[0.02]">
                  <button onClick={() => toggleActivo(c)} className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${c.activo ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-600 bg-transparent'}`}>
                    {c.activo && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12" /></svg>}
                  </button>
                  <span className="text-lg shrink-0">{c.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm truncate block ${c.activo ? 'text-white' : 'text-gray-600 line-through'}`}>{c.label}</span>
                    <span className="text-[9px] text-gray-600">{c.seccion}</span>
                  </div>
                  <button onClick={() => deleteItem(c.id)} className="p-1 hover:bg-red-500/10 rounded text-gray-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-white/5 space-y-2">
              <div className="flex gap-1">
                <select value={nuevoIcon} onChange={e => setNuevoIcon(e.target.value)} className="bg-zinc-800 border border-white/10 rounded-lg px-2 py-2 text-sm">{ICONS.map(i => <option key={i} value={i}>{i}</option>)}</select>
                <select value={nuevaSeccion} onChange={e => setNuevaSeccion(e.target.value)} className="bg-zinc-800 border border-white/10 rounded-lg px-2 py-2 text-sm flex-1">{SECCIONES.map(s => <option key={s} value={s}>{s}</option>)}</select>
              </div>
              <div className="flex gap-2">
                <input value={nuevoLabel} onChange={e => setNuevoLabel(e.target.value)} placeholder="Nuevo ítem" onKeyDown={e => e.key === 'Enter' && addItem()}
                  className="flex-1 bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blis-red/50" />
                <button onClick={addItem} disabled={!nuevoLabel.trim()} className="px-3 py-2 bg-blis-red/15 border border-blis-red/30 text-blis-red rounded-lg text-xs font-bold hover:bg-blis-red/25 disabled:opacity-50"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
