"use client"

import type { useCalendarEditor } from '../_hooks/useCalendarEditor'
import { calendarTypeLabels } from '../_types'

type Editor = ReturnType<typeof useCalendarEditor>

export function EditorAppearance({ editor }: { editor: Editor }) {
  const { formData, updateField } = editor

  return (
    <div className="p-8">
      <div className="border-b border-white/5 pb-4 mb-8">
        <h2 className="text-2xl font-black text-white uppercase tracking-wide">Apariencia</h2>
        <p className="text-white/40 text-sm mt-1">Ajusta los colores para alinearse con tu marca.</p>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">
              Color principal (Botones)
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input type="color" value={formData.color_principal}
                  onChange={e => updateField('color_principal', e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                <div className="h-12 w-12 rounded-xl border border-white/10 shadow-inner"
                  style={{ backgroundColor: formData.color_principal }} />
              </div>
              <input type="text" value={formData.color_principal}
                onChange={e => updateField('color_principal', e.target.value)}
                className="w-28 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white outline-none uppercase font-mono text-sm focus:border-blis-red" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">
              Texto del botón final
            </label>
            <input type="text" value={formData.texto_boton}
              onChange={e => updateField('texto_boton', e.target.value)}
              className="w-full md:w-2/3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blis-red" />
          </div>
        </div>

        <div className="mt-10 pt-10 border-t border-white/5">
          <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
            Vista previa en vivo
          </h3>
          <div className="rounded-2xl overflow-hidden border border-white/10 flex flex-col items-center justify-center p-10 shadow-2xl relative"
            style={{ backgroundColor: '#f8fafc' }}>
            <div className="mb-6 z-10">
              {formData.logo ? (
                <img src={formData.logo} alt="Logo" className="w-20 h-20 rounded-2xl object-cover shadow-2xl border-4 border-white/50 bg-white" />
              ) : (
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white/50">
                  <span className="text-2xl font-black" style={{ color: formData.color_principal }}>
                    {formData.nombre.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col sm:flex-row overflow-hidden border border-gray-100 z-10">
              <div className="sm:w-5/12 p-6 bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-100 text-left">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  {calendarTypeLabels[formData.tipo]}
                </p>
                <h4 className="text-base font-bold text-gray-900 mb-3 leading-snug">
                  {formData.nombre || 'Nombre del calendario'}
                </h4>
                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                  {formData.duracion} min
                </div>
              </div>
              <div className="sm:w-7/12 p-6 flex flex-col justify-center items-center bg-white">
                <button className="w-full py-3 rounded-xl text-white text-sm font-bold shadow-lg transition-transform hover:scale-105"
                  style={{ backgroundColor: formData.color_principal }}>
                  {formData.texto_boton || 'Programar reunión'}
                </button>
                <p className="text-[10px] text-gray-400 mt-4 text-center uppercase tracking-wider">
                  Así se verá tu botón principal
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}