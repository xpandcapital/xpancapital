'use client'

import { Search } from 'lucide-react'

interface SearchBarProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
}

export function SearchBar({ searchTerm, setSearchTerm }: SearchBarProps) {
  return (
    <div className="mb-8">
      <div className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-white/30 group-focus-within:text-white/50 transition-colors" />
        </div>
        <input type="text" placeholder="Buscar proyectos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 rounded-3xl pl-14 pr-6 py-4 text-white placeholder-white/30 focus:outline-none focus:border-white/10 focus:bg-[#0c0c0c] transition-all duration-300 text-sm" />
      </div>
    </div>
  )
}
