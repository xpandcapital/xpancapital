"use client"

import { CheckCircle2, XCircle, Loader2, Star } from "lucide-react"
import type { ApiStatus } from '../_types'

interface ApiAppBarProps {
  totalApis: number
  connectedCount: number
  errorCount: number
  limitCount: number
  favoritesCount: number
}

export function ApiAppBar({
  totalApis,
  connectedCount,
  errorCount,
  limitCount,
  favoritesCount
}: ApiAppBarProps) {
  const stats = [
    { label: "Total APIs", value: totalApis, color: "text-white", bg: "from-white/10", border: "border-white/20" },
    { label: "Conectadas", value: connectedCount, color: "text-emerald-400", bg: "from-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Error", value: errorCount, color: "text-red-400", bg: "from-red-500/10", border: "border-red-500/20" },
    { label: "Límite", value: limitCount, color: "text-amber-400", bg: "from-amber-500/10", border: "border-amber-500/20" },
    { label: "Favoritas", value: favoritesCount, color: "text-purple-400", bg: "from-purple-500/10", border: "border-purple-500/20", icon: Star }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`bg-gradient-to-br ${stat.bg} to-transparent ${stat.border} rounded-xl p-3 md:p-4`}
        >
          <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm stat.color">
            {stat.icon && <stat.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />}
            {stat.label}
          </div>
          <p className={`text-xl md:text-2xl font-bold mt-1 stat.color text-center md:text-left`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  )
}