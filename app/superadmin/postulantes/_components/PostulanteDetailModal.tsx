"use client"

import { X } from "lucide-react"
import { motion } from "framer-motion"
import {
  Postulante, diccionarioPreguntas, gruposPreguntas,
} from "../_types"

const ESTADO_LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  en_revision: "En Revisión",
  entrevista: "Entrevista",
  aceptado: "Aceptado",
  rechazado: "Rechazado",
}

const ESTADO_STYLES: Record<string, string> = {
  nuevo: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  en_revision: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  entrevista: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  aceptado: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  rechazado: "bg-rose-500/20 text-rose-400 border-rose-500/30",
}

const GRUPO_ICONS: Record<string, string> = {
  Settings: "⚙️",
  User: "👤",
  Truck: "🚛",
  GraduationCap: "🎓",
  Briefcase: "💼",
  Brain: "🧠",
  Target: "🎯",
}

interface Props {
  postulante: Postulante
  onClose: () => void
}

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—"
  if (key === "estado") return ESTADO_LABELS[value as string] ?? String(value)
  if (key === "check_portafolio") return value ? "Sí" : "No"
  if (key === "fecha_entrevista" || key === "fecha_nacimiento" || key === "creado_en" || key === "actualizado_en") {
    try { return new Date(value as string).toLocaleDateString("es-ES") } catch { return String(value) }
  }
  return String(value)
}

export function PostulanteDetailModal({ postulante, onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80" />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg">
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">{postulante.nombre_completo}</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-bold border ${ESTADO_STYLES[postulante.estado]}`}>
              {ESTADO_LABELS[postulante.estado]}
            </span>
            {postulante.puesto_postula && (
              <span className="text-sm text-gray-400">{postulante.puesto_postula}</span>
            )}
            {postulante.correo_contacto && (
              <span className="text-sm text-gray-500">{postulante.correo_contacto}</span>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {gruposPreguntas.map((grupo) => (
            <div key={grupo.titulo} className="bg-black/30 border border-white/5 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>{GRUPO_ICONS[grupo.icon] || "📋"}</span>
                {grupo.titulo}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {grupo.campos.map((campo) => {
                  const value = (postulante as unknown as Record<string, unknown>)[campo]
                  return (
                    <div key={campo} className="bg-zinc-900/50 border border-white/5 rounded-lg p-3">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-1">
                        {diccionarioPreguntas[campo] || campo}
                      </p>
                      <p className="text-sm text-white whitespace-pre-wrap break-words">
                        {formatValue(campo, value)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}