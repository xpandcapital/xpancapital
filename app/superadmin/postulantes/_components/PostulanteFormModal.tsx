"use client"

import { X, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { Postulante } from "../_types"

const ESTADOS = ["nuevo", "en_revision", "entrevista", "aceptado", "rechazado"] as const
const ESTADO_LABELS: Record<string, string> = {
  nuevo: "Nuevo", en_revision: "En Revisión", entrevista: "Entrevista",
  aceptado: "Aceptado", rechazado: "Rechazado",
}
const ESTADO_STYLES: Record<string, string> = {
  nuevo: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  en_revision: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  entrevista: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  aceptado: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  rechazado: "bg-rose-500/20 text-rose-400 border-rose-500/30",
}

interface FormField {
  nombre_completo: string; correo_contacto: string; puesto_postula: string;
  celular_contacto: string; estado: Postulante["estado"]
}

interface Props {
  form: FormField
  setForm: (f: FormField) => void
  editingPostulante: Postulante | null
  saving: boolean
  onSave: () => void
  onClose: () => void
}

export function PostulanteFormModal({ form, setForm, editingPostulante, saving, onSave, onClose }: Props) {
  const inputCls = "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blis-red"
  const labelCls = "block text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-1.5"

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80" />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg">
          <X className="w-5 h-5 text-gray-400" />
        </button>
        <h2 className="text-xl font-bold text-white mb-6">{editingPostulante ? "Editar Postulante" : "Nuevo Postulante"}</h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Nombre completo *</label>
            <input type="text" value={form.nombre_completo} onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
              className={inputCls} placeholder="Nombre completo" />
          </div>
          <div>
            <label className={labelCls}>Correo de contacto *</label>
            <input type="email" value={form.correo_contacto} onChange={(e) => setForm({ ...form, correo_contacto: e.target.value })}
              className={inputCls} placeholder="correo@ejemplo.com" />
          </div>
          <div>
            <label className={labelCls}>Puesto al que postula *</label>
            <input type="text" value={form.puesto_postula} onChange={(e) => setForm({ ...form, puesto_postula: e.target.value })}
              className={inputCls} placeholder="Ej: Desarrollador Frontend" />
          </div>
          <div>
            <label className={labelCls}>Celular de contacto</label>
            <input type="text" value={form.celular_contacto} onChange={(e) => setForm({ ...form, celular_contacto: e.target.value })}
              className={inputCls} placeholder="+51 999 999 999" />
          </div>
          {editingPostulante && (
            <div>
              <label className={labelCls}>Estado</label>
              <div className="flex flex-wrap gap-2">
                {ESTADOS.map((e) => (
                  <button key={e} onClick={() => setForm({ ...form, estado: e })}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${form.estado === e ? ESTADO_STYLES[e] : "bg-white/5 text-gray-500 border-white/10 hover:bg-white/10"}`}>
                    {ESTADO_LABELS[e]}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button onClick={onSave} disabled={saving}
            className="w-full py-3 bg-blis-red text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editingPostulante ? "Guardar Cambios" : "Crear Postulante"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}