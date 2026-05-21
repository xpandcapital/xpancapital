'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Inbox, RefreshCw, Trash2, Archive, AlertTriangle, CheckSquare, Square, Mail } from 'lucide-react'
import { CorreoSearchBar } from './CorreoSearchBar'
import { CorreoItem } from './CorreoItem'
import type { EmailMessageSummary } from '../_types'

interface Props {
  messages: EmailMessageSummary[]
  loading: boolean
  searchQuery: string
  onSearch: (query: string) => void
  onSelectMessage: (uid: number) => void
  onLoadMore: () => void
  hasMore: boolean
  onRefresh: () => void
  total: number
  activeFolder: string
  selectedUids: number[]
  onSelectUids: (uids: number[]) => void
  onBulkAction: (action: string) => void
}

const FILTERS = [
  { key: 'unread', label: 'No leídos' },
  { key: 'attachments', label: 'Con adjuntos' },
  { key: 'flagged', label: 'Estrellados' },
]

export function CorreoLista({
  messages, loading, searchQuery, onSearch, onSelectMessage, onLoadMore,
  hasMore, onRefresh, total, activeFolder, selectedUids, onSelectUids, onBulkAction,
}: Props) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    if (!listRef.current || !hasMore || loading) return
    const el = listRef.current
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) onLoadMore()
  }, [hasMore, loading, onLoadMore])

  const handleClick = (uid: number) => {
    onSelectUids([])
    onSelectMessage(uid)
  }

  const handleCheck = (uid: number) => {
    onSelectUids(
      selectedUids.includes(uid)
        ? selectedUids.filter(id => id !== uid)
        : [...selectedUids, uid]
    )
  }

  const handleSelectAll = () => {
    if (selectedUids.length === messages.length) {
      onSelectUids([])
    } else {
      onSelectUids(messages.map(m => m.uid))
    }
  }

  const filteredMessages = activeFilter
    ? messages.filter(m => {
        if (activeFilter === 'unread') return !m.isRead
        if (activeFilter === 'attachments') return m.hasAttachments
        if (activeFilter === 'flagged') return m.isFlagged
        return true
      })
    : messages

  return (
    <div className="flex flex-col h-full w-96 shrink-0 border-r border-white/5 bg-zinc-950/30">
      {/* Header */}
      <div className="p-3 border-b border-white/5 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white truncate">
            {activeFolder === 'INBOX' ? 'Bandeja' : (activeFolder.split('.').pop() || activeFolder)}
          </h2>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-600 font-mono">{total}</span>
            <motion.button whileTap={{ scale: 0.9, rotate: -180 }} transition={{ duration: 0.4 }}
              onClick={onRefresh} className="p-1 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
        <CorreoSearchBar value={searchQuery} onChange={onSearch} />

        {/* Filter chips */}
        <div className="flex items-center gap-1 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(activeFilter === f.key ? null : f.key)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all
                ${activeFilter === f.key ? 'bg-blis-red/20 text-blis-red' : 'bg-white/5 text-gray-500 hover:text-gray-300'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Bulk actions */}
        <AnimatePresence>
          {selectedUids.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-1 overflow-hidden">
              <button onClick={handleSelectAll} className="px-2 py-1 rounded-md bg-white/5 text-[10px] text-gray-400 hover:text-white transition-colors">
                {selectedUids.length === messages.length ? 'Deseleccionar' : 'Seleccionar todo'}
              </button>
              <span className="text-[10px] text-gray-600">{selectedUids.length} selec.</span>
              <div className="flex-1" />
              <button onClick={() => onBulkAction('markRead')} className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors" title="Marcar leído"><Mail className="w-3 h-3" /></button>
              <button onClick={() => onBulkAction('moveToArchive')} className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors" title="Archivar"><Archive className="w-3 h-3" /></button>
              <button onClick={() => onBulkAction('moveToSpam')} className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors" title="Spam"><AlertTriangle className="w-3 h-3" /></button>
              <button onClick={() => onBulkAction('delete')} className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-red-400 transition-colors" title="Eliminar"><Trash2 className="w-3 h-3" /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message list */}
      <div ref={listRef} onScroll={handleScroll} className="flex-1 overflow-y-auto scrollbar-hide">
        {loading && messages.length === 0 ? (
          <div className="space-y-1 p-2">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-white/5 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-1/3" />
                  <div className="h-3 bg-white/5 rounded w-2/3" />
                  <div className="h-2 bg-white/5 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Inbox className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">{searchQuery || activeFilter ? 'Sin resultados' : 'Bandeja vacía'}</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredMessages.map((msg) => (
              <CorreoItem
                key={msg.uid}
                message={msg}
                isSelected={false}
                isChecked={selectedUids.includes(msg.uid)}
                onCheck={handleCheck}
                onSelect={() => {}}
                onClick={handleClick}
              />
            ))}
          </AnimatePresence>
        )}

        {hasMore && !loading && (
          <button onClick={onLoadMore} className="w-full py-3 text-xs text-gray-500 hover:text-white hover:bg-white/[0.02] transition-colors">
            Cargar más correos
          </button>
        )}

        {loading && messages.length > 0 && (
          <div className="flex items-center justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-gray-500" /></div>
        )}
      </div>
    </div>
  )
}
