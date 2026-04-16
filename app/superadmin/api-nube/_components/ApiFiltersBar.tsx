"use client"

import { Search, Filter, Star, Download, Upload, X } from "lucide-react"

interface ApiFiltersBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterCost: string | null
  onCostChange: (value: string | null) => void
  filterAccess: string | null
  onAccessChange: (value: string | null) => void
  showFavoritesOnly: boolean
  onFavoritesToggle: () => void
  onExport: () => void
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ApiFiltersBar({
  searchQuery,
  onSearchChange,
  filterCost,
  onCostChange,
  filterAccess,
  onAccessChange,
  showFavoritesOnly,
  onFavoritesToggle,
  onExport,
  onImport,
}: ApiFiltersBarProps) {
  return (
    <div className="mt-6 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar APIs por nombre o categoria..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 md:pl-12 pr-4 py-2.5 md:py-3 text-sm md:text-base text-white placeholder-gray-500 focus:outline-none focus:border-blis-red/30 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <button
          onClick={onFavoritesToggle}
          className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
            showFavoritesOnly ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
          }`}
        >
          <Star className="w-3.5 h-3.5 md:w-4 md:h-4" />
          Favoritas
        </button>

        <div className="hidden md:block h-6 w-px bg-white/10" />

        <div className="flex items-center gap-1 w-full md:w-auto mt-2 md:mt-0">
          <span className="text-[10px] md:text-xs text-gray-500 uppercase mr-1">Costo:</span>
          {['gratis', 'freemium', 'pagado'].map(cost => (
            <button
              key={cost}
              onClick={() => onCostChange(filterCost === cost ? null : cost)}
              className={`px-2 py-1 md:px-3 md:py-1 rounded-lg text-[10px] md:text-xs font-bold transition-all ${
                filterCost === cost 
                  ? cost === 'gratis' ? 'bg-emerald-500/20 text-emerald-400' 
                    : cost === 'freemium' ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-red-500/20 text-red-400'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {cost}
            </button>
          ))}
        </div>

        <div className="hidden md:block h-6 w-px bg-white/10" />

        <div className="flex items-center gap-1 w-full md:w-auto">
          <span className="text-[10px] md:text-xs text-gray-500 uppercase mr-1">Acceso:</span>
          {['Publica', 'Privada'].map(access => (
            <button
              key={access}
              onClick={() => onAccessChange(filterAccess === access ? null : access)}
              className={`px-2 py-1 md:px-3 md:py-1 rounded-lg text-[10px] md:text-xs font-bold transition-all ${
                filterAccess === access 
                  ? access === 'Publica' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {access === 'Publica' ? 'Pública' : 'Privada'}
            </button>
          ))}
        </div>

        <div className="flex-1 hidden lg:block" />

        <div className="flex w-full lg:w-auto gap-2 mt-2 lg:mt-0">
          <button
            onClick={onExport}
            className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold bg-white/5 text-gray-400 border border-white/10 hover:text-white transition-all"
            title="Exportar configuracion"
          >
            <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Exportar
          </button>
          <label className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold bg-white/5 text-gray-400 border border-white/10 hover:text-white transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Importar
            <input type="file" accept=".json" onChange={onImport} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  )
}