"use client"

import type { useFormEditor } from '../_hooks/useFormEditor'
import type { FormAppearance } from '../_types'

type Editor = ReturnType<typeof useFormEditor>

export function FormAppearancePanel({ editor }: { editor: Editor }) {
  const { formData, updateAppearance, updateField } = editor
  const app = formData.apariencia

  const colorRow = (label: string, key: keyof FormAppearance, value: string) => (
    <div className="flex gap-2 items-center mb-2">
      <span className="text-[10px] text-white/40 w-16">{label}</span>
      <input type="color" value={value} onChange={e => updateAppearance(key, e.target.value)}
        className="h-6 w-6 rounded cursor-pointer border border-white/10 p-0" />
      <input type="text" value={value} onChange={e => updateAppearance(key, e.target.value)}
        className="flex-1 bg-white/5 border border-white/10 text-white rounded px-2 text-[10px] uppercase" />
    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#050505]">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5">
          <h3 className="text-sm font-bold text-white mb-4">Fondo del Contenedor</h3>
          <div className="flex gap-2 mb-3">
            <input type="color" value={app.backgroundColor} onChange={e => updateAppearance('backgroundColor', e.target.value)}
              className="h-8 w-8 rounded cursor-pointer border border-white/10 p-0 bg-transparent" />
            <input type="text" value={app.backgroundColor} onChange={e => updateAppearance('backgroundColor', e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 text-white rounded px-2 text-xs uppercase" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-white/30">Opacidad</span>
            <input type="range" min="0" max="100" value={app.backgroundOpacity}
              onChange={e => updateAppearance('backgroundOpacity', parseInt(e.target.value))}
              className="flex-1 accent-blis-red" />
            <span className="text-[10px] text-white/40 w-6 text-right">{app.backgroundOpacity}%</span>
          </div>
        </div>

        <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5">
          <h3 className="text-sm font-bold text-white mb-4">Paddings</h3>
          <div className="grid grid-cols-2 gap-2">
            {(['Top', 'Bottom', 'Left', 'Right'] as const).map(side => {
              const key = `padding${side}` as keyof FormAppearance
              return (
                <div key={side} className="flex items-center bg-white/[0.02] border border-white/10 rounded px-2">
                  <span className="text-[9px] text-white/30 w-4">{side === 'Top' ? 'Top' : side === 'Bottom' ? 'Bot' : side === 'Left' ? 'Izq' : 'Der'}</span>
                  <input type="number" value={app[key] as string}
                    onChange={e => updateAppearance(key, e.target.value)}
                    className="w-full bg-transparent text-white py-1.5 text-xs text-right outline-none" />
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5">
          <h3 className="text-sm font-bold text-white mb-4">Redondeo</h3>
          <input type="number" value={app.borderRadius}
            onChange={e => updateAppearance('borderRadius', e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white rounded px-2 py-1.5 text-xs" />
        </div>

        <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5">
          <h3 className="text-sm font-bold text-white mb-4">Estilo de Textos</h3>
          {colorRow('Etiquetas', 'textColor', app.textColor)}
          {colorRow('Placeholder', 'placeholderColor', app.placeholderColor)}
        </div>

        <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5">
          <h3 className="text-sm font-bold text-white mb-4">Estilo de Inputs</h3>
          {colorRow('Fondo', 'inputBgColor', app.inputBgColor)}
          {colorRow('Borde', 'inputBorderColor', app.inputBorderColor)}
          {colorRow('Focus', 'focusColor', app.focusColor)}
          {colorRow('Texto', 'inputTextColor', app.inputTextColor)}
        </div>

        <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Botón Final</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-[10px] text-white/30">Mostrar</span>
              <input type="checkbox" checked={app.showButton}
                onChange={e => updateAppearance('showButton', e.target.checked)}
                className="accent-blis-red w-4 h-4" />
            </label>
          </div>
          {app.showButton && (
            <div className="space-y-3">
              {colorRow('Fondo', 'primaryColor', app.primaryColor)}
              {colorRow('Texto', 'buttonTextColor', app.buttonTextColor)}
              <input type="text" value={formData.texto_boton}
                onChange={e => updateField('texto_boton', e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded px-3 py-2 text-xs outline-none focus:border-blis-red"
                placeholder="Texto del botón" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}