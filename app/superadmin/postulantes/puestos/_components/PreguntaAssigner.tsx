"use client"

import { useState } from 'react'
import { Check, Copy, Save } from 'lucide-react'
import { Pregunta, PuestoPregunta } from '../../_types'
import { TIPO_PREGUNTA_LABELS } from '../../_types'
import { SearchableSelect } from "@/components/ui/SearchableSelect"

interface PreguntaAssignerProps {
  grupos: string[]
  preguntas: Pregunta[]
  selectedPP: PuestoPregunta[]
  puestoId: string
  onToggle: (preguntaId: string, checked: boolean) => PuestoPregunta[]
  onUpdatePregunta: (preguntaId: string, field: string, value: any) => void
  onSave: (puestoId: string, questions: PuestoPregunta[]) => Promise<boolean>
  onCopyFrom: (targetId: string, sourceId: string) => PuestoPregunta[]
  puestos: { id: string; nombre: string }[]
  saving: boolean
}

export function PreguntaAssigner({
  grupos, preguntas, selectedPP, puestoId,
  onToggle, onUpdatePregunta, onSave, onCopyFrom, puestos, saving,
}: PreguntaAssignerProps) {
  const [copyFrom, setCopyFrom] = useState('')
  const [localSaving, setLocalSaving] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})

  const handleSave = async () => {
    setLocalSaving(true)
    await onSave(puestoId, selectedPP)
    setLocalSaving(false)
  }

  const handleCopy = async () => {
    if (!copyFrom) return
    const newQuestions = onCopyFrom(puestoId, copyFrom)
    setLocalSaving(true)
    await onSave(puestoId, newQuestions)
    setLocalSaving(false)
    setCopyFrom('')
  }

  const toggleGroup = (grupo: string) => {
    setCollapsedGroups(prev => ({ ...prev, [grupo]: !prev[grupo] }))
  }

  const assignedCount = selectedPP.length
  const visibleCount = selectedPP.filter(pp => pp.visible_formulario).length

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            <span className="text-emerald-400 font-bold">{visibleCount}</span> públicas · <span className="text-white font-bold">{assignedCount}</span> total
          </span>
          <SearchableSelect
            value={copyFrom}
            onChange={setCopyFrom}
            options={puestos.filter(p => p.id !== puestoId).map(p => ({ value: p.id, label: p.nombre }))}
            placeholder="Copiar preguntas de..."
            className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-gray-300 text-xs focus:outline-none focus:border-blis-red/50"
          />
          {copyFrom && (
            <button onClick={handleCopy} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-bold hover:bg-blue-500/20 transition-colors flex items-center gap-1">
              <Copy className="w-3 h-3" />Aplicar
            </button>
          )}
        </div>
        <button
          onClick={handleSave} disabled={localSaving || saving}
          className="bg-blis-red text-white px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_10px_20px_rgba(213,193,8,0.3)]"
        >
          <Save className="w-4 h-4" />{localSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {grupos.map(grupo => {
        const groupPreguntas = preguntas.filter(p => p.grupo === grupo)
        if (groupPreguntas.length === 0) return null
        const isCollapsed = collapsedGroups[grupo]
        const assignedInGroup = groupPreguntas.filter(p => selectedPP.some(pp => pp.pregunta_id === p.id)).length

        return (
          <div key={grupo} className="bg-zinc-950 border border-white/5 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleGroup(grupo)}
              className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-blis-red bg-blis-red/10 rounded-md px-2 py-1">{assignedInGroup}/{groupPreguntas.length}</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">{grupo}</h3>
              </div>
              <span className="text-gray-600 text-xs">{isCollapsed ? '▶' : '▼'}</span>
            </button>

            {!isCollapsed && (
              <div className="px-4 pb-4 space-y-2">
                {groupPreguntas.map(pregunta => {
                  const pp = selectedPP.find(p => p.pregunta_id === pregunta.id)
                  const isAssigned = !!pp
                  return (
                    <div key={pregunta.id} className={`p-3 rounded-xl border transition-all ${isAssigned ? 'bg-white/[0.02] border-white/10' : 'border-white/5 opacity-50'}`}>
                      <div className="flex items-start gap-3">
                        <label className="relative inline-flex items-center cursor-pointer mt-1 shrink-0">
                          <input type="checkbox" checked={isAssigned} onChange={e => onToggle(pregunta.id, e.target.checked)} className="sr-only peer" />
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isAssigned ? 'bg-blis-red border-blis-red text-white' : 'border-white/20 bg-transparent'}`}>
                            {isAssigned && <Check className="w-3 h-3" />}
                          </div>
                        </label>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className={`text-sm font-bold ${isAssigned ? 'text-white' : 'text-gray-500'}`}>{pregunta.label_base}</p>
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500 font-mono">{pregunta.key}</span>
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-blis-red/10 text-blis-red">{TIPO_PREGUNTA_LABELS[pregunta.tipo] || pregunta.tipo}</span>
                            {pregunta.requerido && <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">req</span>}
                          </div>
                          {isAssigned && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                              <input
                                type="text" value={pp?.label_publico || ''}
                                onChange={e => onUpdatePregunta(pregunta.id, 'label_publico', e.target.value)}
                                className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blis-red/50"
                              />
                              <input
                                type="text" value={pp?.texto_apoyo_publico || ''}
                                onChange={e => onUpdatePregunta(pregunta.id, 'texto_apoyo_publico', e.target.value)}
                                className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blis-red/50"
                              />
                            </div>
                          )}
                        </div>
                        {isAssigned && (
                          <div className="flex items-center gap-2 shrink-0">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input type="checkbox" checked={pp?.visible_formulario ?? true} onChange={e => onUpdatePregunta(pregunta.id, 'visible_formulario', e.target.checked)} className="w-3 h-3 rounded" />
                              <span className="text-[9px] text-gray-500">Público</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input type="checkbox" checked={pp?.requerido ?? false} onChange={e => onUpdatePregunta(pregunta.id, 'requerido', e.target.checked)} className="w-3 h-3 rounded" />
                              <span className="text-[9px] text-gray-500">Req.</span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
