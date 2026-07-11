"use client"

import { ChevronDown, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, Fragment } from "react"

interface PaginationBarProps {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItems: number
  selectedCount: number
  filteredCount: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (count: number) => void
  onSelectAllGlobal?: () => void
}

export function PaginationBar({
  currentPage,
  totalPages,
  itemsPerPage,
  selectedCount,
  filteredCount,
  onPageChange,
  onItemsPerPageChange,
  onSelectAllGlobal
}: PaginationBarProps) {
  const [isPagingOpen, setIsPagingOpen] = useState(false)

  const itemsPerPageOptions = [10, 20, 50, 100]

  const visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(pageNum => {
      if (totalPages <= 5) return true
      return pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
    })

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-3 px-4 bg-zinc-950/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl mb-6">
      <div className="flex items-center gap-3">
        <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] hidden sm:block">Mostrar</span>
        
        <div className="relative">
          <button
            onClick={() => setIsPagingOpen(!isPagingOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-[10px] font-black text-white hover:bg-white/10 transition-all ${isPagingOpen ? 'border-blis-red/50 shadow-[0_0_20px_rgba(213,193,8,0.2)] bg-white/[0.08]' : ''}`}
          >
            <span>{itemsPerPage}</span>
            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-500 ${isPagingOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isPagingOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-0 mb-3 bg-zinc-950/90 border border-white/10 rounded-[1.5rem] p-1.5 shadow-2xl z-[100] min-w-[80px] backdrop-blur-3xl overflow-hidden"
              >
                {itemsPerPageOptions.map((val) => (
                  <button
                    key={val}
                    onClick={() => {
                      onItemsPerPageChange(val)
                      onPageChange(1)
                      setIsPagingOpen(false)
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl text-[10px] font-black text-center transition-all ${itemsPerPage === val ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
                  >
                    {val}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-blis-red/10 border border-blis-red/20 rounded-lg">
              <div className="w-1 h-1 rounded-full bg-blis-red animate-pulse" />
              <span className="text-[9px] font-black text-blis-red uppercase tracking-wider">{selectedCount}</span>
            </div>
            {selectedCount < filteredCount && onSelectAllGlobal && (
              <button
                onClick={onSelectAllGlobal}
                className="text-[8px] font-black text-gray-400 uppercase px-2.5 py-1.5 bg-white/5 rounded-xl border border-white/5 transition-all hover:bg-white/10 hover:text-white whitespace-nowrap"
              >
                Todos ({filteredCount})
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <div className="hidden sm:flex items-center px-2 py-1 bg-white/[0.02] border border-white/5 rounded-lg mr-0.5">
          <span className="text-[8px] font-black text-gray-700 uppercase tracking-[0.1em]">
            {currentPage} <span className="text-gray-800 px-0.5">/</span> {totalPages}
          </span>
        </div>

        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="w-7 h-8 rounded-lg bg-white/[0.03] border border-white/10 text-gray-500 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center group"
        >
          <ChevronRight className="w-3 h-3 rotate-180 transition-transform group-hover:-translate-x-0.5" />
        </button>

        <div className="flex items-center gap-0.5">
          {visiblePages.map((pageNum, idx, arr) => {
            const showEllipsis = idx > 0 && pageNum - arr[idx - 1] > 1
            return (
              <Fragment key={pageNum}>
                {showEllipsis && <span className="text-gray-700 px-1 text-[9px] font-black">…</span>}
                <button
                  onClick={() => onPageChange(pageNum)}
                  className={`w-6 h-8 rounded-lg text-[9px] font-black transition-all border ${currentPage === pageNum ? 'bg-blis-red text-white border-blis-red shadow-[0_0_10px_rgba(213,193,8,0.3)]' : 'bg-transparent text-gray-500 border-transparent hover:border-white/10 hover:text-white hover:bg-white/[0.03]'}`}
                >
                  {pageNum}
                </button>
              </Fragment>
            )
          })}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="w-7 h-8 rounded-lg bg-white/[0.03] border border-white/10 text-gray-500 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center group"
        >
          <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}
