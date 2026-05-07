'use client'

import { useRouter } from 'next/navigation'
import { Edit2, FolderOpen, RefreshCw, Trash2 } from 'lucide-react'
import type { Project } from '../_types'
import { getStatusBadgeColor, getProjectSlug } from '../_types'

interface ProjectListViewProps {
  projects: Project[]
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  onNotionSync: (project: Project) => void
  onLotManagement: (project: Project) => void
}

export function ProjectListView({ projects, onEdit, onDelete, onNotionSync, onLotManagement }: ProjectListViewProps) {
  const router = useRouter()

  return (
    <div className="mb-6 overflow-hidden rounded-3xl border border-white/5">
      <table className="w-full">
        <thead>
          <tr className="bg-white/[0.02] border-b border-white/5">
            {['Proyecto', 'Estado', 'Ubicación', 'Lotes', 'Vendidos', 'Disponibles', 'Acciones'].map(h => (
              <th key={h} className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-widest text-white/30">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.03]">
          {projects.map(project => {
            const lots = (project.lots || []).filter((l: any) =>
              !l.lot_number?.toLowerCase().includes('desistido') &&
              !l.lot_number?.toLowerCase().includes('cancelado') &&
              l.status !== 'Desistido'
            )
            const sold = lots.filter((l: any) => l.status === 'Vendido' || (l.client_name && l.client_name !== 'No especificado' && l.client_name !== '')).length
            const available = lots.length - sold
            return (
              <tr key={project.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {project.cover_image && <img src={project.cover_image} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />}
                    <div>
                      <p className="text-sm font-bold text-white">{project.name}</p>
                      <p className="text-[10px] text-white/30 font-mono">{project.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase ${getStatusBadgeColor(project.status)}`}>{project.status}</span>
                </td>
                <td className="px-5 py-4 text-sm text-white/50">{project.location || '—'}</td>
                <td className="px-5 py-4 text-sm font-black text-white">{lots.length}</td>
                <td className="px-5 py-4 text-sm font-black text-emerald-400">{sold}</td>
                <td className="px-5 py-4 text-sm font-black text-amber-400">{available}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(project)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all" title="Editar"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onLotManagement(project)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all" title="Gestión de lotes"><FolderOpen className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onNotionSync(project)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all" title="Sincronizar Notion"><RefreshCw className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onDelete(project)} className="p-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-500/50 hover:text-red-400 transition-all" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
