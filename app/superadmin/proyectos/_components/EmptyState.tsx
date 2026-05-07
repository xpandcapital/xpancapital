'use client'

import { LayoutGrid } from 'lucide-react'

interface EmptyStateProps {
  searchTerm: string
}

export function EmptyState({ searchTerm }: EmptyStateProps) {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5">
        <LayoutGrid className="w-8 h-8 text-white/20" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">No se encontraron proyectos</h3>
      <p className="text-white/40 text-sm">{searchTerm ? 'Intenta con otra búsqueda' : 'Comienza creando tu primer proyecto'}</p>
    </div>
  )
}
