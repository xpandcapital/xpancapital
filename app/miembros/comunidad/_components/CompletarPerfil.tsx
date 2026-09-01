"use client"

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Award, Star, UserCheck, BookOpen, Phone, MapPin, Camera } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getProfileCompleteness } from '@/lib/profile-completeness'

const ICONOS: Record<string, typeof Award> = {
  avatar: Camera,
  nombre: UserCheck,
  telefono: Phone,
  ubicacion: MapPin,
  biografia: BookOpen,
  sociales: Star,
}

export function CompletarPerfil() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Record<string, any> | null>(null)

  useEffect(() => {
    if (!user?.id) return
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setProfile(d.data) })
      .catch(() => {})
  }, [user?.id])

  const { pct, tasks } = getProfileCompleteness(profile)

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/[0.04]">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
          Completa tu perfil
        </h3>
      </div>
      <div className="p-4 space-y-4">
        {/* Ring chart */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgb(255 255 255 / 0.06)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none" stroke="rgb(190 11 36)" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${((pct / 100) * 264).toFixed(0)} 264`}
                initial={{ strokeDashoffset: 264 }}
                animate={{ strokeDashoffset: (264 - (pct / 100) * 264).toFixed(0) }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-lg font-black text-white">{pct}%</span>
                <p className="text-[9px] text-gray-500">Completado</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-2">
          {tasks.map((t) => {
            const Icon = ICONOS[t.key] || Award
            return (
              <div key={t.key} className="flex items-center gap-2.5 text-xs">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  t.done ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.03] text-gray-600'
                }`}>
                  {t.done ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <Icon className="w-3 h-3" />
                  )}
                </div>
                <span className={`flex-1 min-w-0 truncate ${t.done ? 'text-gray-500' : 'text-gray-400'}`}>{t.label}</span>
                {t.done ? (
                  <span className="text-[10px] text-emerald-400">✓</span>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
