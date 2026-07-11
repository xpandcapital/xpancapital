"use client"

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Calendario, WeekSchedule } from '../_types'
import type { useCalendarEditor } from '../_hooks/useCalendarEditor'

type Editor = ReturnType<typeof useCalendarEditor>

const daysOfWeek: { key: keyof WeekSchedule; label: string }[] = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
]

function ToggleOn() {
  return (
    <svg width="28" height="16" viewBox="0 0 28 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="16" rx="8" fill="#d5c108"/>
      <circle cx="20" cy="8" r="6" fill="white"/>
    </svg>
  )
}

function ToggleOff() {
  return (
    <svg width="28" height="16" viewBox="0 0 28 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="16" rx="8" fill="#333"/>
      <circle cx="8" cy="8" r="6" fill="#666"/>
    </svg>
  )
}

export function EditorSchedule({ editor }: { editor: Editor }) {
  const { formData, updateField, updateDaySchedule, addSpecificDate, removeSpecificDate } = editor
  const [newDate, setNewDate] = useState({ date: '', start: '09:00', end: '17:00' })

  const isWeekly = formData.tipo_horario !== 'especifico'

  return (
    <div className="p-8">
      <div className="border-b border-white/5 pb-4 mb-8">
        <h2 className="text-2xl font-black text-white uppercase tracking-wide">Horarios de Trabajo</h2>
        <p className="text-white/40 text-sm mt-1">Establece tu disponibilidad para este evento.</p>
      </div>

      <div className="mb-8 p-6 bg-white/[0.02] border border-white/5 rounded-xl">
        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">
          Modo de Disponibilidad
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          <label className={`flex-1 flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
            isWeekly ? 'border-blis-red bg-blis-red/10' : 'border-white/10 bg-white/[0.02] hover:border-white/20'
          }`}>
            <input type="radio" name="scheduleType" checked={isWeekly}
              onChange={() => updateField('tipo_horario', 'semanal')}
              className="w-4 h-4 accent-blis-red" />
            <div>
              <span className="block font-bold text-sm text-white">Recurrente (Semanal)</span>
              <span className="block text-[11px] text-white/40 mt-1">Disponibilidad repite todas las semanas.</span>
            </div>
          </label>
          <label className={`flex-1 flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
            !isWeekly ? 'border-blis-red bg-blis-red/10' : 'border-white/10 bg-white/[0.02] hover:border-white/20'
          }`}>
            <input type="radio" name="scheduleType" checked={!isWeekly}
              onChange={() => updateField('tipo_horario', 'especifico')}
              className="w-4 h-4 accent-blis-red" />
            <div>
              <span className="block font-bold text-sm text-white">Fechas específicas</span>
              <span className="block text-[11px] text-white/40 mt-1">Bloquea todo excepto fechas configuradas.</span>
            </div>
          </label>
        </div>
      </div>

      <div className={`space-y-3 transition-opacity ${!isWeekly ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        {daysOfWeek.map(day => {
          const schedule = formData.horarios[day.key]
          return (
            <div key={day.key} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] rounded-xl border border-transparent hover:border-white/5 transition-colors">
              <div className="w-36 flex items-center gap-3">
                <button onClick={() => updateDaySchedule(day.key, { active: !schedule.active })}>
                  {schedule.active ? <ToggleOn /> : <ToggleOff />}
                </button>
                <span className={`text-sm font-bold ${schedule.active ? 'text-white' : 'text-white/30'}`}>
                  {day.label}
                </span>
              </div>
              {schedule.active ? (
                <div className="flex items-center gap-3 flex-1">
                  <input type="time" value={schedule.start}
                    onChange={e => updateDaySchedule(day.key, { start: e.target.value })}
                    className="bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-blis-red" />
                  <span className="text-white/30">-</span>
                  <input type="time" value={schedule.end}
                    onChange={e => updateDaySchedule(day.key, { end: e.target.value })}
                    className="bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-blis-red" />
                </div>
              ) : (
                <div className="text-sm text-white/20 font-medium flex-1">Cerrado</div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-10 pt-8 border-t border-white/5">
        <h3 className="text-lg font-bold text-white mb-2">Fechas específicas</h3>
        <p className="text-white/40 text-sm mb-6">Añade o sobrescribe disponibilidad para días concretos.</p>

        <div className="flex items-center gap-3 mb-6 bg-white/[0.02] p-4 rounded-xl border border-white/5 flex-wrap md:flex-nowrap">
          <input type="date" value={newDate.date}
            onChange={e => setNewDate(prev => ({ ...prev, date: e.target.value }))}
            className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-blis-red flex-1" />
          <input type="time" value={newDate.start}
            onChange={e => setNewDate(prev => ({ ...prev, start: e.target.value }))}
            className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-blis-red" />
          <span className="text-white/30">-</span>
          <input type="time" value={newDate.end}
            onChange={e => setNewDate(prev => ({ ...prev, end: e.target.value }))}
            className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-blis-red" />
          <button onClick={() => {
            if (newDate.date) {
              addSpecificDate(newDate)
              setNewDate({ date: '', start: '09:00', end: '17:00' })
            }
          }} className="bg-white text-black hover:bg-white/90 px-5 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap">
            <Plus size={14} /> Agregar
          </button>
        </div>

        <div className="space-y-3">
          {formData.fechas_especificas && formData.fechas_especificas.length > 0 ? (
            formData.fechas_especificas.map((sd, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-white bg-[#0a0a0a] px-3 py-1 rounded border border-white/5 text-sm">{sd.date}</span>
                  <span className="text-sm text-blis-red font-bold">{sd.start} - {sd.end}</span>
                </div>
                <button onClick={() => removeSpecificDate(idx)} className="text-white/30 hover:text-blis-red p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-sm text-white/20 italic bg-white/[0.02] p-6 rounded-xl text-center border border-dashed border-white/10">
              No hay fechas específicas configuradas.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
