"use client"

import { useState } from 'react'
import { PlusCircle, Trash2, GripVertical, Layout } from 'lucide-react'
import type { useCalendarEditor } from '../_hooks/useCalendarEditor'
import { SearchableSelect } from '@/components/ui/SearchableSelect'

type Editor = ReturnType<typeof useCalendarEditor>

const fieldTypes = [
  { value: 'text', label: 'Texto corto' },
  { value: 'textarea', label: 'Texto largo' },
  { value: 'tel', label: 'Teléfono' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Número' },
]

export function EditorForm({ editor }: { editor: Editor }) {
  const { formData, addFormField, removeFormField, updateField } = editor
  const [newField, setNewField] = useState({ label: '', type: 'text', required: false })

  const fields = formData.formulario

  const handleAdd = () => {
    if (!newField.label) return
    addFormField({
      id: `f_${Date.now()}`,
      label: newField.label,
      type: newField.type,
      required: newField.required,
      system: false,
    })
    setNewField({ label: '', type: 'text', required: false })
  }

  return (
    <div className="p-8">
      <div className="border-b border-white/5 pb-4 mb-8">
        <h2 className="text-2xl font-black text-white uppercase tracking-wide">Formularios</h2>
        <p className="text-white/40 text-sm mt-1">Configura qué información pides al agendar.</p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Layout size={16} /> Campos a solicitar
          </h3>
          <div className="bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden">
            <div className="divide-y divide-white/5">
              {fields.map((field) => (
                <div key={field.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <GripVertical size={16} className="text-white/10 cursor-grab" />
                    <div>
                      <span className="font-bold text-sm text-white">{field.label}</span>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 bg-[#0a0a0a] px-2 py-0.5 rounded border border-white/5">
                          {field.type === 'textarea' ? 'Texto largo' : field.type}
                        </span>
                        {field.required && (
                          <span className="text-[9px] font-bold text-blis-red bg-blis-red/10 px-2 py-0.5 rounded border border-blis-red/30">
                            Obligatorio
                          </span>
                        )}
                        {field.system && (
                          <span className="text-[9px] font-bold text-white/30 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                            Sistema
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!field.system && (
                    <button onClick={() => removeFormField(field.id)}
                      className="p-2 text-white/20 hover:text-blis-red hover:bg-blis-red/10 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="p-5 bg-[#0a0a0a] border-t border-white/5">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Añadir nuevo campo</p>
              <div className="flex flex-col xl:flex-row gap-3">
                <input type="text" value={newField.label}
                  onChange={e => setNewField(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Ej. Tu usuario de Instagram..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blis-red" />
                <SearchableSelect value={newField.type}
                  onChange={v => setNewField(prev => ({ ...prev, type: v }))}
                  options={fieldTypes.map(ft => ({ value: ft.value, label: ft.label }))}
                  className="w-full" buttonClassName="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blis-red" />
                <label className="flex items-center justify-center gap-2 text-sm text-white bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 cursor-pointer hover:bg-white/10">
                  <input type="checkbox" checked={newField.required}
                    onChange={e => setNewField(prev => ({ ...prev, required: e.target.checked }))}
                    className="rounded bg-black border-white/10 accent-blis-red w-4 h-4" />
                  Requerido
                </label>
                <button onClick={handleAdd}
                  className="bg-white text-black hover:bg-white/90 px-6 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                  <PlusCircle size={16} /> Añadir
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-white/5">
          <label className="flex items-start gap-4 cursor-pointer group">
            <input type="checkbox"
              checked={formData.permitir_invitados}
              onChange={e => updateField('permitir_invitados', e.target.checked)}
              className="mt-1 w-5 h-5 accent-blis-red rounded bg-white/5 border-white/10" />
            <div>
              <span className="block text-sm font-bold text-white group-hover:text-blis-red transition-colors">Permitir añadir invitados</span>
              <span className="block text-xs text-white/30 mt-1">El cliente podrá añadir correos para que reciban invitación.</span>
            </div>
          </label>

          <label className="flex items-start gap-4 cursor-pointer group">
            <input type="checkbox"
              checked={formData.requerir_consentimiento}
              onChange={e => updateField('requerir_consentimiento', e.target.checked)}
              className="mt-1 w-5 h-5 accent-blis-red rounded bg-white/5 border-white/10" />
            <div>
              <span className="block text-sm font-bold text-white group-hover:text-blis-red transition-colors">Casilla de consentimiento (Privacidad)</span>
              <span className="block text-xs text-white/30 mt-1">Añade checkbox obligatorio para aceptar términos antes de reservar.</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  )
}