"use client"

import { useState } from 'react'
import { Plus, Trash2, Send, Mail, Globe } from 'lucide-react'
import type { useFormEditor } from '../_hooks/useFormEditor'

type Editor = ReturnType<typeof useFormEditor>

const stepIcons: Record<string, React.ReactNode> = {
  webhook: <Send className="text-purple-500" size={20} />,
  email: <Mail className="text-amber-500" size={20} />,
  redirect: <Globe className="text-emerald-500" size={20} />,
}

const stepColors: Record<string, string> = {
  webhook: 'border-purple-500',
  email: 'border-amber-500',
  redirect: 'border-emerald-500',
}

const stepBgColors: Record<string, string> = {
  webhook: 'border-purple-500/30 bg-purple-500/5',
  email: 'border-amber-500/30 bg-amber-500/5',
  redirect: 'border-emerald-500/30 bg-emerald-500/5',
}

export function FormFlowPanel({ editor }: { editor: Editor }) {
  const { formData, addFlowStep, updateFlowStep, deleteFlowStep } = editor
  const [showNodeMenu, setShowNodeMenu] = useState<number | 'empty' | null>(null)

  return (
    <div className="flex-1 bg-[#050505] p-10 overflow-y-auto">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-0 py-10">
        {editor.formPages.map((pageFields, pageIdx) => (
          <div key={`page_${pageIdx}`} className="contents">
            <div className="w-80 bg-[#0a0a0a] border-2 border-blue-500 rounded-2xl shadow-xl flex flex-col overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between bg-blue-500/10 border-blue-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <span className="font-bold text-white text-sm">Página {pageIdx + 1}</span>
                </div>
              </div>
              <div className="p-5 bg-[#050505] space-y-2">
                <div className="text-[10px] text-white/30 font-bold uppercase">Campos en esta página:</div>
                <div className="flex flex-col gap-2">
                  {pageFields.length === 0 ? (
                    <span className="text-xs italic text-white/20">No hay campos.</span>
                  ) : (
                    pageFields.map(f => (
                      <span key={f.id} className="bg-white/5 px-3 py-2 rounded-md text-[11px] text-white/60 border border-white/10 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {f.label}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="h-8 w-px bg-blue-500/30 border-l-2 border-dashed border-blue-500/50" />
          </div>
        ))}

        {formData.pasos_flujo.map((step, index) => (
          <div key={step.id} className="contents">
            <div className={`w-80 bg-[#0a0a0a] border-2 rounded-2xl shadow-xl flex flex-col overflow-hidden transition-colors ${stepColors[step.type] || 'border-white/10'}`}>
              <div className="p-4 border-b flex items-center justify-between bg-white/[0.02] border-white/5">
                <div className="flex items-center gap-3">
                  {stepIcons[step.type]}
                  <span className="font-bold text-white text-sm">{step.title}</span>
                </div>
                <button onClick={() => deleteFlowStep(step.id)} className="text-white/30 hover:text-blis-red">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="p-5 bg-[#050505] space-y-3">
                {step.type === 'email' ? (
                  <>
                    <label className="text-[10px] text-white/30 font-bold uppercase block">Destinatario</label>
                    <input type="text" value={step.url} onChange={e => updateFlowStep(step.id, e.target.value)}
                      placeholder="admin@empresa.com"
                      className="w-full bg-white/5 border border-white/10 text-white rounded px-3 py-2 outline-none focus:border-amber-500 text-sm" />
                  </>
                ) : step.type === 'redirect' ? (
                  <>
                    <label className="text-[10px] text-white/30 font-bold uppercase block">URL Destino</label>
                    <textarea value={step.url} onChange={e => updateFlowStep(step.id, e.target.value)}
                      placeholder="https://wa.me/593..."
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 text-white rounded px-3 py-2 outline-none focus:border-emerald-500 text-sm resize-none" />
                  </>
                ) : (
                  <>
                    <label className="text-[10px] text-white/30 font-bold uppercase block">Endpoint URL</label>
                    <input type="text" value={step.url} onChange={e => updateFlowStep(step.id, e.target.value)}
                      placeholder="https://hook.make.com/..."
                      className="w-full bg-white/5 border border-white/10 text-white rounded px-3 py-2 outline-none focus:border-purple-500 text-sm" />
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center relative py-2">
              <div className="h-4 w-px bg-white/10" />
              <div className="relative">
                <button onClick={() => setShowNodeMenu(showNodeMenu === index ? null : index)}
                  className="w-6 h-6 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-blis-red hover:border-blis-red transition-colors z-20 relative shadow-lg">
                  <Plus size={14} />
                </button>
                {showNodeMenu === index && (
                  <div className="absolute left-10 -top-10 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-30">
                    <div className="text-[10px] font-bold text-white/30 uppercase px-4 py-2 bg-white/[0.02] border-b border-white/5">Añadir Acción</div>
                    <button onClick={() => { addFlowStep('webhook', 'Enviar Webhook'); setShowNodeMenu(null) }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 text-left border-b border-white/5">
                      <Send size={16} className="text-purple-500" /> Webhook (API)
                    </button>
                    <button onClick={() => { addFlowStep('email', 'Enviar Email'); setShowNodeMenu(null) }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 text-left border-b border-white/5">
                      <Mail size={16} className="text-amber-500" /> Notificación Email
                    </button>
                    <button onClick={() => { addFlowStep('redirect', 'Redirección URL'); setShowNodeMenu(null) }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 text-left">
                      <Globe size={16} className="text-emerald-500" /> Redirigir Usuario
                    </button>
                  </div>
                )}
              </div>
              <div className="h-4 w-px bg-white/10" />
            </div>
          </div>
        ))}

        {formData.pasos_flujo.length === 0 && (
          <div className="flex flex-col items-center relative py-2">
            <div className="relative">
              <button onClick={() => setShowNodeMenu('empty')}
                className="w-6 h-6 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-blis-red hover:border-blis-red transition-colors z-20 relative shadow-lg">
                <Plus size={14} />
              </button>
              {showNodeMenu === 'empty' && (
                <div className="absolute left-10 -top-10 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-30">
                  <div className="text-[10px] font-bold text-white/30 uppercase px-4 py-2 bg-white/[0.02] border-b border-white/5">Añadir Acción</div>
                  <button onClick={() => { addFlowStep('webhook', 'Enviar Webhook'); setShowNodeMenu(null) }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 text-left border-b border-white/5">
                    <Send size={16} className="text-purple-500" /> Webhook (API)
                  </button>
                  <button onClick={() => { addFlowStep('email', 'Enviar Email'); setShowNodeMenu(null) }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 text-left border-b border-white/5">
                    <Mail size={16} className="text-amber-500" /> Notificación Email
                  </button>
                  <button onClick={() => { addFlowStep('redirect', 'Redirección URL'); setShowNodeMenu(null) }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 text-left">
                    <Globe size={16} className="text-emerald-500" /> Redirigir Usuario
                  </button>
                </div>
              )}
            </div>
            <div className="h-4 w-px bg-white/10" />
          </div>
        )}

        <div className="w-24 py-2 bg-[#0a0a0a] border border-white/10 rounded-full text-center text-xs font-bold text-white/30 uppercase shadow-lg">
          Fin
        </div>
      </div>
    </div>
  )
}