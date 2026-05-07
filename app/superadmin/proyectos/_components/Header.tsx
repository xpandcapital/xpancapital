'use client'

import Link from 'next/link'
import { RefreshCw, FolderOpen, LayoutGrid, Table2, Download, Plus } from 'lucide-react'

interface HeaderProps {
  loadProjects: () => Promise<void>
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
  exportCSV: () => void
  onNewProject: () => void
}

export function Header({ loadProjects, viewMode, setViewMode, exportCSV, onNewProject }: HeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 font-medium">Administración</p>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
            Portafolio de <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Proyectos</span>
          </h1>
          <p className="text-white/40 text-sm max-w-xl">
            Gestiona proyectos inmobiliarios: imágenes, descripciones y colores para la landing.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={loadProjects} className="group px-5 py-3 bg-[#0a0a0a] border border-white/5 rounded-2xl text-white/60 hover:text-white hover:border-white/10 transition-all duration-300 flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Sincronizar</span>
          </button>
          <Link href="/superadmin/gestion-lotes/_none_" className="px-5 py-3 bg-[#0a0a0a] border border-white/5 rounded-2xl text-white/60 hover:text-white hover:border-white/10 transition-all duration-300 flex items-center gap-2.5">
            <FolderOpen className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Gestión de Lotes</span>
          </Link>
          <div className="flex bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`px-4 py-3 transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`} title="Vista cuadrícula">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`px-4 py-3 transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`} title="Vista lista">
              <Table2 className="w-4 h-4" />
            </button>
          </div>
          <button onClick={exportCSV} className="px-5 py-3 bg-[#0a0a0a] border border-white/5 rounded-2xl text-white/60 hover:text-white hover:border-white/10 transition-all flex items-center gap-2.5">
            <Download className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Exportar</span>
          </button>
          <button onClick={onNewProject} className="px-6 py-3 bg-blis-red rounded-2xl text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2.5 shadow-lg shadow-blis-red/20">
            <Plus className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Nuevo Proyecto</span>
          </button>
        </div>
      </div>
    </div>
  )
}
