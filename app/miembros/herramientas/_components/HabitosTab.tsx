"use client"

import { useState } from 'react'
import { CheckSquare, Loader2, Save, CheckCircle2 } from 'lucide-react'
import { useHabitos } from '../_hooks/useHabitos'

const HABITOS_DISPONIBLES = [
  { id: 'meditar', label: 'Meditar', icon: '🧘' },
  { id: 'leer', label: 'Leer', icon: '📖' },
  { id: 'ejercicio', label: 'Ejercicio', icon: '🏃' },
  { id: 'dormir_bien', label: 'Dormir 7h+', icon: '😴' },
  { id: 'agua', label: 'Hidratación', icon: '💧' },
  { id: 'journal', label: 'Journaling', icon: '📝' },
  { id: 'no_alcohol', label: 'Sin alcohol', icon: '🚫' },
  { id: 'alimentacion', label: 'Comer sano', icon: '🥗' },
  { id: 'gratitud', label: 'Gratitud', icon: '🙏' },
  { id: 'estudio', label: 'Estudiar trading', icon: '📊' },
  { id: 'pantallas', label: 'Menos pantallas', icon: '📵' },
  { id: 'estirar', label: 'Estirar cuerpo', icon: '🤸' },
]

export function HabitosTab() {
  const { habitosHoy, loading, saving, lastSave, guardar, clearSaveStatus } = useHabitos()
  const [seleccionados, setSeleccionados] = useState<string[]>(habitosHoy?.habitos || [])
  const [guardado, setGuardado] = useState(false)

  const toggleHabito = async (id: string) => {
    const nuevos = seleccionados.includes(id)
      ? seleccionados.filter(h => h !== id)
      : [...seleccionados, id]
    setSeleccionados(nuevos)
    setGuardado(false)
    // Auto-guardar al togglear
    await guardar(nuevos)
    setGuardado(true)
    setTimeout(() => { clearSaveStatus(); setGuardado(false) }, 2500)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-blis-red animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Card */}
      <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-4 md:px-5 py-3.5 border-b border-white/5 bg-white/[0.02] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-white font-black uppercase tracking-wider text-xs">Hábitos Diarios</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>

        <div className="p-4 md:p-5">
          {/* Feedback sutil */}
          {guardado && lastSave === 'success' && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-bold mb-4">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Guardado
            </div>
          )}

          {/* Grid de hábitos - 2 cols en móvil, 4 en desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {HABITOS_DISPONIBLES.map(h => {
              const isActive = seleccionados.includes(h.id)
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => toggleHabito(h.id)}
                  disabled={saving}
                  className={`flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border-2 transition-all disabled:opacity-50 ${
                    isActive
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.12)]'
                      : 'bg-zinc-800/40 border-white/5 text-gray-400 hover:border-white/15 hover:bg-zinc-700/40'
                  }`}
                >
                  <span className="text-2xl leading-none">{h.icon}</span>
                  <span className="text-[11px] font-bold text-center leading-tight">{h.label}</span>
                </button>
              )
            })}
          </div>

          <p className="text-[10px] text-gray-600 text-center mt-4">
            Toca un hábito para marcarlo — se guarda automáticamente
          </p>
        </div>
      </div>
    </div>
  )
}
