"use client"

type TabId = 'timeline'

interface ComunidadTabsProps {
  active: TabId
  onChange: (tab: TabId) => void
  counts?: Partial<Record<TabId, number>>
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'timeline', label: 'Timeline' },
]

export function ComunidadTabs({ active, onChange, counts = {} }: ComunidadTabsProps) {
  return (
    <div className="flex overflow-x-auto scrollbar-hide border-b border-white/[0.06]">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`relative px-4 md:px-5 py-3 text-xs md:text-sm font-medium transition-colors flex-shrink-0 flex items-center gap-1.5 ${
            active === id
              ? 'text-white'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {label}
          {counts[id] !== undefined && counts[id]! > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              active === id ? 'bg-blis-red/10 text-blis-red' : 'bg-white/5 text-gray-500'
            }`}>
              {counts[id]}
            </span>
          )}
          {active === id && (
            <motion.div
              layoutId="comunidad-tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blis-red"
            />
          )}
        </button>
      ))}
    </div>
  )
}

import { motion } from 'framer-motion'
