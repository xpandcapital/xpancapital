"use client"

import { List, Rows, LayoutGrid } from "lucide-react"
import type { ViewMode } from '../../_types'

interface ViewModeToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  const modes: Array<{ id: ViewMode; icon: typeof List; label: string }> = [
    { id: 'compact', icon: List, label: 'Vista Compacta' },
    { id: 'list', icon: Rows, label: 'Vista de Lista' },
    { id: 'grid', icon: LayoutGrid, label: 'Vista de Cuadrícula' }
  ]

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-1 flex shrink-0">
      {modes.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onViewModeChange(id)}
          className={`p-2.5 sm:p-3 rounded-xl transition-all ${viewMode === id ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          title={label}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  )
}