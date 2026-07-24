"use client"

import { useState, useEffect } from 'react'
import { Info } from 'lucide-react'
import type { useCalendarEditor } from '../_hooks/useCalendarEditor'
import { calendarTypeLabels } from '../_types'
import { SearchableSelect } from '@/components/ui/SearchableSelect'

type Editor = ReturnType<typeof useCalendarEditor>

export function EditorTeam({ editor }: { editor: Editor }) {
  const { formData, updateField, toggleUser } = editor
  const [teamMembers, setTeamMembers] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/admin/users?per_page=100').then(r => r.json()).then(d => {
      if (d.success) setTeamMembers((d.data || []).map((u: any) => ({ id: u.id, nombre: [u.nombre, u.apellido].filter(Boolean).join(' '), email: u.email, whatsapp: u.telefono })))
    })
  }, [])

  return (
    <div className="p-8">
      <div className="border-b border-white/5 pb-4 mb-8">
        <h2 className="text-2xl font-black text-white uppercase tracking-wide">Equipo & Asignación</h2>
        <p className="text-white/40 text-sm mt-1">Configura quiénes atenderán estas reservas.</p>
      </div>

      <div className="mb-8 p-6 bg-white/[0.02] border border-white/5 rounded-xl">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Info size={16} className="text-blis-red" /> Lógica para: {calendarTypeLabels[formData.tipo]}
        </h3>

        {formData.tipo === 'personal' && (
          <p className="text-sm text-white/40">Selecciona el miembro único del equipo para este calendario.</p>
        )}

        {formData.tipo === 'rotacion' && (
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
              Método de distribución
            </label>
            <SearchableSelect
              value={(formData.configuracion as Record<string, unknown>)?.logic as string || 'round_robin'}
              onChange={v => {
                const newConfig = { ...(formData.configuracion as Record<string, unknown>), logic: v }
                updateField('configuracion', newConfig)
              }}
              options={[
                { value: 'round_robin', label: 'Equitativo (Round Robin)' },
                { value: 'availability', label: 'Maximizar disponibilidad' },
              ]}
              className="w-full" buttonClassName="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 outline-none focus:border-blis-red text-sm"
            />
          </div>
        )}

        {formData.tipo === 'clases' && (
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
              Capacidad máxima
            </label>
            <input
              type="number"
              value={(formData.configuracion as Record<string, unknown>)?.maxAttendees as number || 1}
              onChange={e => {
                const newConfig = { ...(formData.configuracion as Record<string, unknown>), maxAttendees: parseInt(e.target.value) }
                updateField('configuracion', newConfig)
              }}
              className="w-32 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 outline-none focus:border-blis-red"
            />
          </div>
        )}
      </div>

      <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">
        Miembros disponibles
      </h3>
      <div className="space-y-3">
        {teamMembers.map(user => (
          <label
            key={user.id}
            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
              formData.usuarios_asignados.includes(user.id)
                ? 'border-blis-red bg-blis-red/5'
                : 'border-white/5 bg-white/[0.02] hover:border-white/10'
            }`}
          >
            <input
              type={formData.tipo === 'personal' ? 'radio' : 'checkbox'}
              name="teamAssignment"
              checked={formData.usuarios_asignados.includes(user.id)}
              onChange={() => {
                if (formData.tipo === 'personal') {
                  updateField('usuarios_asignados', [user.id])
                } else {
                  toggleUser(user.id)
                }
              }}
              className="w-4 h-4 accent-blis-red"
            />
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold text-sm">
              {user.nombre.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-white">{user.nombre}</div>
              <div className="text-xs text-white/40">{user.email}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}