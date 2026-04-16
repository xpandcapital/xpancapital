"use client"

import { Type, AlignLeft, Mail, Phone, ChevronDown, CircleDot, CheckSquare, CalendarDays, Clock, Link2, DivideSquare, PlusCircle, Trash2, ArrowUp, ArrowDown, Settings, MousePointerClick } from 'lucide-react'
import type { useFormEditor } from '../_hooks/useFormEditor'
import { BuilderButton } from './BuilderButton'
import type { FormField } from '../_types'

type Editor = ReturnType<typeof useFormEditor>

const hexToRgba = (hex: string, opacity: number) => {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${opacity / 100})`
}

export function FormBuildPanel({ editor }: { editor: Editor }) {
  const { formData, activeFieldId, activeField, addField, addPageBreak, updateFormField, deleteField, moveField, updateAppearance } = editor
  const app = formData.apariencia

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* LEFT PANEL: Add fields */}
      <div className="w-[280px] bg-[#0a0a0a] border-r border-white/5 flex flex-col p-4 overflow-y-auto shrink-0">
        <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
          <PlusCircle size={14} /> Agregar Campos
        </h3>
        <div className="grid grid-cols-2 gap-2 mb-6">
          <BuilderButton icon={Type} label="Texto" onClick={() => addField('text')} />
          <BuilderButton icon={AlignLeft} label="Área Texto" onClick={() => addField('textarea')} />
          <BuilderButton icon={Mail} label="Email" onClick={() => addField('email')} />
          <BuilderButton icon={Phone} label="Teléfono" onClick={() => addField('phone')} />
          <BuilderButton icon={ChevronDown} label="Desplegable" onClick={() => addField('dropdown')} />
          <BuilderButton icon={CircleDot} label="Única opc." onClick={() => addField('radio')} />
          <BuilderButton icon={CheckSquare} label="Casillas" onClick={() => addField('checkbox')} />
          <BuilderButton icon={CalendarDays} label="Fecha" onClick={() => addField('date')} />
          <BuilderButton icon={Clock} label="Hora" onClick={() => addField('time')} />
          <BuilderButton icon={Link2} label="URL" onClick={() => addField('url')} />
        </div>
        <button onClick={addPageBreak}
          className="w-full flex items-center justify-center gap-2 bg-white/[0.02] hover:bg-white/5 border border-white/10 hover:border-blis-red/30 text-white/40 hover:text-white p-3 rounded-xl transition-all">
          <DivideSquare size={16} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Salto de Página</span>
        </button>

        {/* Quick appearance controls */}
        <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-6 mb-3 flex items-center gap-2">
          Color principal
        </h3>
        <div className="flex gap-2 items-center">
          <input type="color" value={app.primaryColor} onChange={e => updateAppearance('primaryColor', e.target.value)}
            className="h-8 w-8 rounded cursor-pointer border border-white/10 p-0 bg-transparent" />
          <input type="text" value={app.primaryColor} onChange={e => updateAppearance('primaryColor', e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 text-white rounded px-2 text-xs uppercase" />
        </div>
      </div>

      {/* CENTER: Canvas */}
      <div className="flex-1 bg-[#111] overflow-y-auto relative">
        <div className="min-h-full py-10 px-4 md:px-10 flex flex-col items-center">
          <div
            className="w-full max-w-xl shadow-2xl flex flex-col relative border border-white/10"
            style={{
              backgroundColor: hexToRgba(app.backgroundColor, app.backgroundOpacity),
              borderRadius: `${app.borderRadius}px`,
              backdropFilter: app.backgroundOpacity < 100 ? 'blur(10px)' : 'none',
            }}
          >
            <div className="h-2 w-full" style={{ backgroundColor: app.primaryColor, borderTopLeftRadius: `${app.borderRadius}px`, borderTopRightRadius: `${app.borderRadius}px` }} />

            <div className="flex-1 flex flex-col gap-5 relative z-10"
              style={{
                paddingTop: `${app.paddingTop}px`,
                paddingBottom: `${app.paddingBottom}px`,
                paddingLeft: `${app.paddingLeft}px`,
                paddingRight: `${app.paddingRight}px`,
              }}
            >
              {formData.campos.length === 0 ? (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-10 text-white/30 text-center flex-col gap-3">
                  <PlusCircle size={32} className="opacity-50" />
                  <p className="text-sm font-medium">El formulario está vacío.<br />Añade elementos desde el panel izquierdo.</p>
                </div>
              ) : (
                formData.campos.map((field, index) => {
                  if (field.type === 'page_break') {
                    return (
                      <div key={field.id} className="relative group my-4">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-dashed border-blis-red/40" /></div>
                        <div className="relative flex justify-center">
                          <span className="bg-[#111] px-4 text-xs font-bold text-blis-red tracking-widest uppercase rounded-full border border-blis-red/40">Salto de Página</span>
                        </div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#111] shadow-xl border border-white/10 rounded-lg flex overflow-hidden z-20">
                          <button onClick={() => moveField(index, 'up')} disabled={index === 0} className="p-2 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30"><ArrowUp size={14} /></button>
                          <button onClick={() => moveField(index, 'down')} disabled={index === formData.campos.length - 1} className="p-2 text-white/40 hover:text-white hover:bg-white/10 border-x border-white/5 disabled:opacity-30"><ArrowDown size={14} /></button>
                          <button onClick={() => deleteField(field.id)} className="p-2 text-white/40 hover:text-blis-red hover:bg-blis-red/10"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={field.id}
                      onClick={() => editor.setActiveFieldId(field.id)}
                      className={`relative p-3 -mx-3 rounded-xl cursor-pointer transition-all border-2 ${
                        activeFieldId === field.id ? 'border-blis-red bg-black/20' : 'border-transparent hover:border-white/10 hover:bg-black/10'
                      }`}
                    >
                      <label className="block text-sm font-bold mb-2" style={{ color: app.textColor }}>
                        {field.label} {field.required && <span className="text-blis-red ml-1">*</span>}
                      </label>

                      <div
                        className="w-full border rounded-lg px-3 py-2.5 text-sm flex items-center gap-2 overflow-hidden transition-colors"
                        style={{
                          backgroundColor: app.inputBgColor,
                          borderColor: activeFieldId === field.id ? app.focusColor : app.inputBorderColor,
                          color: app.inputTextColor,
                          minHeight: field.type === 'textarea' ? '80px' : 'auto',
                        }}
                      >
                        {field.type === 'phone' && <span className="font-medium pr-2 border-r opacity-60" style={{ borderColor: app.inputBorderColor }}>🇪🇨 +593</span>}
                        {field.type === 'dropdown' ? (
                          <div className="flex justify-between items-center w-full">
                            <span style={{ color: app.placeholderColor }}>{field.placeholder || 'Selecciona una opción'}</span>
                            <ChevronDown size={16} />
                          </div>
                        ) : field.type === 'date' ? (
                          <div className="flex justify-between items-center w-full">
                            <span style={{ color: app.placeholderColor }}>dd/mm/aaaa</span>
                            <CalendarDays size={16} />
                          </div>
                        ) : field.type === 'time' ? (
                          <div className="flex justify-between items-center w-full">
                            <span style={{ color: app.placeholderColor }}>--:--</span>
                            <Clock size={16} />
                          </div>
                        ) : field.type === 'url' ? (
                          <div className="flex items-center w-full gap-2">
                            <Link2 size={16} />
                            <span style={{ color: app.placeholderColor }}>{field.placeholder || 'https://...'}</span>
                          </div>
                        ) : (
                          <span style={{ color: app.placeholderColor }}>{field.placeholder || 'Escribe aquí...'}</span>
                        )}
                      </div>

                      {activeFieldId === field.id && (
                        <div className="absolute right-0 -top-6 bg-[#111] shadow-xl border border-white/10 rounded-lg flex overflow-hidden z-20">
                          <button onClick={(e) => { e.stopPropagation(); moveField(index, 'up') }} disabled={index === 0} className="p-2 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30"><ArrowUp size={16} /></button>
                          <button onClick={(e) => { e.stopPropagation(); moveField(index, 'down') }} disabled={index === formData.campos.length - 1} className="p-2 text-white/40 hover:text-white hover:bg-white/10 border-x border-white/5 disabled:opacity-30"><ArrowDown size={16} /></button>
                          <button onClick={(e) => { e.stopPropagation(); deleteField(field.id) }} className="p-2 text-white/40 hover:text-blis-red hover:bg-blis-red/10"><Trash2 size={16} /></button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}

              {app.showButton && (
                <div className="mt-2">
                  <button
                    className="w-full py-3.5 rounded-lg font-bold text-sm shadow-lg transition-transform hover:scale-[1.02]"
                    style={{ backgroundColor: app.primaryColor, color: app.buttonTextColor, borderRadius: `${app.borderRadius}px` }}
                  >
                    {formData.texto_boton}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Field Properties */}
      <div className="w-[280px] bg-[#0a0a0a] border-l border-white/5 flex flex-col p-4 overflow-y-auto shrink-0">
        <h3 className="text-[12px] font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
          <Settings size={14} className="text-blis-red" /> Propiedades del Campo
        </h3>

        {activeField ? (
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Etiqueta (Pregunta)</label>
              <input type="text" value={activeField.label}
                onChange={e => updateFormField(activeField.id, { label: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2.5 outline-none focus:border-blis-red text-sm" />
            </div>

            {['text', 'textarea', 'email', 'phone', 'url'].includes(activeField.type) && (
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Placeholder</label>
                <input type="text" value={activeField.placeholder || ''}
                  onChange={e => updateFormField(activeField.id, { placeholder: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2.5 outline-none focus:border-blis-red text-sm" />
              </div>
            )}

            {['dropdown', 'radio', 'checkbox'].includes(activeField.type) && activeField.options && (
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 block flex items-center justify-between">
                  Opciones
                  <button onClick={() => updateFormField(activeField.id, { options: [...activeField.options!, `Opción ${activeField.options!.length + 1}`] })}
                    className="text-blis-red hover:text-white flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                    <PlusCircle size={12} /> Añadir
                  </button>
                </label>
                <div className="space-y-2">
                  {activeField.options.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <input type="text" value={opt}
                        onChange={e => {
                          const newOpts = [...activeField.options!]
                          newOpts[i] = e.target.value
                          updateFormField(activeField.id, { options: newOpts })
                        }}
                        className="flex-1 bg-white/5 border border-white/10 text-white rounded-md px-3 py-2 outline-none focus:border-blis-red text-sm" />
                      <button onClick={() => {
                        const newOpts = activeField.options!.filter((_, idx) => idx !== i)
                        updateFormField(activeField.id, { options: newOpts })
                      }} className="text-white/30 hover:text-blis-red p-2 bg-white/5 rounded-md border border-white/10">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-white/5">
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <input type="checkbox" checked={activeField.required}
                  onChange={e => updateFormField(activeField.id, { required: e.target.checked })}
                  className="w-4 h-4 accent-blis-red" />
                <div>
                  <span className="text-sm font-bold text-white block">Campo Obligatorio</span>
                  <span className="text-[10px] text-white/30 block">El usuario debe llenarlo.</span>
                </div>
              </label>
            </div>
          </div>
        ) : (
          <div className="text-center text-white/20 text-sm mt-10 p-6 border-2 border-dashed border-white/10 rounded-xl bg-[#0a0a0a]">
            <MousePointerClick size={32} className="mx-auto mb-4 opacity-30 text-blis-red" />
            Haz clic en un campo del lienzo central para editar sus propiedades.
          </div>
        )}
      </div>
    </div>
  )
}