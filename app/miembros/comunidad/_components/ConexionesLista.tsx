"use client"

import Image from 'next/image'
import { Users, MessageCircle, MoreHorizontal } from 'lucide-react'

interface Conexion {
  id: string
  nombre: string
  apellido?: string
  avatar_url?: string
  rol?: string
  ultima_actividad?: string
}

interface ConexionesListaProps {
  conexiones: Conexion[]
  total: number
}

export function ConexionesLista({ conexiones, total }: ConexionesListaProps) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <MessageCircle className="w-3.5 h-3.5 text-gray-500" />
          Conexiones
        </h3>
        <span className="text-[10px] text-gray-500 bg-white/[0.03] px-2 py-0.5 rounded-full">{total}</span>
      </div>
      <div className="divide-y divide-white/[0.03]">
        {conexiones.slice(0, 6).map((c) => (
          <div key={c.id} className="px-4 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-700 ring-1 ring-white/[0.04] overflow-hidden flex-shrink-0">
              {c.avatar_url ? (
                <Image src={c.avatar_url} alt="" width={36} height={36} className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white/40">{c.nombre?.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{c.nombre} {c.apellido || ''}</p>
              <p className="text-[10px] text-gray-600">{c.rol === 'admin' ? 'Admin' : c.rol === 'editor' ? 'Editor' : 'Miembro'}</p>
            </div>
            <button className="p-1.5 text-gray-700 hover:text-gray-400 transition-colors">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      {conexiones.length > 6 && (
        <button className="w-full py-2.5 text-[11px] text-gray-500 hover:text-gray-300 hover:bg-white/[0.02] transition-colors">
          Ver todos ({total})
        </button>
      )}
    </div>
  )
}
