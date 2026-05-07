"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { ROLE_COLORS } from '../_types'

interface RoleFormProps {
  show: boolean
  newRole: { nombre: string; label: string; descripcion: string; color: string }
  saving: string | null
  onClose: () => void
  onChange: (role: { nombre: string; label: string; descripcion: string; color: string }) => void
  onCreate: () => void
}

export function RoleForm({ show, newRole, saving, onClose, onChange, onCreate }: RoleFormProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-zinc-950 border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-white uppercase tracking-wide">Nuevo Rol</h2>
              <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Nombre del Rol (identificador) *</label>
                <input type="text" value={newRole.nombre} onChange={e => onChange({ ...newRole, nombre: e.target.value, label: newRole.label || e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 font-mono text-sm" placeholder="supervisor" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Etiqueta (nombre visible)</label>
                <input type="text" value={newRole.label} onChange={e => onChange({ ...newRole, label: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50" placeholder="Supervisor" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Descripción</label>
                <textarea value={newRole.descripcion} onChange={e => onChange({ ...newRole, descripcion: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 resize-none" rows={2} placeholder="Rol con acceso limitado a ventas y reportes" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {ROLE_COLORS.map(color => (
                    <button key={color} onClick={() => onChange({ ...newRole, color })} className={`w-10 h-10 rounded-xl border-2 transition-all ${newRole.color === color ? 'border-white scale-110' : 'border-transparent hover:border-white/30'}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
              <button onClick={onCreate} disabled={saving === 'create' || !newRole.nombre} className="w-full bg-blis-red text-white py-3 rounded-xl font-bold uppercase tracking-wider hover:scale-105 transition-all disabled:opacity-50 shadow-[0_10px_20px_rgba(190,11,60,0.3)]">
                {saving === 'create' ? 'Creando...' : 'Crear Rol'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
