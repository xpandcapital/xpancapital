"use client"

import { useState, useMemo } from 'react'
import { Loader2, CheckSquare, TrendingUp } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useChecklist } from '../_hooks/useChecklist'

const CHECKLIST_ITEMS = [
  {
    title: 'Pre-Session (Antes)',
    icon: '🌅',
    items: [
      { id: 'despierta_4am', label: 'Despierta a las 4:00 AM Constantemente' },
      { id: 'ducha_fria', label: 'Tomar una Ducha Fría' },
      { id: 'batido_verde', label: 'Batido Verde + Café + Suplementos' },
      { id: 'orar_30min', label: 'Orar por 30 Minutos' },
      { id: 'revisar_eod', label: 'Revisar análisis EOD del día anterior...' },
      { id: 'lucha_huida', label: 'Comprobación de lucha o huida' },
    ],
  },
  {
    title: 'In-Session (En Sesión)',
    icon: '📊',
    items: [
      { id: 'noticias_impacto', label: 'Consulta de Noticias de Alto Impacto' },
      { id: 'eliminar_distracciones', label: 'Elimine y Minimice las Distracciones' },
      { id: 'marcas_graficos', label: 'Marcas de Gráficos Frescas Cada Mañana' },
      { id: 'alertas_sesion', label: 'Establezca Alertas + Sesión Comercial con Distracciones Mínimas' },
      { id: 'journal_trades', label: 'Journal Trades in Notion (Pros/Cons) + Diario en Papel' },
    ],
  },
  {
    title: 'Post-Session (Después)',
    icon: '📝',
    items: [
      { id: 'informe_diario', label: 'Informe Diario + Entrada de Diario en Papel Posterior a la Sesión' },
      { id: 'estudio_contenido', label: 'Estudio (Contenido de Video / Estudios de Casos...)' },
      { id: 'gym_estiramientos', label: 'Gym / Estiramientos + Batido de Proteínas' },
      { id: 'leer_30_60min', label: 'Leer durante 30-60 minutos' },
    ],
  },
  {
    title: 'End of Day (Fuera Del Trading)',
    icon: '🌙',
    items: [
      { id: 'relax_1_2horas', label: 'Asigne 1-2 horas para Relajarse' },
      { id: 'cama_9pm', label: 'En la Cama a las 9:00 p.m. en Punto' },
    ],
  },
]

const PERIODS = [
  { id: '7d', label: '7 Días' },
  { id: '30d', label: '30 Días' },
  { id: '90d', label: '90 Días' },
]

function ProgressBar({ pct, completados, total }: { pct: number; completados: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-black text-emerald-400 tabular-nums">{pct}%</span>
      <span className="text-[10px] text-gray-500 tabular-nums">({completados}/{total})</span>
    </div>
  )
}

function CheckItem({ label, done, onToggle, saving }: {
  label: string; done: boolean; onToggle: () => void; saving: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={saving}
      className="flex items-start gap-3 w-full text-left py-2.5 group disabled:opacity-60"
    >
      <div className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-all ${
        done
          ? 'border-emerald-500 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]'
          : 'border-zinc-700 bg-transparent group-hover:border-zinc-500'
      }`}>
        {done && (
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <span className={`text-sm leading-snug flex-1 ${done ? 'text-gray-500 line-through' : 'text-gray-300 group-hover:text-white'}`}>
        {label}
      </span>
    </button>
  )
}

export function ChecklistTab() {
  const { checklistHoy, historial, loading, saving, toggleItem, fetchHistorial } = useChecklist()
  const [periodo, setPeriodo] = useState('30d')

  const items = checklistHoy?.items || {}
  const completados = Object.values(items).filter(v => v === true).length
  const total = 17
  const pct = checklistHoy?.score_cumplimiento || 0

  const chartData = historial.map((e: any) => ({
    fecha: new Date(e.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    score: e.score_cumplimiento || 0,
  }))

  const handlePeriodoChange = (p: string) => {
    setPeriodo(p)
    fetchHistorial(p)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-blis-red animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <CheckSquare className="w-4.5 h-4.5" />
        </div>
        <div>
          <h2 className="text-white font-black uppercase tracking-wider text-xs">Lista de Procesos</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>

      {/* Barra de progreso general */}
      <div className="bg-zinc-950 border border-white/5 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cumplimiento del Día</span>
        </div>
        <ProgressBar pct={pct} completados={completados} total={total} />
      </div>

      {/* Estaciones */}
      <div className="space-y-4">
        {CHECKLIST_ITEMS.map(section => {
          const sectionCompletados = section.items.filter(i => items[i.id] === true).length
          return (
            <div key={section.title} className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center gap-2.5">
                <span className="text-lg">{section.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-black uppercase tracking-wider text-[11px]">{section.title}</h3>
                  <p className="text-[10px] text-gray-500">
                    {sectionCompletados}/{section.items.length} completados
                  </p>
                </div>
              </div>
              <div className="px-4 py-1 divide-y divide-white/[0.03]">
                {section.items.map(item => (
                  <CheckItem
                    key={item.id}
                    label={item.label}
                    done={items[item.id] === true}
                    onToggle={() => toggleItem(item.id)}
                    saving={saving}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Gráfica */}
      <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-white font-black uppercase tracking-wider text-[11px]">Cumplimiento</h3>
          </div>
          <div className="flex gap-1">
            {PERIODS.map(p => (
              <button
                key={p.id}
                onClick={() => handlePeriodoChange(p.id)}
                className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider transition-all ${
                  periodo === p.id
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/[0.03] text-gray-500 border border-white/5 hover:text-gray-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-3">
          {chartData.length === 0 ? (
            <div className="text-center py-16">
              <TrendingUp className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-gray-500 text-xs">Completa tareas para ver tu progreso</p>
            </div>
          ) : (
            <div className="h-[280px] md:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
                  <XAxis dataKey="fecha" stroke="#52525b" tick={{ fontSize: 10, fontWeight: 700 }} />
                  <YAxis stroke="#52525b" tick={{ fontSize: 10 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0.75rem', fontSize: '12px' }}
                    labelStyle={{ color: '#a1a1aa', fontWeight: 700, fontSize: 11 }}
                    formatter={(value) => [`${value}%`, 'Cumplimiento']}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    name="Cumplimiento"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#scoreGrad)"
                    dot={{ r: 2, fill: '#10b981', strokeWidth: 0 }}
                    activeDot={{ r: 4, fill: '#10b981' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
