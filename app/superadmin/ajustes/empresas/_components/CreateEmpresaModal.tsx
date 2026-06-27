"use client"

import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { PLANES } from '../_types'
import { NativeSelect } from '@/components/ui/SearchableSelect'

interface Props {
  newEmpresa: { nombre: string; slug: string; nombre_legal: string; color_primario: string; pais_fiscal: string; moneda_base: string; idioma: string; zona_horaria: string; plan: string }
  setNewEmpresa: React.Dispatch<React.SetStateAction<typeof newEmpresa>>
  onSave: () => Promise<boolean | string>
  saving: boolean
  onClose: () => void
  generateSlug: (name: string) => string
}

export function CreateEmpresaModal({ newEmpresa, setNewEmpresa, onSave, saving, onClose, generateSlug }: Props) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-zinc-950 border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-white uppercase tracking-wide">Nueva Empresa</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-gray-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Nombre Comercial *</label>
            <input type="text" value={newEmpresa.nombre} onChange={e => setNewEmpresa(prev => ({ ...prev, nombre: e.target.value, slug: generateSlug(e.target.value) }))} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50" placeholder="Mi Empresa" />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Slug (URL) *</label>
            <input type="text" value={newEmpresa.slug} onChange={e => setNewEmpresa(prev => ({ ...prev, slug: e.target.value }))} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-blis-red/50" placeholder="mi-empresa" />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Color Primario</label>
            <div className="flex items-center gap-3">
              <input type="color" value={newEmpresa.color_primario} onChange={e => setNewEmpresa(prev => ({ ...prev, color_primario: e.target.value }))} className="w-12 h-12 rounded-xl border border-white/10 cursor-pointer" />
              <input type="text" value={newEmpresa.color_primario} onChange={e => setNewEmpresa(prev => ({ ...prev, color_primario: e.target.value }))} className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blis-red/50" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Plan</label>
            <NativeSelect value={newEmpresa.plan} onChange={v => setNewEmpresa(prev => ({ ...prev, plan: v }))} options={PLANES.map(p => ({ value: p.id, label: `${p.nombre} (${p.usuarios} users)` }))} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 appearance-none" />
          </div>
          <button onClick={onSave} disabled={saving || !newEmpresa.nombre || !newEmpresa.slug} className="w-full bg-blis-red text-white py-3 rounded-xl font-bold uppercase tracking-wider hover:scale-105 transition-all disabled:opacity-50 shadow-[0_10px_20px_rgba(190,11,60,0.3)]">
            {saving ? 'Creando...' : 'Crear Empresa'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}