"use client"

import { useState } from 'react'
import { Save, ExternalLink, Copy, Trash2, Loader2, ToggleLeft, ToggleRight, Code } from 'lucide-react'
import { PuestoTrabajo, PuestoPregunta } from '../../_types'
import { PreguntaAssigner } from './PreguntaAssigner'

interface PuestoEditorProps {
  puesto: PuestoTrabajo
  selectedPP: PuestoPregunta[]
  preguntas: any[]
  grupos: string[]
  puestos: { id: string; nombre: string }[]
  saving: boolean
  onUpdatePuesto: (id: string, updates: Partial<PuestoTrabajo>) => Promise<boolean>
  onDelete: (id: string) => void
  onTogglePregunta: (puestoId: string, preguntaId: string, checked: boolean) => PuestoPregunta[]
  onUpdatePregunta: (puestoId: string, preguntaId: string, field: string, value: any) => void
  onSavePuestoPreguntas: (puestoId: string, questions: PuestoPregunta[]) => Promise<boolean>
  onCopyPreguntasFrom: (targetId: string, sourceId: string) => PuestoPregunta[]
  onCopyLink: (slug: string) => void
  onPreview: (slug: string) => void
  onDeselect: () => void
  onCopyEmbed: (slug: string) => void
}

export function PuestoEditor({
  puesto, selectedPP, preguntas, grupos, puestos, saving,
  onUpdatePuesto, onDelete, onTogglePregunta, onUpdatePregunta,
  onSavePuestoPreguntas, onCopyPreguntasFrom, onCopyLink, onPreview, onDeselect, onCopyEmbed,
}: PuestoEditorProps) {
  const [editNombre, setEditNombre] = useState(puesto.nombre)
  const [editSlug, setEditSlug] = useState(puesto.slug)
  const [editDescripcion, setEditDescripcion] = useState(puesto.descripcion || '')
  const [editMode, setEditMode] = useState(false)
  const [savingPuesto, setSavingPuesto] = useState(false)
  const [activeTab, setActiveTab] = useState<'preguntas' | 'config'>('preguntas')

  const handleSavePuesto = async () => {
    setSavingPuesto(true)
    const ok = await onUpdatePuesto(puesto.id, {
      nombre: editNombre.trim(),
      slug: editSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
      descripcion: editDescripcion.trim() || undefined,
    })
    if (ok) setEditMode(false)
    setSavingPuesto(false)
  }

  const handleToggleActivo = async () => {
    await onUpdatePuesto(puesto.id, { activo: !puesto.activo })
  }

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar "${puesto.nombre}"? Esta acción no se puede deshacer.`)) {
      onDelete(puesto.id)
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            {editMode ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Nombre</label>
                  <input type="text" value={editNombre} onChange={e => setEditNombre(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blis-red/50" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Slug (URL)</label>
                  <div className="flex items-center bg-black/50 border border-white/10 rounded-lg overflow-hidden">
                    <span className="pl-3 text-gray-500 text-xs">/formulario/postulante/</span>
                    <input type="text" value={editSlug} onChange={e => setEditSlug(e.target.value)} className="flex-1 bg-transparent px-2 py-2 text-white text-sm font-mono focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Descripción</label>
                  <textarea value={editDescripcion} onChange={e => setEditDescripcion(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blis-red/50 resize-none" rows={2} />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSavePuesto} disabled={savingPuesto} className="px-4 py-2 bg-blis-red text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:scale-105 disabled:opacity-50 flex items-center gap-1">
                    {savingPuesto ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}Guardar
                  </button>
                  <button onClick={() => { setEditNombre(puesto.nombre); setEditSlug(puesto.slug); setEditDescripcion(puesto.descripcion || ''); setEditMode(false) }} className="px-4 py-2 bg-white/5 text-gray-400 rounded-lg text-xs font-bold hover:bg-white/10">Cancelar</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-black text-white">{puesto.nombre}</h2>
                  <button onClick={handleToggleActivo} title={puesto.activo ? 'Desactivar' : 'Activar'}>
                    {puesto.activo
                      ? <ToggleRight className="w-6 h-6 text-emerald-400 hover:text-emerald-300" />
                      : <ToggleLeft className="w-6 h-6 text-gray-600 hover:text-gray-400" />
                    }
                  </button>
                </div>
                <p className="text-gray-500 text-xs font-mono">/formulario/postulante/{puesto.slug}</p>
                {puesto.descripcion && <p className="text-gray-400 text-xs mt-1">{puesto.descripcion}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${puesto.activo ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'}`}>
                    {puesto.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                    {selectedPP.filter(pp => pp.visible_formulario).length} públicas · {selectedPP.length} total
                  </span>
                </div>
              </div>
            )}
          </div>
          {!editMode && (
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => onCopyLink(puesto.slug)} className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Copiar link del formulario">
                <Copy className="w-4 h-4" />
              </button>
              <button onClick={() => onCopyEmbed(puesto.slug)} className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Copiar código de incrustación">
                <Code className="w-4 h-4" />
              </button>
              <button onClick={() => onPreview(puesto.slug)} className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Vista previa del formulario">
                <ExternalLink className="w-4 h-4" />
              </button>
              <button onClick={() => setEditMode(true)} className="px-3 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-wider">
                Editar
              </button>
              <button onClick={handleDelete} className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Eliminar puesto">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-1 border-b border-white/5 -mx-5 px-5">
          <button
            onClick={() => setActiveTab('preguntas')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-[1px] ${activeTab === 'preguntas' ? 'text-blis-red border-blis-red' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
          >
            Preguntas
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-[1px] ${activeTab === 'config' ? 'text-blis-red border-blis-red' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
          >
            Configuración
          </button>
        </div>
      </div>

      {activeTab === 'preguntas' && (
        <PreguntaAssigner
          grupos={grupos}
          preguntas={preguntas}
          selectedPP={selectedPP}
          puestoId={puesto.id}
          onToggle={(preguntaId, checked) => onTogglePregunta(puesto.id, preguntaId, checked)}
          onUpdatePregunta={(preguntaId, field, value) => onUpdatePregunta(puesto.id, preguntaId, field, value)}
          onSave={onSavePuestoPreguntas}
          onCopyFrom={onCopyPreguntasFrom}
          puestos={puestos}
          saving={saving}
        />
      )}

      {activeTab === 'config' && !editMode && (
        <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Configuración del Puesto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Nombre</label>
              <p className="text-white text-sm">{puesto.nombre}</p>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Slug (URL)</label>
              <p className="text-white text-sm font-mono">{puesto.slug}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Descripción</label>
              <p className="text-gray-400 text-sm">{puesto.descripcion || 'Sin descripción'}</p>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Estado</label>
              <p className={`text-sm font-bold ${puesto.activo ? 'text-emerald-400' : 'text-gray-500'}`}>{puesto.activo ? 'Activo' : 'Inactivo'}</p>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">URL del Formulario</label>
              <div className="flex items-center gap-2">
                <code className="text-xs text-blis-red bg-blis-red/5 px-2 py-1 rounded font-mono break-all">/formulario/postulante/{puesto.slug}</code>
                <button onClick={() => onCopyLink(puesto.slug)} className="p-1 rounded hover:bg-white/10 text-gray-400"><Copy className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
          <button onClick={() => setEditMode(true)} className="mt-4 px-4 py-2 bg-blis-red text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:scale-105 transition-all">
            Editar Configuración
          </button>
        </div>
      )}
    </div>
  )
}