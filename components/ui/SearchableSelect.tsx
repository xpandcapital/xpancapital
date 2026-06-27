"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, Check } from 'lucide-react'

export interface SearchableOption {
  value: string
  label: string
  sublabel?: string
  image?: string
  icon?: React.ComponentType<{ className?: string }>
}

interface SearchableSelectProps {
  options: SearchableOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
}

const SELECT_CLASSES =
  'bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-blis-red/30 transition-all'

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  emptyText = 'Sin resultados',
  className = '',
}: SearchableSelectProps) {
  const [abierto, setAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOpt = options.find((o) => o.value === value)

  const filtrados = options
    .filter((o) => !busqueda || o.label.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => a.label.localeCompare(b.label, 'es'))

  const mostrarBusqueda = options.length > 10

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setAbierto(false)
      setBusqueda('')
    }
  }, [])

  useEffect(() => {
    if (abierto) {
      document.addEventListener('mousedown', handleClickOutside)
      if (mostrarBusqueda && inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 50)
      }
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [abierto, mostrarBusqueda, handleClickOutside])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAbierto(false)
        setBusqueda('')
      }
    }
    if (abierto) document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [abierto])

  const handleSelect = (optValue: string) => {
    onChange(optValue)
    setAbierto(false)
    setBusqueda('')
  }

  const SelectedIconComp = selectedOpt?.icon
  const SelectedImage = selectedOpt?.image

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className={`w-full flex items-center justify-between gap-2 ${SELECT_CLASSES} ${
          abierto ? 'border-blis-red/30 ring-1 ring-blis-red/10' : ''
        }`}
      >
        <span className="flex items-center gap-2 min-w-0">
          {SelectedImage && (
            <img src={SelectedImage} alt="" className="w-5 h-5 rounded object-cover shrink-0" />
          )}
          {!SelectedImage && SelectedIconComp && <SelectedIconComp className="w-4 h-4 text-gray-400 shrink-0" />}
          <span className={selectedOpt ? 'text-white truncate' : 'text-gray-500 truncate'}>
            {selectedOpt ? selectedOpt.label : placeholder}
          </span>
        </span>
        <motion.span animate={{ rotate: abierto ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
        </motion.span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full bg-zinc-900 border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            {/* Search input */}
            {mostrarBusqueda && (
              <div className="p-2 border-b border-white/5">
                <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-3 py-2">
                  <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Options list */}
            <div className="max-h-[220px] overflow-y-auto py-1">
              {filtrados.length > 0 ? (
                filtrados.map((opt) => {
                  const isSelected = opt.value === value
                  const OptIcon = opt.icon
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full flex items-start gap-3 px-3 py-2 text-left transition-colors ${
                        isSelected ? 'bg-blis-red/10' : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      {/* Thumbnail or icon */}
                      {opt.image ? (
                        <img
                          src={opt.image}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover shrink-0 mt-0.5"
                        />
                      ) : OptIcon ? (
                        <OptIcon
                          className={`w-5 h-5 mt-0.5 shrink-0 ${
                            isSelected ? 'text-blis-red' : 'text-gray-500'
                          }`}
                        />
                      ) : (
                        <div className="w-5 shrink-0" />
                      )}

                      {/* Text */}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium line-clamp-2 ${
                            isSelected ? 'text-white' : 'text-gray-200'
                          }`}
                        >
                          {opt.label}
                        </p>
                        {opt.sublabel && (
                          <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">
                            {opt.sublabel}
                          </p>
                        )}
                      </div>

                      {/* Checkmark */}
                      {isSelected && (
                        <Check className="w-4 h-4 text-blis-red shrink-0 mt-0.5" />
                      )}
                    </button>
                  )
                })
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-xs text-gray-600">{emptyText}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Simple native <select> with consistent dark styling.
 * Use when ≤5 options (no search needed).
 */
export function NativeSelect({
  value,
  onChange,
  options,
  placeholder,
  className = '',
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${SELECT_CLASSES} ${className}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
