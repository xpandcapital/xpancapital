'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface BuilderButtonProps {
  icon: LucideIcon
  label: string
  onClick: () => void
}

export function BuilderButton({ icon: Icon, label, onClick }: BuilderButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-[11px] font-bold text-gray-400 hover:border-blis-red/40 hover:text-white transition-all"
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </motion.button>
  )
}