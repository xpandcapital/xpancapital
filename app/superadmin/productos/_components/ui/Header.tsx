"use client"

import { ShoppingBag, Plus, X, Settings2 } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface HeaderProps {
  onOpenModal: () => void
  showTools: boolean
  onToggleTools: () => void
}

export function Header({ onOpenModal, showTools, onToggleTools }: HeaderProps) {
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

      <div className="flex items-center w-full sm:w-auto mt-4 sm:mt-0 gap-2 justify-between sm:justify-end relative z-[1000]">
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault()
              onToggleTools()
            }}
            className={`p-4 sm:p-5 rounded-3xl transition-all flex items-center justify-center active:scale-95 bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl z-20 ${
              showTools
                ? 'bg-blis-red text-white shadow-[0_0_20px_rgba(190,11,60,0.3)]'
                : 'hover:bg-white/10 text-gray-400'
            }`}
            title="Configuración de Tienda"
          >
            {showTools ? <X className="w-5 h-5" /> : <Settings2 className="w-5 h-5" />}
          </button>
        </div>

        <button
          onClick={onOpenModal}
          className="flex-1 sm:flex-initial sm:min-w-[180px] bg-blis-red text-white py-4 sm:py-5 px-6 sm:px-10 rounded-3xl font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_10px_40px_rgba(190,11,60,0.3)] z-10"
        >
          <Plus className="w-5 h-4" />
          <span>Producto</span>
        </button>
      </div>
    </div>
  )
}