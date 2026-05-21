'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Inbox, Send, FileText, AlertTriangle, Trash2, Archive, Star,
  ChevronDown, Plus, Settings, LogOut, Loader2,
} from 'lucide-react'
import type { EmailFolder } from '../_types'

interface Props {
  folders: EmailFolder[]
  activeFolder: string
  onFolderChange: (folder: string) => void
  onRedactar: () => void
  onDesconectar: () => void
  loading?: boolean
}

const FOLDER_ICONS: Record<string, any> = {
  INBOX: Inbox,
  SENT: Send,
  DRAFTS: FileText,
  SPAM: AlertTriangle,
  JUNK: AlertTriangle,
  TRASH: Trash2,
  ARCHIVE: Archive,
  FLAGGED: Star,
}

function getFolderIcon(name: string) {
  const upper = name.toUpperCase()
  for (const key of Object.keys(FOLDER_ICONS)) {
    if (upper.includes(key)) return FOLDER_ICONS[key]
  }
  return ChevronDown
}

function getFolderLabel(name: string): string {
  const map: Record<string, string> = {
    INBOX: 'Bandeja de Entrada',
    SENT: 'Enviados',
    DRAFTS: 'Borradores',
    SPAM: 'Spam',
    JUNK: 'Spam',
    TRASH: 'Papelera',
    ARCHIVE: 'Archivados',
    FLAGGED: 'Destacados',
  }
  const upper = name.toUpperCase()
  for (const key of Object.keys(map)) {
    if (upper === key || upper === `INBOX.${key}`) return map[key]
  }
  return name
}

export function CorreoSidebar({ folders, activeFolder, onFolderChange, onRedactar, onDesconectar, loading }: Props) {
  const [colapsado, setColapsado] = useState(false)

  const carpetasPrincipales = folders.filter(f => {
    const n = f.name.toUpperCase()
    return n === 'INBOX' || n.includes('SENT') || n.includes('DRAFT') || n.includes('SPAM') || n.includes('JUNK') || n.includes('TRASH') || n.includes('ARCHIVE')
  })

  const otrasCarpetas = folders.filter(f => !carpetasPrincipales.includes(f))

  return (
    <div className="w-56 shrink-0 border-r border-white/5 bg-zinc-950/50 flex flex-col h-full">
      <div className="p-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onRedactar}
          className="w-full py-2.5 rounded-xl bg-blis-red text-white text-sm font-semibold
            hover:bg-blis-red-neon transition-all duration-300
            flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Redactar
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="space-y-0.5">
            {carpetasPrincipales.map((folder) => {
              const Icon = getFolderIcon(folder.name)
              const active = activeFolder === folder.path
              const label = getFolderLabel(folder.name)

              return (
                <motion.button
                  key={folder.path}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onFolderChange(folder.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200
                    ${active
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-blis-red' : ''}`} />
                  <span className="truncate">{label}</span>
                </motion.button>
              )
            })}

            {otrasCarpetas.length > 0 && (
              <>
                <div className="h-px bg-white/5 mx-3 my-2" />
                {otrasCarpetas.map((folder) => {
                  const Icon = getFolderIcon(folder.name)
                  const active = activeFolder === folder.path

                  return (
                    <motion.button
                      key={folder.path}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onFolderChange(folder.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200
                        ${active
                          ? 'bg-white/10 text-white font-semibold'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="truncate">{folder.name}</span>
                    </motion.button>
                  )
                })}
              </>
            )}
          </div>
        )}
      </div>

      <div className="p-2 border-t border-white/5">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onDesconectar}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500
            hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Desconectar</span>
        </motion.button>
      </div>
    </div>
  )
}
