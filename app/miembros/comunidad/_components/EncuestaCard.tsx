"use client"

import { motion } from 'framer-motion'
import type { ComunidadEncuesta, ComunidadEncuestaOpcion } from '../_types'

interface EncuestaCardProps {
  encuesta: ComunidadEncuesta
  onVotar: (opcionId: string) => void
}

export function EncuestaCard({ encuesta, onVotar }: EncuestaCardProps) {
  const cerrada = !!(encuesta.fecha_cierre && new Date(encuesta.fecha_cierre) < new Date())
  const yaVoto = encuesta.usuario_voto && encuesta.usuario_voto.length > 0
  const maxVotos = encuesta.opciones.reduce((max, op) => Math.max(max, op.votos_count || 0), 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-amber-400 text-lg">📊</span>
        <h4 className="text-white font-semibold text-sm md:text-base">{encuesta.pregunta}</h4>
      </div>

      {encuesta.multiple && (
        <p className="text-[11px] text-gray-500">Puedes elegir varias opciones</p>
      )}

      <div className="space-y-2">
        {encuesta.opciones.map((opcion) => {
          const pct = maxVotos > 0 ? ((opcion.votos_count || 0) / Math.max(maxVotos, 1)) * 100 : 0
          const votada = opcion.votada

          return (
            <button
              key={opcion.id}
              onClick={() => !cerrada && onVotar(opcion.id)}
              disabled={cerrada}
              className={`w-full text-left relative rounded-xl border overflow-hidden transition-all ${
                votada ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10'
              } ${cerrada ? 'cursor-default opacity-70' : 'cursor-pointer'}`}
            >
              <div className="relative z-10 px-4 py-3 flex justify-between items-center">
                <span className={`text-sm ${votada ? 'text-amber-300 font-medium' : 'text-gray-300'}`}>{opcion.texto}</span>
                {(yaVoto || cerrada) && (
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {opcion.votos_count || 0} {opcion.votos_count === 1 ? 'voto' : 'votos'} ({pct.toFixed(0)}%)
                  </span>
                )}
              </div>
              {(yaVoto || cerrada) && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="absolute left-0 top-0 h-full bg-amber-500/10 rounded-xl"
                />
              )}
            </button>
          )
        })}
      </div>

      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{encuesta.total_votos || 0} votos totales</span>
        {cerrada && <span className="text-red-400">Encuesta cerrada</span>}
        {!cerrada && encuesta.fecha_cierre && (
          <span>Cierra: {new Date(encuesta.fecha_cierre).toLocaleDateString('es-PE')}</span>
        )}
      </div>
    </div>
  )
}
