"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import {
  Search, Package, Users, Contact, FileText, Briefcase,
  GraduationCap, Layout,
  Loader2, CornerDownLeft
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface SearchResult {
  id: string
  title: string
  subtitle?: string
  image?: string
  url: string
}

type CategoryKey = "productos" | "clientes" | "leads" | "blog" | "proyectos" | "cursos" | "templates"

const CATEGORY_CONFIG: Record<CategoryKey, { label: string; icon: typeof Package; color: string; bg: string }> = {
  productos:  { label: "Productos",  icon: Package,        color: "text-emerald-500", bg: "bg-emerald-500/10" },
  clientes:   { label: "Clientes",   icon: Users,          color: "text-blue-500",    bg: "bg-blue-500/10" },
  leads:      { label: "Leads",      icon: Contact,        color: "text-purple-500",  bg: "bg-purple-500/10" },
  blog:       { label: "Blog",       icon: FileText,       color: "text-amber-500",   bg: "bg-amber-500/10" },
  proyectos:  { label: "Proyectos",  icon: Briefcase,      color: "text-cyan-500",    bg: "bg-cyan-500/10" },
  cursos:     { label: "Cursos",     icon: GraduationCap,  color: "text-rose-500",    bg: "bg-rose-500/10" },
  templates:  { label: "Páginas",    icon: Layout,         color: "text-indigo-500",  bg: "bg-indigo-500/10" },
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Record<string, SearchResult[]>>({})
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [noResults, setNoResults] = useState(false)
  const [searchError, setSearchError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const cacheRef = useRef<Map<string, Record<string, SearchResult[]>>>(new Map())

  useEffect(() => {
    if (open) {
      const cache = cacheRef.current
      if (cache.size > 50) cache.clear()
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === "Escape" && open) setOpen(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open])

  useEffect(() => {
    if (open) {
      setQuery("")
      setResults({})
      setSelectedIndex(0)
      setNoResults(false)
      setSearchError('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 2) {
      setResults({})
      setNoResults(false)
      setLoading(false)
      return
    }

    const cached = cacheRef.current.get(q.toLowerCase())
    if (cached) {
      setResults(cached)
      setNoResults(Object.values(cached).flat().length === 0)
      setSelectedIndex(0)
      return
    }

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)

    try {
      let empresaId = '';
      try {
        const stored = localStorage.getItem('blis_active_empresa');
        if (stored) empresaId = JSON.parse(stored)?.id || '';
      } catch {}

      const params = new URLSearchParams({ q });
      if (empresaId) params.set('empresa_id', empresaId);
      const res = await fetch(`/api/search?${params.toString()}`, {
        signal: controller.signal,
      })
      const data = await res.json()

      if (!controller.signal.aborted) {
        if (!data.success) {
          setSearchError(data.error || 'Error desconocido')
          setResults({})
          setNoResults(false)
        } else {
          const r = data.results || {}
          setResults(r)
          setSearchError('')
          cacheRef.current.set(q.toLowerCase(), r)
          setNoResults(Object.values(r as Record<string, any[]>).flat().length === 0)
        }
        setSelectedIndex(0)
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        console.error('[GlobalSearch] Error fetching results:', err)
        setResults({})
        setNoResults(true)
        setSearchError(err instanceof TypeError ? 'Error de conexión' : 'Error al buscar')
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults({})
      setNoResults(false)
      setLoading(false)
      return
    }
    debounceRef.current = setTimeout(() => performSearch(query), 200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, performSearch])

  const allResults = Object.entries(results).flatMap(([cat, items]) =>
    items.map((item: SearchResult) => ({ ...item, category: cat as CategoryKey }))
  )

  const handleSelect = (item: SearchResult & { category: CategoryKey }) => {
    setOpen(false)
    router.push(item.url)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const flat = allResults
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, flat.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === "Enter" && flat[selectedIndex]) {
      e.preventDefault()
      handleSelect(flat[selectedIndex])
    }
  }

  const modal = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9998] flex items-start justify-center pt-[15vh]"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
              <Search className="w-5 h-5 text-gray-500 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar productos, clientes, leads..."
                className="w-full bg-transparent text-white text-sm placeholder-gray-600 focus:outline-none"
              />
              {loading && <Loader2 className="w-4 h-4 text-blis-red animate-spin shrink-0" />}
              <kbd className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-600 font-mono shrink-0">
                ESC
              </kbd>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {Object.entries(results).map(([cat, items]) => {
                const config = CATEGORY_CONFIG[cat as CategoryKey]
                if (!config || items.length === 0) return null
                const CatIcon = config.icon
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.01] border-b border-white/[0.02]">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${config.bg}`}>
                        <CatIcon className={`w-3.5 h-3.5 ${config.color}`} />
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {config.label}
                      </span>
                      <span className="text-[9px] text-gray-600">{items.length}</span>
                    </div>
                    {items.map((item: SearchResult, idx: number) => {
                      const globalIdx = allResults.findIndex(r => r.id === item.id && r.category === cat)
                      const isSelected = globalIdx === selectedIndex
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect({ ...item, category: cat as CategoryKey })}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            isSelected ? "bg-white/[0.05]" : "hover:bg-white/[0.02]"
                          }`}
                        >
                          {item.image ? (
                            <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.bg}`}>
                              <CatIcon className={`w-4 h-4 ${config.color}`} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium truncate">{item.title}</p>
                            {item.subtitle && (
                              <p className="text-[11px] text-gray-500 truncate">{item.subtitle}</p>
                            )}
                          </div>
                          {isSelected && (
                            <CornerDownLeft className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              })}

              {noResults && query.length >= 2 && !loading && (
                <div className="px-4 py-12 text-center">
                  <Search className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Sin resultados para &quot;{query}&quot;</p>
                  {searchError && <p className="text-xs text-red-400 mt-2">{searchError}</p>}
                </div>
              )}

              {!noResults && !loading && query.length < 2 && (
                <div className="px-4 py-12 text-center">
                  <Search className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Escribe al menos 2 caracteres para buscar</p>
                  <p className="text-[10px] text-gray-700 mt-1">Productos, clientes, leads, blog, proyectos, cursos y páginas</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 px-4 py-2 border-t border-white/5 text-[9px] text-gray-700">
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/5 text-gray-600">↑↓</kbd> Navegar</span>
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/5 text-gray-600">Enter</kbd> Abrir</span>
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/5 text-gray-600">Esc</kbd> Cerrar</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (typeof window === "undefined") return null;
  return createPortal(modal, document.body);
}
