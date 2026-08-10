'use client'

import { Layers, Trash2, Sparkles } from 'lucide-react'
import type { Module, Question } from '../_types'
import { RichTextEditor } from './RichTextEditor'

interface ModuleEditorProps {
  module: Module
  mIdx: number
  isGeneratingAI: string | null
  onUpdate: (id: string, data: Partial<Module>) => void
  onDelete: (id: string) => void
  onGenerateQuizAI: (moduleId: string) => void
  onAddQuestion: (moduleId: string) => void
  moduleRef: (el: HTMLElement | null) => void
}

export function ModuleEditor({
  module, mIdx, isGeneratingAI,
  onUpdate, onDelete,
  onGenerateQuizAI, onAddQuestion,
  moduleRef
}: ModuleEditorProps) {
  const moduleGenKey = `MOD_${module.id}`

  return (
    <section ref={moduleRef} className="bg-zinc-950 border border-white/5 rounded-[2rem] p-6 md:p-10 space-y-6 relative group/mod ring-offset-black transition-all">
      <div className="absolute top-8 right-8 flex gap-2">
        <div className="px-3 py-1 bg-blis-red text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Módulo {mIdx + 1}</div>
        <button onClick={() => onDelete(module.id)} className="p-1 px-2 bg-white/5 rounded-lg text-gray-600 hover:text-red-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500"><Layers className="w-6 h-6" /></div>
      <div className="flex-1 space-y-2">
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Título del Módulo</label>
        <input
          value={module.title}
          onChange={(e) => onUpdate(module.id, { title: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-white focus:outline-none focus:border-blis-red/50 transition-all"
          placeholder="Nombre del módulo..."
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-500 uppercase">Descripción Expandida</label>
        <RichTextEditor
          value={module.description || ''}
          onChange={(val) => onUpdate(module.id, { description: val })}
          placeholder="Contenido principal del módulo..."
        />
      </div>

      <div className="space-y-8 pt-6 border-t border-white/5">
        <div className="flex justify-between items-center px-4">
          <div className="flex items-center gap-4">
            <h4 className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Examen Final del Módulo
            </h4>
            <button
              onClick={() => onUpdate(module.id, { isQuizEnabled: !module.isQuizEnabled })}
              className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest transition-all ${module.isQuizEnabled ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-white/5 border-white/10 text-gray-600'}`}
            >
              {module.isQuizEnabled ? 'Activado' : 'Desactivado'}
            </button>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => onGenerateQuizAI(module.id)}
              disabled={isGeneratingAI === moduleGenKey}
              className="text-amber-500 text-[10px] font-black uppercase tracking-widest hover:underline disabled:opacity-50 flex items-center gap-2"
            >
              {isGeneratingAI === moduleGenKey ? 'Generando...' : 'Autogenerar Examen (10 Preguntas)'}
            </button>
            <button
              onClick={() => onAddQuestion(module.id)}
              className="text-blis-red text-[10px] font-black uppercase tracking-widest hover:underline"
            >
              + Añadir Pregunta
            </button>
          </div>
        </div>

        {module.isQuizEnabled && (
          <div className="space-y-2 px-4">
            <label className="text-[10px] font-black text-gray-500 uppercase">Instrucciones del Examen (visible para el alumno)</label>
            <textarea
              value={module.examInstructions || ''}
              onChange={(e) => onUpdate(module.id, { examInstructions: e.target.value })}
              rows={3}
              placeholder="Escribe instrucciones claras para el alumno, ej: 'Este examen evalúa los conceptos del módulo. Tienes 30 minutos y puedes elegir solo una respuesta por pregunta.'"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all resize-none"
            />
          </div>
        )}

        <div className="space-y-6">
          {(module.questions || []).map((q, qIdx) => (
            <div key={q.id} className="p-8 bg-white/[0.03] border border-white/5 rounded-[2rem] space-y-6 relative group/mq">
              <button
                onClick={() => onUpdate(module.id, { questions: module.questions?.filter(mq => mq.id !== q.id) })}
                className="absolute top-8 right-8 p-2 text-gray-700 hover:text-red-500 opacity-0 group-hover/mq:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex gap-4">
                <span className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xs font-black text-gray-500 shrink-0">{qIdx + 1}</span>
                <input
                  className="bg-transparent border-none p-0 text-lg text-white font-black placeholder:text-gray-800 focus:outline-none w-full border-b border-white/5 pb-4"
                  placeholder="Escribe la pregunta del examen aquí..."
                  value={q.text}
                  onChange={(e) => {
                    const newQs = [...(module.questions || [])]
                    newQs[qIdx] = { ...q, text: e.target.value }
                    onUpdate(module.id, { questions: newQs })
                  }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-0 md:ml-14">
                {q.options.map((opt, oIdx) => (
                  <div
                    key={opt.id}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer group/mo ${opt.isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}
                    onClick={() => {
                      const newOptions = q.options.map((o, idx) => ({ ...o, isCorrect: idx === oIdx }))
                      const newQs = [...(module.questions || [])]
                      newQs[qIdx] = { ...q, options: newOptions }
                      onUpdate(module.id, { questions: newQs })
                    }}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${opt.isCorrect ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}>
                      {opt.isCorrect && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <input
                      className="bg-transparent border-none text-[11px] text-gray-300 focus:outline-none w-full"
                      value={opt.text}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const newOptions = [...q.options]
                        newOptions[oIdx] = { ...newOptions[oIdx], text: e.target.value }
                        const newQs = [...(module.questions || [])]
                        newQs[qIdx] = { ...q, options: newOptions }
                        onUpdate(module.id, { questions: newQs })
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
