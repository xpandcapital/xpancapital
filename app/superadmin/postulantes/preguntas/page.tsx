"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardList, Plus, X, Save, Trash2, ArrowUp, ArrowDown, Check } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { Pregunta, TIPO_PREGUNTA_LABELS, GRUPOS_PREGUNTAS } from '../_types'
import { SearchableSelect } from '@/components/ui/SearchableSelect'

export default function PreguntasPage() {
  const { showToast } = useToast()
  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newPregunta, setNewPregunta] = useState({ key: '', label_base: '', tipo: 'text', grupo: GRUPOS_PREGUNTAS[1], requerido: false, visible_formulario: true, visible_admin: true, texto_apoyo: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Pregunta>>({})

  const fetchPreguntas = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/postulantes/preguntas')
      const data = await res.json()
      if (data.success) setPreguntas(data.data || [])
    } catch { showToast('Error al cargar', 'error') }
    finally { setLoading(false) }
  }, [showToast])

  useEffect(() => { fetchPreguntas() }, [fetchPreguntas])

  const handleCreate = async () => {
    if (!newPregunta.key || !newPregunta.label_base) return
    setSaving('create')
    try {
      const slug = newPregunta.key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
      const res = await fetch('/api/postulantes/preguntas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPregunta, key: slug }),
      })
      const data = await res.json()
      if (data.success) {
        showToast('Pregunta creada', 'success')
        setShowCreate(false)
        setNewPregunta({ key: '', label_base: '', tipo: 'text', grupo: GRUPOS_PREGUNTAS[1], requerido: false, visible_formulario: true, visible_admin: true, texto_apoyo: '' })
        fetchPreguntas()
      } else { showToast(data.error || 'Error', 'error') }
    } catch { showToast('Error', 'error') }
    finally { setSaving(null) }
  }

  const handleUpdate = async (id: string, updates: Partial<Pregunta>) => {
    setSaving(id)
    try {
      const res = await fetch('/api/postulantes/preguntas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })
      const data = await res.json()
      if (data.success) {
        showToast('Pregunta actualizada', 'success')
        setEditingId(null)
        setEditData({})
        fetchPreguntas()
        return true
      }
      showToast(data.error || 'Error', 'error')
      return false
    } catch { showToast('Error', 'error'); return false }
    finally { setSaving(null) }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta pregunta? Se eliminará de todos los puestos y respuestas.')) return
    try {
      const res = await fetch(`/api/postulantes/preguntas?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) { showToast('Pregunta eliminada', 'success'); fetchPreguntas() }
      else showToast(data.error || 'Error', 'error')
    } catch { showToast('Error', 'error') }
  }

  const movePregunta = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= preguntas.length) return
    const reordered = [...preguntas]
    ;[reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]]
    setPreguntas(reordered)
    const updates = reordered.map((p, idx) => ({ id: p.id, orden: idx + 1 }))
    await Promise.all(updates.map(u => fetch('/api/postulantes/preguntas', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(u) })))
  }

  const grupos = [...new Set(preguntas.map(p => p.grupo))]

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-8 w-full mx-auto pb-20 px-4 md:px-8 pt-8 bg-black">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">Preguntas</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light">Banco de preguntas para formularios de postulantes. {preguntas.length} preguntas configuradas.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-blis-red text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all flex items-center gap-2 shadow-[0_10px_20px_rgba(190,11,60,0.3)]">
          <Plus className="w-4 h-4" />Nueva Pregunta
        </button>
      </div>

      {grupos.map(grupo => (
        <div key={grupo} className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-sm font-black text-white uppercase tracking-wide">{grupo}</h2>
            <p className="text-gray-500 text-[11px]">{preguntas.filter(p => p.grupo === grupo).length} preguntas</p>
          </div>
          <div className="divide-y divide-white/5">
            {preguntas.filter(p => p.grupo === grupo).sort((a, b) => a.orden - b.orden).map((pregunta, idx) => {
              const globalIdx = preguntas.indexOf(pregunta)
              const isEditing = editingId === pregunta.id
              return (
                <div key={pregunta.id} className="p-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Pregunta visible</label>
                          <input type="text" value={editData.label_base || ''} onChange={e => setEditData(prev => ({ ...prev, label_base: e.target.value }))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blis-red/50" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Variable interna (key)</label>
                          <input type="text" value={editData.key || ''} readOnly className="w-full bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-gray-500 text-sm font-mono" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Tipo</label>
                          <SearchableSelect value={editData.tipo || 'text'} onChange={v => setEditData((prev: Partial<Pregunta>) => ({ ...prev, tipo: v as Pregunta['tipo'] }))} options={Object.entries(TIPO_PREGUNTA_LABELS).map(([k, v]) => ({ value: k, label: v }))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blis-red/50" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Grupo</label>
                          <SearchableSelect value={editData.grupo || ''} onChange={v => setEditData(prev => ({ ...prev, grupo: v }))} options={GRUPOS_PREGUNTAS.map(g => ({ value: g, label: g }))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blis-red/50" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Texto de apoyo (se muestra debajo de la pregunta en el formulario)</label>
                          <input type="text" value={editData.texto_apoyo || ''} onChange={e => setEditData(prev => ({ ...prev, texto_apoyo: e.target.value }))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blis-red/50" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editData.requerido ?? false} onChange={e => setEditData(prev => ({ ...prev, requerido: e.target.checked }))} className="w-4 h-4 rounded" /><span className="text-white text-sm">Requerido</span></label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editData.visible_formulario ?? true} onChange={e => setEditData(prev => ({ ...prev, visible_formulario: e.target.checked }))} className="w-4 h-4 rounded" /><span className="text-white text-sm">Visible en formulario</span></label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editData.visible_admin ?? true} onChange={e => setEditData(prev => ({ ...prev, visible_admin: e.target.checked }))} className="w-4 h-4 rounded" /><span className="text-white text-sm">Visible en admin</span></label>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => { setEditingId(null); setEditData({}) }} className="px-3 py-1.5 bg-white/5 rounded-lg text-gray-400 text-[10px] font-bold uppercase tracking-wider hover:bg-white/10"><X className="w-3 h-3 inline mr-1" />Cancelar</button>
                        <button onClick={() => handleUpdate(pregunta.id, editData)} disabled={!!saving} className="px-3 py-1.5 bg-blis-red rounded-lg text-white text-[10px] font-bold uppercase tracking-wider hover:scale-105 disabled:opacity-50"><Save className="w-3 h-3 inline mr-1" />{saving ? '...' : 'Guardar'}</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button onClick={() => movePregunta(globalIdx, 'up')} disabled={globalIdx === 0} className="p-0.5 hover:bg-white/10 rounded text-gray-500 hover:text-white disabled:opacity-20"><ArrowUp className="w-3 h-3" /></button>
                        <button onClick={() => movePregunta(globalIdx, 'down')} disabled={globalIdx === preguntas.length - 1} className="p-0.5 hover:bg-white/10 rounded text-gray-500 hover:text-white disabled:opacity-20"><ArrowDown className="w-3 h-3" /></button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-sm font-bold text-white">{pregunta.label_base}</p>
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500 font-mono">{pregunta.key}</span>
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-blis-red/10 text-blis-red">{TIPO_PREGUNTA_LABELS[pregunta.tipo] || pregunta.tipo}</span>
                          {pregunta.requerido && <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">requerido</span>}
                          {!pregunta.visible_formulario && <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-500/10 text-gray-500 font-bold">oculta</span>}
                          {!pregunta.visible_admin && <span className="text-[8px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 font-bold">admin oculta</span>}
                        </div>
                        {pregunta.texto_apoyo && <p className="text-[11px] text-gray-600 truncate">{pregunta.texto_apoyo}</p>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => { setEditingId(pregunta.id); setEditData(pregunta) }} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white text-[10px]">Editar</button>
                        <button onClick={() => handleDelete(pregunta.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-zinc-950 border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-white uppercase tracking-wide">Nueva Pregunta</h2>
                <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-white/10 rounded-lg text-gray-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Texto de la pregunta *</label>
                  <input type="text" value={newPregunta.label_base} onChange={e => setNewPregunta(prev => ({ ...prev, label_base: e.target.value, key: prev.key || e.target.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_ ]/g, '').replace(/\s+/g, '_').replace(/_+/g, '_') }))} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Variable interna (key)</label>
                  <input type="text" value={newPregunta.key} onChange={e => setNewPregunta(prev => ({ ...prev, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') }))} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blis-red/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Tipo</label>
                    <SearchableSelect value={newPregunta.tipo} onChange={v => setNewPregunta(prev => ({ ...prev, tipo: v }))} options={Object.entries(TIPO_PREGUNTA_LABELS).map(([k, v]) => ({ value: k, label: v }))} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Grupo</label>
                    <SearchableSelect value={newPregunta.grupo} onChange={v => setNewPregunta(prev => ({ ...prev, grupo: v }))} options={GRUPOS_PREGUNTAS.map(g => ({ value: g, label: g }))} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Texto de apoyo (opcional, se muestra debajo de la pregunta)</label>
                  <input type="text" value={newPregunta.texto_apoyo || ''} onChange={e => setNewPregunta(prev => ({ ...prev, texto_apoyo: e.target.value }))} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50" />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={newPregunta.requerido} onChange={e => setNewPregunta(prev => ({ ...prev, requerido: e.target.checked }))} className="w-4 h-4 rounded" /><span className="text-white text-sm">Requerido</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={newPregunta.visible_formulario} onChange={e => setNewPregunta(prev => ({ ...prev, visible_formulario: e.target.checked }))} className="w-4 h-4 rounded" /><span className="text-white text-sm">En formulario</span></label>
                </div>
                <button onClick={handleCreate} disabled={saving === 'create' || !newPregunta.label_base} className="w-full bg-blis-red text-white py-3 rounded-xl font-bold uppercase tracking-wider hover:scale-105 transition-all disabled:opacity-50 shadow-[0_10px_20px_rgba(190,11,60,0.3)]">
                  {saving === 'create' ? 'Creando...' : 'Crear Pregunta'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}