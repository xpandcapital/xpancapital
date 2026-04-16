"use client"

import {
  Layout, UsersRound, CalendarDays, Clock,
  FileText, Palette, Share2
} from 'lucide-react'

interface EditorSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const sidebarSections = [
  {
    label: 'General',
    items: [
      { id: 'basico', icon: Layout, label: 'Detalles básicos' },
      { id: 'equipo', icon: UsersRound, label: 'Equipo & Asignación' },
    ]
  },
  {
    label: 'Disponibilidad',
    items: [
      { id: 'horarios', icon: CalendarDays, label: 'Horarios de trabajo' },
      { id: 'reglas', icon: Clock, label: 'Reglas de reserva' },
    ]
  },
  {
    label: 'Experiencia',
    items: [
      { id: 'form', icon: FileText, label: 'Formularios' },
      { id: 'apariencia', icon: Palette, label: 'Apariencia' },
    ]
  },
  {
    label: 'Publicar',
    items: [
      { id: 'compartir', icon: Share2, label: 'Compartir' },
    ]
  },
]

export function CalendarEditorSidebar({ activeTab, onTabChange }: EditorSidebarProps) {
  return (
    <div className="w-56 bg-[#0a0a0a] border-r border-white/5 flex flex-col py-6 flex-shrink-0 overflow-y-auto">
      <nav className="space-y-1 px-3">
        {sidebarSections.map(section => (
          <div key={section.label} className="mb-6">
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 px-2">
              {section.label}
            </div>
            {section.items.map(item => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blis-red/10 text-blis-red border border-blis-red/20'
                      : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">{item.label}</span>
                </button>
              )
            })}
          </div>
        ))}
      </nav>
    </div>
  )
}