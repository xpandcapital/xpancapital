"use client"

import Image from 'next/image'
import { Clock } from 'lucide-react'

interface Actualizacion {
  id: string
  usuario: {
    id: string
    nombre: string
    apellido?: string
    avatar_url?: string
  }
  accion: string
  hace: string
  tipo: 'post' | 'comentario' | 'evento' | 'inscripcion'
}

interface UltimasActualizacionesProps {
  actualizaciones: Actualizacion[]
}

export function UltimasActualizaciones({ actualizaciones }: UltimasActualizacionesProps) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/[0.04]">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          Últimas actualizaciones
        </h3>
      </div>
      <div className="divide-y divide-white/[0.03]">
        {actualizaciones.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-xs text-gray-600">Sin actividad reciente</p>
          </div>
        ) : (
          actualizaciones.slice(0, 5).map((a) => (
            <div key={a.id} className="px-4 py-3 flex items-start gap-3 hover:bg-white/[0.02] transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-700 ring-1 ring-white/[0.04] overflow-hidden flex-shrink-0">
                {a.usuario.avatar_url ? (
                  <Image src={a.usuario.avatar_url} alt="" width={32} height={32} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white/40">{a.usuario.nombre?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-300">
                  <span className="text-white font-medium">{a.usuario.nombre}</span>{' '}
                  {a.accion}
                </p>
                <p className="text-[10px] text-gray-600 mt-0.5">{a.hace}</p>
              </div>
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                a.tipo === 'post' ? 'bg-blue-400' :
                a.tipo === 'comentario' ? 'bg-emerald-400' :
                a.tipo === 'evento' ? 'bg-purple-400' :
                'bg-amber-400'
              }`} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
