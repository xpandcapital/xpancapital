"use client"

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, Trash2, Globe } from 'lucide-react'
import { Empresa, PLANES } from '../_types'

interface Props {
  empresa: Empresa
  onDelete: (id: string) => Promise<boolean | string>
  onViewUsers: (id: string) => void
  deleting: string | null
  mainEmpresaId: string
}

export function EmpresaCard({ empresa, onDelete, onViewUsers, deleting, mainEmpresaId }: Props) {
  const router = useRouter()
  const isMain = empresa.id === mainEmpresaId

  return (
    <motion.div layout className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden hover:border-blis-red/30 transition-all group">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg" style={{ backgroundColor: empresa.color_primario || '#d5c108' }}>
              {empresa.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-bold text-sm truncate">{empresa.nombre}</h3>
              <p className="text-gray-500 text-[10px] font-mono">/{empresa.slug}</p>
            </div>
          </div>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${empresa.activo ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
            {empresa.activo ? 'Activa' : 'Inactiva'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-2 rounded-lg bg-white/[0.02]">
            <div className="text-white font-bold text-sm">{empresa.user_count || 0}</div>
            <div className="text-[9px] text-gray-600 uppercase tracking-wider">Usuarios</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/[0.02]">
            <div className="text-white font-bold text-sm capitalize">{PLANES.find(p => p.id === empresa.plan)?.nombre || empresa.plan}</div>
            <div className="text-[9px] text-gray-600 uppercase tracking-wider">Plan</div>
          </div>
        </div>

        {empresa.pais_fiscal && (
          <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-3">
            <Globe className="w-3 h-3" />
            <span>{empresa.pais_fiscal} · {empresa.moneda_base} · {empresa.idioma?.toUpperCase()}</span>
          </div>
        )}

        {empresa.dominio_principal && (
          <div className="text-[11px] text-gray-500 mb-3 truncate">{empresa.dominio_principal}</div>
        )}

        <div className="flex items-center gap-2 pt-3 border-t border-white/5">
          <button onClick={() => onViewUsers(empresa.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[11px] font-bold transition-colors">
            <Users className="w-3.5 h-3.5" />Usuarios
          </button>
          <button onClick={() => router.push(`/superadmin/ajustes/empresas/${empresa.id}`)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blis-red/10 hover:bg-blis-red text-gray-300 hover:text-white text-[11px] font-bold transition-colors">
            Configurar
          </button>
          {!isMain && (
            <button onClick={() => onDelete(empresa.id)} disabled={deleting === empresa.id} className="flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
