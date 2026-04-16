"use client"

import { motion, AnimatePresence } from "framer-motion"
import { LucideIcon, ChevronDown } from "lucide-react"

interface ApiCategoryProps {
  id: string
  title: string
  icon: LucideIcon
  color: string
  description: string
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

export function ApiCategory({
  id,
  title,
  icon: Icon,
  color,
  description,
  isExpanded,
  onToggle,
  children
}: ApiCategoryProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-black text-white uppercase tracking-tight">{title}</h3>
            <p className="text-[11px] text-gray-500 font-medium">{description}</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="text-gray-500"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}