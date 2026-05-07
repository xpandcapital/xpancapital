'use client'

import { motion } from 'framer-motion'
import { Edit2, ExternalLink, FolderOpen, RefreshCw, Trash2, Image as ImageIcon } from 'lucide-react'
import type { Project } from '../_types'
import { getStatusBadgeColor, getProjectSlug } from '../_types'

interface ProjectCardProps {
  project: Project
  soldLots: number
  totalLots: number
  onEdit: () => void
  onDelete: () => void
  onNotionSync: () => void
  onLotManagement: () => void
}

export function ProjectCard({ project, soldLots, totalLots, onEdit, onDelete, onNotionSync, onLotManagement }: ProjectCardProps) {
  return (
    <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all duration-500 group">
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-white/5 to-white/[0.02] overflow-hidden">
        {project.cover_image ? (
          <img src={project.cover_image} alt={project.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${getStatusBadgeColor(project.status)}`}>
            {project.status}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg border border-white/20" style={{ backgroundColor: project.primary_color }} title="Color primario" />
            {project.secondary_color && <div className="w-6 h-6 rounded-lg border border-white/20" style={{ backgroundColor: project.secondary_color }} title="Color secundario" />}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-lg font-bold text-white">{project.name}</h3>
            <p className="text-xs text-white/40 font-mono">ID: {project.id}</p>
          </div>
          {project.logo_url && (
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden">
              <img src={project.logo_url} alt={project.name} className="w-full h-full object-contain p-1" />
            </div>
          )}
        </div>
        
        {project.description && (
          <p className="text-sm text-white/50 mb-4 line-clamp-2">{project.description}</p>
        )}
        
        {/* Gallery Preview */}
        {(project.gallery_images?.length || 0) > 0 && (
          <div className="flex gap-1.5 mb-4 overflow-hidden">
            {project.gallery_images.slice(0, 4).map((img, i) => (
              <div key={i} className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            {project.gallery_images.length > 4 && (
              <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-white/40">+{project.gallery_images.length - 4}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Stats */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Vendidos</p>
            <p className="text-xl font-black text-white">{soldLots}<span className="text-white/30 text-sm">/{totalLots}</span></p>
          </div>
          {project.location && (
            <div className="flex-1">
              <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Ubicación</p>
              <p className="text-sm text-white/70 truncate">{project.location}</p>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="flex-1 py-2.5 bg-white/5 border border-white/5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all duration-300 flex items-center justify-center gap-2">
            <Edit2 className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Editar</span>
          </button>
          {project.website && (
            <a href={project.website} target="_blank" rel="noopener noreferrer" className="py-2.5 px-3 bg-white/5 border border-white/5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button onClick={onLotManagement} className="py-2.5 px-3 bg-white/5 border border-white/5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300">
            <FolderOpen className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onNotionSync}
            className="py-2.5 px-3 bg-white/5 border border-white/5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300"
            title="Sincronizar con Notion"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="py-2.5 px-3 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500/50 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-300"
            title="Eliminar proyecto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
