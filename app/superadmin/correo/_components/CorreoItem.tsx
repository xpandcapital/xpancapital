'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Paperclip, Star, Check, Trash2, AlertTriangle } from 'lucide-react'
import type { EmailMessageSummary } from '../_types'

interface Props {
  message: EmailMessageSummary
  isSelected: boolean
  isChecked: boolean
  onCheck: (uid: number) => void
  onSelect: (uid: number) => void
  onClick: (uid: number) => void
  onStar: (uid: number) => void
  onSwipeDelete?: (uid: number) => void
  onSwipeSpam?: (uid: number) => void
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffHrs = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  if (diffHrs < 24) return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  if (diffHrs < 48) return 'Ayer'
  if (diffHrs < 168) return date.toLocaleDateString('es-ES', { weekday: 'short' })
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0].substring(0, 2).toUpperCase()
}

const AVATAR_COLORS = [
  'bg-blis-red/20 text-blis-red', 'bg-amber-500/20 text-amber-500', 'bg-emerald-500/20 text-emerald-500',
  'bg-blue-500/20 text-blue-500', 'bg-purple-500/20 text-purple-500', 'bg-cyan-500/20 text-cyan-500', 'bg-rose-500/20 text-rose-500',
]

function avatarColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

const SWIPE_THRESHOLD = 80

export function CorreoItem({ message, isSelected, isChecked, onCheck, onSelect, onClick, onStar, onSwipeDelete, onSwipeSpam }: Props) {
  const name = message.fromName || message.from
  const initials = getInitials(name)
  const x = useMotionValue(0)
  const constraintsRef = useRef<HTMLDivElement>(null)

  // Opacidad de fondos de accion basado en swipe
  const spamOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1])
  const deleteOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0])

  const handleDragEnd = () => {
    const currentX = x.get()
    if (currentX > SWIPE_THRESHOLD && onSwipeSpam) {
      onSwipeSpam(message.uid)
    } else if (currentX < -SWIPE_THRESHOLD && onSwipeDelete) {
      onSwipeDelete(message.uid)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, overflow: 'hidden' }}
      transition={{ duration: 0.15 }}
      className="relative overflow-hidden border-b border-white/[0.03]"
      ref={constraintsRef}
    >
      {/* Swipe backgrounds */}
      <div className="absolute inset-0 flex items-center pointer-events-none">
        {/* Spam - left side (amber) */}
        <motion.div
          style={{ opacity: spamOpacity }}
          className="flex-1 h-full flex items-center justify-start pl-6 bg-amber-500/20"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold text-amber-400">Spam</span>
          </div>
        </motion.div>
        {/* Delete - right side (red) */}
        <motion.div
          style={{ opacity: deleteOpacity }}
          className="flex-1 h-full flex items-center justify-end pr-6 bg-red-500/20"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-red-400">Eliminar</span>
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
        </motion.div>
      </div>

      {/* Draggable card */}
      <motion.div
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0.5}
        onDragEnd={handleDragEnd}
        style={{ x, position: 'relative' }}
        whileTap={{ cursor: 'grabbing' }}
        className={`flex items-start gap-2.5 px-3 py-2.5 cursor-pointer transition-colors duration-150 relative z-10 bg-zinc-950
          ${isChecked ? 'bg-blis-red/10!important' : ''}
          ${isSelected ? 'bg-blis-red/8!important' : ''}
          ${!isSelected && !isChecked && message.isRead ? '' : !isSelected && !isChecked ? 'bg-white/[0.05]!important' : ''}
          hover:bg-white/[0.03]`}
      >
        {/* Avatar con flip + dot */}
        <div
          className="relative shrink-0 cursor-pointer"
          onClick={(e) => { e.stopPropagation(); onCheck(message.uid) }}
          style={{ perspective: '400px' }}
        >
          <motion.div animate={{ rotateY: isChecked ? 180 : 0 }} transition={{ duration: 0.25 }} style={{ transformStyle: 'preserve-3d' }}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold ${avatarColor(name)}`} style={{ backfaceVisibility: 'hidden' }}>
              {initials}
            </div>
            <div className="absolute inset-0 w-9 h-9 rounded-xl bg-blis-red flex items-center justify-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <Check className="w-4 h-4 text-white" />
            </div>
          </motion.div>
          {!message.isRead && (
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.6)] ring-1 ring-zinc-950" />
          )}
        </div>

        <div onClick={() => onClick(message.uid)} className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-sm line-clamp-2 leading-snug ${message.isRead ? 'text-gray-400 font-normal' : 'text-gray-100 font-semibold'}`}>
              {name}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {message.hasAttachments && <Paperclip className="w-3 h-3 text-gray-500" />}
              <span className="text-[11px] text-gray-500">{formatDate(message.date)}</span>
            </div>
          </div>
          <div className="flex items-start justify-between gap-2 mt-0.5">
            <span className={`text-sm line-clamp-3 leading-snug flex-1 ${message.isRead ? 'text-gray-500 font-normal' : 'text-gray-200 font-medium'}`}>
              {message.subject}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onStar(message.uid) }}
              className="p-0.5 rounded hover:bg-white/5 transition-colors shrink-0 mt-0.5"
            >
              <Star className={`w-4 h-4 ${message.isFlagged ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
