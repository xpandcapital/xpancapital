"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, Loader2 } from 'lucide-react'

interface CreatePuestoModalProps {
  open: boolean
  onClose: () => void
  onCreated: (nombre: string, descripcion?: string) => Promise<any>
  saving: boolean
}

export function CreatePuestoModal({ open, onClose, onCreated, saving }: CreatePuestoModalProps) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')

  const handleCreate = async () => {
    if (!nombre.trim()) return
    const result = await onCreated(nombre.trim(), descripcion.trim() || undefined)
    if (result) {
      setNombre('')
      setDescripcion('')
      onClose()
    }
  }

  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-950 border border-white/10 rounded-2xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-white uppercase tracking-wide">Nuevo Puesto</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Nombre del Puesto *</label>
            <input
              type="text" value={nombre} onChange={e => setNombre(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50"
              placeholder="ej: Gerente Comercial"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Descripción</label>
            <textarea
              value={descripcion} onChange={e => setDescripcion(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 resize-none"
              rows={2} placeholder="Descripción breve del puesto"
            />
          </div>
          <button
            onClick={handleCreate} disabled={saving || !nombre.trim()}
            className="w-full bg-blis-red text-white py-3 rounded-xl font-bold uppercase tracking-wider hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(213,193,8,0.3)]"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? 'Creando...' : 'Crear Puesto'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
