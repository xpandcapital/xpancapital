"use client"

import Image from 'next/image'
import { Users } from 'lucide-react'

interface MiembroCard {
  id: string
  nombre: string
  apellido?: string
  avatar_url?: string
  rol?: string
}

interface MiembrosSeguidosProps {
  miembros: MiembroCard[]
}

export function MiembrosSeguidos({ miembros }: MiembrosSeguidosProps) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-gray-500" />
          Miembros
        </h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3">
          {miembros.slice(0, 9).map((m) => (
            <div key={m.id} className="flex flex-col items-center gap-1.5 group cursor-pointer">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-700 ring-1 ring-white/[0.04] overflow-hidden group-hover:ring-blis-red/30 transition-all">
                {m.avatar_url ? (
                  <Image src={m.avatar_url} alt="" width={44} height={44} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white/40">{m.nombre?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-gray-500 group-hover:text-gray-300 text-center leading-tight line-clamp-1">
                {m.nombre}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
