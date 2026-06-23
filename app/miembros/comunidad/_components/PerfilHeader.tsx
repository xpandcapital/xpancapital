"use client"

import { motion } from 'framer-motion'
import { CalendarDays, Users, UserPlus, MapPin, Globe, Twitter, Youtube, Instagram, Facebook } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import type { ReactNode } from 'react'

interface PerfilHeaderProps {
  stats?: { seguidores: number; siguiendo: number }
}

export function PerfilHeader({ stats }: PerfilHeaderProps) {
  const { user } = useAuth()
  const nombre = user?.nombre || 'Usuario'
  const apellido = user?.apellido || ''
  const nombreCompleto = `${nombre} ${apellido}`.trim()
  const username = `@${(nombre + (apellido || '')).toLowerCase().replace(/\s+/g, '')}`
  const avatarUrl = user?.profilePic
  const rol = user?.role || ''

  return (
    <div className="relative">
      {/* Cover */}
      <div className="h-40 md:h-52 rounded-2xl overflow-hidden relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-blis-red/20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blis-red/20 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:48px_48px]" />
        </div>
        {/* Cover actions */}
        <div className="absolute top-3 right-3 md:top-4 md:right-4">
          <button className="px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm border border-white/[0.06] text-xs text-white/70 hover:text-white hover:bg-black/60 transition-colors">
            Editar portada
          </button>
        </div>
      </div>

      {/* Avatar + Info */}
      <div className="px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-20 relative z-10">
          {/* Avatar */}
          <div className="relative mx-auto md:mx-0 flex-shrink-0">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full ring-4 ring-black overflow-hidden bg-gradient-to-br from-blis-red/30 to-purple-500/30">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl font-black text-white/40">{nombreCompleto.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            {rol === 'admin' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black bg-blis-red text-white border border-blis-red/50 whitespace-nowrap">
                ADMIN
              </span>
            )}
          </div>

          {/* Name + Stats */}
          <div className="flex-1 text-center md:text-left pb-2">
            <h1 className="text-xl md:text-2xl font-black text-white">{nombreCompleto}</h1>
            <p className="text-gray-500 text-sm">{username} · Miembro desde 2026</p>

            <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
              <StatBadge icon={<Users className="w-3.5 h-3.5" />} value={stats?.seguidores ?? 0} label="seguidores" />
              <StatBadge icon={<UserPlus className="w-3.5 h-3.5" />} value={stats?.siguiendo ?? 0} label="siguiendo" />
              <StatBadge icon={<CalendarDays className="w-3.5 h-3.5" />} value={0} label="eventos" />
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-2 pb-2 flex-shrink-0">
            {[
              { Icon: Facebook, href: '#' },
              { Icon: Twitter, href: '#' },
              { Icon: Youtube, href: '#' },
              { Icon: Instagram, href: '#' },
            ].map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBadge({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-gray-500">{icon}</span>
      <span className="text-white font-bold">{value}</span>
      <span className="text-gray-600">{label}</span>
    </div>
  )
}
