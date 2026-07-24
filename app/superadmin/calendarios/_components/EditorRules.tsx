"use client"

import { useState, useEffect } from 'react'
import type { Calendario } from '../_types'
import type { useCalendarEditor } from '../_hooks/useCalendarEditor'
import { SearchableSelect } from '@/components/ui/SearchableSelect'

type Editor = ReturnType<typeof useCalendarEditor>

const inputClass = "w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 outline-none focus:border-blis-red transition-colors text-sm"

export function EditorRules({ editor }: { editor: Editor }) {
  const { formData, updateField } = editor
  const [campanas, setCampanas] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/campanas').then(r => r.json()).then(d => setCampanas(d.data || [])).catch(() => {})
  }, [])

  return (
    <div className="p-8">
      <div className="border-b border-white/5 pb-4 mb-8">
        <h2 className="text-2xl font-black text-white uppercase tracking-wide">Reglas de reserva</h2>
        <p className="text-white/40 text-sm mt-1">Configura duraciones y márgenes para tus reuniones.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
            Duración (minutos)
          </label>
          <input type="number" value={formData.duracion}
            onChange={e => updateField('duracion', parseInt(e.target.value) || 30)}
            className="w-full" buttonClassName={inputClass} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
            Intervalo de visualización
          </label>
          <input type="number" value={formData.intervalo}
            onChange={e => updateField('intervalo', parseInt(e.target.value) || 30)}
            className="w-full" buttonClassName={inputClass} />
          <p className="text-[11px] text-white/30 mt-2">
            Ej. Opciones cada {formData.intervalo} min.
          </p>
        </div>
      </div>

      <div className="bg-white/[0.02] p-8 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">
          Condiciones de programación
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-white/40 mb-2">
              Aviso mínimo de programación (Horas)
            </label>
            <input type="number" value={formData.aviso_minimo}
              onChange={e => updateField('aviso_minimo', parseInt(e.target.value) || 4)}
              className="w-full md:w-1/2 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 outline-none focus:border-blis-red" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
            <div>
              <label className="block text-[10px] font-bold text-white/40 mb-2">
                Margen antes (Min)
              </label>
              <input type="number" value={formData.buffer_antes}
                onChange={e => updateField('buffer_antes', parseInt(e.target.value) || 0)}
                className="w-full" buttonClassName={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-white/40 mb-2">
                Margen después (Min)
              </label>
              <input type="number" value={formData.buffer_despues}
                onChange={e => updateField('buffer_despues', parseInt(e.target.value) || 0)}
                className="w-full" buttonClassName={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                Audiencia
              </label>
              <SearchableSelect
                value={formData.audiencia_tipo}
                onChange={v => updateField('audiencia_tipo', v as Calendario['audiencia_tipo'])}
                options={[
                  { value: 'publico', label: 'Público general' },
                  { value: 'leads_campana', label: 'Leads de campaña' },
                  { value: 'postulantes', label: 'Postulantes' },
                  { value: 'equipo', label: 'Equipo interno' },
                  { value: 'especifico', label: 'Específico' },
                ]}
                className="w-full" buttonClassName={inputClass}
              />
            </div>
            <div className="w-full">
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                Campaña asociada
              </label>
              <SearchableSelect
                value={formData.campana_id || ''}
                onChange={v => updateField('campana_id', v)}
                options={campanas.map((c: any) => ({ value: c.id, label: c.nombre }))}
                placeholder="Sin campaña"
                searchPlaceholder="Buscar campaña..."
                emptyText="Sin campañas"
                className="w-full" buttonClassName={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                Texto del botón
              </label>
              <input type="text" value={formData.texto_boton}
                onChange={e => updateField('texto_boton', e.target.value)}
                className="w-full" buttonClassName={inputClass} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}