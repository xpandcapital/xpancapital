'use client'

import type { Project } from '../_types'
import { ProjectCard } from './ProjectCard'
import { getProjectSlug } from '../_types'

interface ProjectGridProps {
  projects: Project[]
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  onNotionSync: (project: Project) => void
  onLotManagement: (project: Project) => void
}

export function ProjectGrid({ projects, onEdit, onDelete, onNotionSync, onLotManagement }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {projects.map((project) => {
        const lots = (project.lots || []).filter((l: any) =>
          !l.lot_number?.toLowerCase().includes('desistido') &&
          !l.lot_number?.toLowerCase().includes('cancelado') &&
          l.status !== 'Desistido'
        )
        const soldLots = lots.filter((l: any) =>
          l.status === 'Vendido' || (
            l.client_name &&
            l.client_name !== 'No especificado' &&
            l.client_name !== ''
          )
        ).length
        const totalLots = lots.length

        return (
          <ProjectCard
            key={project.id}
            project={project}
            soldLots={soldLots}
            totalLots={totalLots}
            onEdit={() => onEdit(project)}
            onDelete={() => onDelete(project)}
            onNotionSync={() => onNotionSync(project)}
            onLotManagement={() => onLotManagement(project)}
          />
        )
      })}
    </div>
  )
}
