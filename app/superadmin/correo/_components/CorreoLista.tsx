'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Inbox, RefreshCw } from 'lucide-react'
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
}

export function CorreoLista({
  messages,
  loading,
  searchQuery,
  onSearch,
  onSelectMessage,
  onLoadMore,
  hasMore,
  onRefresh,
  total,
  activeFolder,
}: Props) {
  const [selectedUid, setSelectedUid] = useState<number | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    if (!listRef.current || !hasMore || loading) return
    const el = listRef.current
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) {
      onLoadMore()
    }
  }, [hasMore, loading, onLoadMore])

  const handleClick = (uid: number) => {
    setSelectedUid(uid)
    onSelectMessage(uid)
  }

  return (
    <div className="flex flex-col h-full w-96 shrink-0 border-r border-white/5 bg-zinc-950/30">
      <div className="p-3 border-b border-white/5 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white truncate">
            {activeFolder === 'INBOX' ? 'Bandeja de Entrada' : activeFolder.split('.').pop() || activeFolder}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-600 font-mono">{total}</span>
            <motion.button
              whileTap={{ scale: 0.9, rotate: -180 }}
              transition={{ duration: 0.4 }}
              onClick={onRefresh}
              className="p-1 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
        <CorreoSearchBar value={searchQuery} onChange={onSearch} />
      </div>

      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-hide"
      >
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Inbox className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">
              {searchQuery ? 'Sin resultados' : 'Bandeja vacía'}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {searchQuery ? `No se encontró "${searchQuery}"` : 'No hay correos en esta carpeta'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <CorreoItem
                key={msg.uid}
                message={msg}
                isSelected={selectedUid === msg.uid}
                onSelect={() => setSelectedUid(msg.uid)}
                onClick={handleClick}
              />
            ))}
          </AnimatePresence>
        )}

        {hasMore && !loading && (
          <button
            onClick={onLoadMore}
            className="w-full py-3 text-xs text-gray-500 hover:text-white hover:bg-white/[0.02] transition-colors"
          >
            Cargar más correos
          </button>
        )}

        {loading && messages.length > 0 && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
          </div>
        )}
      </div>
    </div>
  )
}
