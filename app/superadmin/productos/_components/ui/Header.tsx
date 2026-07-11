"use client"

import { ShoppingBag, Plus, X, Settings2 } from 'lucide-react'
import { useRef, useEffect } from 'react'
import { ToolsMenu } from './ToolsMenu'

interface HeaderProps {
  onOpenModal: () => void
  showTools: boolean
  onToggleTools: () => void
}

export function Header({ onOpenModal, showTools, onToggleTools }: HeaderProps) {
  const toolsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showTools) return
    const handleClick = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        onToggleTools()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showTools, onToggleTools])

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
      <div className="space-y-1 w-full sm:w-auto">
        <div className="flex items-center gap-2 text-blis-red font-black text-[10px] uppercase tracking-[0.3em]">
          <ShoppingBag className="w-3 h-3" />
          Administración de Tienda
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">
          Inventario de Productos
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl">
          Controla stock, precios y categorías de tus productos físicos y digitales.
        </p>
      </div>

      <div className="flex items-center w-full sm:w-auto mt-4 sm:mt-0 gap-2 justify-between sm:justify-end relative z-10">
        <div ref={toolsRef} className="relative">
          <button
            onClick={(e) => {
              e.preventDefault()
              onToggleTools()
            }}
            className={`p-4 sm:p-5 rounded-3xl transition-all flex items-center justify-center active:scale-95 bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl ${
              showTools
                ? 'bg-blis-red text-white shadow-[0_0_20px_rgba(213,193,8,0.3)]'
                : 'hover:bg-white/10 text-gray-400'
            }`}
            title="Configuración de Tienda"
          >
            {showTools ? <X className="w-5 h-5" /> : <Settings2 className="w-5 h-5" />}
          </button>
          <ToolsMenu show={showTools} onClose={onToggleTools} />
        </div>

        <button
          onClick={onOpenModal}
          className="flex-1 sm:flex-initial sm:min-w-[180px] bg-blis-red text-white py-4 sm:py-5 px-6 sm:px-10 rounded-3xl font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_10px_40px_rgba(213,193,8,0.3)]"
        >
          <Plus className="w-5 h-4" />
          <span>Producto</span>
        </button>
      </div>
    </div>
  )
}
