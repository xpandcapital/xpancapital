'use client'

import { motion } from 'framer-motion'
import { Paperclip, Star } from 'lucide-react'
import type { EmailMessageSummary } from '../_types'

interface Props {
  message: EmailMessageSummary
  isSelected: boolean
  onSelect: (uid: number) => void
  onClick: (uid: number) => void
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHrs = diffMs / (1000 * 60 * 60)

  if (diffHrs < 24) {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  } else if (diffHrs < 48) {
    return 'Ayer'
  } else if (diffMs < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString('es-ES', { weekday: 'short' })
  } else {
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }
}

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0].substring(0, 2).toUpperCase()
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-blis-red/20 text-blis-red',
    'bg-amber-500/20 text-amber-500',
    'bg-emerald-500/20 text-emerald-500',
    'bg-blue-500/20 text-blue-500',
    'bg-purple-500/20 text-purple-500',
    'bg-cyan-500/20 text-cyan-500',
    'bg-rose-500/20 text-rose-500',
  ]
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function CorreoItem({ message, isSelected, onSelect, onClick }: Props) {
  const name = message.fromName || message.from
  const initials = getInitials(name)
  const avatarColor = getAvatarColor(name)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`group relative flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-white/[0.03]
        transition-all duration-200
        ${isSelected
          ? 'bg-blis-red/5 border-l-2 border-l-blis-red'
          : 'border-l-2 border-l-transparent hover:bg-white/[0.02]'
        }
        ${!message.isRead ? 'bg-white/[0.02]' : ''}
      `}
      onClick={() => onClick(message.uid)}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${avatarColor}`}
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm truncate ${message.isRead ? 'text-gray-300' : 'text-white font-semibold'}`}>
            {name}
          </span>
          <span className="text-[11px] text-gray-500 shrink-0">
            {formatDate(message.date)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className={`text-sm truncate ${message.isRead ? 'text-gray-400' : 'text-white/90 font-medium'}`}>
            {message.subject}
          </span>
          {message.isFlagged && <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-600 truncate">
            {message.isRead ? '' : '● '}
          </span>
          {message.hasAttachments && (
            <Paperclip className="w-3 h-3 text-gray-500 shrink-0" />
          )}
        </div>
      </div>
    </motion.div>
  )
}
