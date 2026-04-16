"use client"

import { Search, Filter, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import type { Category } from '../../_types'

interface SearchFilterBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  categoryFilters: string[]
  onCategoryChange: (filters: string[]) => void
  categories: string[]
}

export function SearchFilterBar({
  searchTerm,
  onSearchChange,
  categoryFilters,
  onCategoryChange,
  categories
}: SearchFilterBarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const handleCategoryClick = (category: string) => {
    if (category === 'Todas') {
      onCategoryChange(['Todas'])
    } else {
      let newFilters = categoryFilters.filter(f => f !== 'Todas')
      if (categoryFilters.includes(category)) {
        newFilters = newFilters.filter(f => f !== category)
        if (newFilters.length === 0) newFilters = ['Todas']
      } else {
        newFilters.push(category)
      }
      onCategoryChange(newFilters)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-stretch lg:items-center justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar productos..."
          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:outline-none focus:border-blis-red transition-all"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="relative flex-initial">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/5 text-gray-500 hover:text-white transition-all relative"
          title="Filtrar por Categoría"
        >
          <Filter className="w-4 h-4 text-blis-red" />
          {!categoryFilters.includes('Todas') && (
            <span className="absolute -top-1 -right-1 bg-blis-red text-white text-[8px] font-black min-w-[14px] h-[14px] rounded-full flex items-center justify-center">
              {categoryFilters.length}
            </span>
          )}
        </button>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full right-0 mt-2 bg-zinc-950 border border-white/10 rounded-3xl p-2 shadow-2xl z-[1001] min-w-[200px] sm:min-w-[240px] backdrop-blur-2xl"
            >
              <div className="flex flex-col gap-1">
                {categories.map((c) => {
                  const isSelected = categoryFilters.includes(c)
                  return (
                    <button
                      key={c}
                      onClick={() => handleCategoryClick(c)}
                      className={`flex items-center justify-between px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSelected ? 'bg-blis-red text-white' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
                    >
                      {c}
                      {isSelected && <Check className="w-3 h-3" />}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}