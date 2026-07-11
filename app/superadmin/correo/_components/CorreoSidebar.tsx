'use client'

import { motion } from 'framer-motion'
import { Inbox, Send, FileText, AlertTriangle, Trash2, Archive, Star, ChevronDown, Plus, LogOut, Loader2, Mail, UserPlus, Settings, ChevronUp } from 'lucide-react'
import type { EmailFolder, EmailCuenta } from '../_types'

interface Props {
  folders: EmailFolder[]
  activeFolder: string
  onFolderChange: (folder: string) => void
  onRedactar: () => void
  onDesconectar: () => void
  onSwitchCuenta: (cuenta: EmailCuenta) => void
  onAgregarCuenta: () => void
  onConfigCuenta: () => void
  moverCuentaArriba: (id: string) => void
  moverCuentaAbajo: (id: string) => void
  onToggleSplit: () => void
  onToggleTheme: () => void
  onExportPDF: () => void
  cuentas: EmailCuenta[]
  cuentaActiva: EmailCuenta | null
  loading?: boolean
  splitVertical: boolean
  themeLight: boolean
}

const FOLDER_LABELS: Record<string, string> = {
  INBOX: 'Bandeja', SENT: 'Enviados', DRAFTS: 'Borradores',
  SPAM: 'Spam', JUNK: 'Spam', TRASH: 'Papelera', ARCHIVE: 'Archivados', FLAGGED: 'Destacados',
}

function getFolderIcon(name: string) {
  const u = name.toUpperCase()
  if (u === 'INBOX' || u.includes('INBOX')) return Inbox
  if (u.includes('SENT') || u.includes('ENVIADOS')) return Send
  if (u.includes('DRAFT') || u.includes('BORRADOR')) return FileText
  if (u.includes('SPAM') || u.includes('JUNK') || u.includes('NO DESEADO')) return AlertTriangle
  if (u.includes('TRASH') || u.includes('PAPELERA') || u.includes('ELIMINADO')) return Trash2
  if (u.includes('ARCHIVE') || u.includes('ARCHIVO')) return Archive
  if (u.includes('FLAGGED') || u.includes('DESTACAD')) return Star
  return ChevronDown
}

function getFolderLabel(name: string): string {
  const u = name.toUpperCase()
  for (const [k, v] of Object.entries(FOLDER_LABELS)) {
    if (u === k || u === `INBOX.${k}` || u.includes(k)) return v
  }
  return name
}

function getInitials(email: string): string {
  return email.substring(0, 2).toUpperCase()
}

export function CorreoSidebar({
  folders, activeFolder, onFolderChange, onRedactar, onDesconectar,
  onSwitchCuenta, onAgregarCuenta, onConfigCuenta, moverCuentaArriba, moverCuentaAbajo,
  onToggleSplit, onToggleTheme, onExportPDF,
  cuentas, cuentaActiva, loading, splitVertical, themeLight
}: Props) {
  const sortedFolders = () => {
    const order = ['INBOX', 'SENT', 'DRAFTS', 'SPAM', 'JUNK', 'TRASH', 'ARCHIVE', 'FLAGGED']
    return [...folders].sort((a, b) => {
      const ai = order.findIndex(o => a.name.toUpperCase().includes(o))
      const bi = order.findIndex(o => b.name.toUpperCase().includes(o))
      if (ai >= 0 && bi >= 0) return ai - bi
      if (ai >= 0) return -1
      if (bi >= 0) return 1
      return a.name.localeCompare(b.name)
    })
  }

  return (
    <div className="w-full shrink-0 border-r border-white/5 bg-zinc-950 flex flex-col h-full">
      {/* Cuentas activas */}
      <div className="p-2 border-b border-white/5 space-y-1">
        {cuentas.map((c, idx) => (
          <div key={c.id} className="group flex items-center gap-0.5">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => onSwitchCuenta(c)}
              className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all
                ${c.id === cuentaActiva?.id ? 'bg-white/10 text-white font-semibold' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              {c.avatar_url ? (
                <img src={c.avatar_url} alt="" className="w-5 h-5 rounded-md object-cover" />
              ) : (
                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold`}
                  style={c.id === cuentaActiva?.id ? { backgroundColor: (c.color || '#d5c108') + '30', color: c.color || '#d5c108' } : { backgroundColor: 'rgba(255,255,255,0.05)', color: '#6b7280' }}>
                  {getInitials(c.nombre_mostrado || c.email)}
                </span>
              )}
              <span className="truncate">{c.nombre_mostrado || c.email.split('@')[0]}</span>
            </motion.button>
            {/* Flechas de orden */}
            <div className="hidden group-hover:flex flex-col opacity-60">
              <button
                onClick={(e) => { e.stopPropagation(); moverCuentaArriba(c.id) }}
                disabled={idx === 0}
                className="p-0.5 hover:text-white disabled:opacity-20"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); moverCuentaAbajo(c.id) }}
                disabled={idx === cuentas.length - 1}
                className="p-0.5 hover:text-white disabled:opacity-20"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onAgregarCuenta}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:text-white hover:bg-white/5 transition-all border border-dashed border-white/10"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Agregar cuenta</span>
        </motion.button>
      </div>

      {/* Redactar */}
      <div className="p-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onRedactar}
          className="w-full py-2.5 rounded-xl bg-blis-red text-white text-sm font-semibold hover:bg-blis-red-neon transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Redactar
        </motion.button>
      </div>

      {/* Folders */}
      <div className="flex-1 overflow-y-auto px-2 scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-500" /></div>
        ) : (
          <div className="space-y-0.5">
            {sortedFolders().map((folder) => {
              const Icon = getFolderIcon(folder.name)
              const active = activeFolder === folder.path
              return (
                <motion.button
                  key={folder.path}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onFolderChange(folder.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200
                    ${active ? 'bg-white/10 text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-blis-red' : ''}`} />
                  <span className="truncate">{getFolderLabel(folder.name)}</span>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="p-2 border-t border-white/5 space-y-1">
        {cuentaActiva && (
          <>
            <button onClick={onConfigCuenta} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-all">
              <Settings className="w-4 h-4" />
              <span>Configurar cuenta</span>
            </button>
            <button onClick={onDesconectar} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all">
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}

