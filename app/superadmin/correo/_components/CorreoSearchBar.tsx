'use client'

import { Search, X, Filter } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function CorreoSearchBar({ value, onChange, placeholder = 'Buscar correos...' }: Props) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white
          placeholder-gray-600 focus:outline-none focus:border-blis-red/30 focus:bg-white/[0.04] transition-all"
      />
      {value && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </motion.button>
      )}
    </div>
  )
}
