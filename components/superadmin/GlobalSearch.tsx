"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import {
  Search, Package, Users, Contact, FileText, Briefcase,
  Loader2, CornerDownLeft
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface SearchResult {
  id: string
  title: string
  subtitle?: string
  url: string
  category: "productos" | "clientes" | "leads" | "blog" | "proyectos"
}

const CATEGORY_CONFIG = {
  productos: { label: "Productos", icon: Package, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  clientes: { label: "Clientes", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
  leads: { label: "Leads", icon: Contact, color: "text-purple-500", bg: "bg-purple-500/10" },
  blog: { label: "Blog", icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
  proyectos: { label: "Proyectos", icon: Briefcase, color: "text-cyan-500", bg: "bg-cyan-500/10" },
} as const

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [noResults, setNoResults] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === "Escape" && open) {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open])

  useEffect(() => {
    if (open) {
      setQuery("")
      setResults([])
      setSelectedIndex(0)
      setNoResults(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setNoResults(false)
      setLoading(false)
      return
    }

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    const lower = q.toLowerCase()
    const allResults: SearchResult[] = []

    try {
      const empresaRes = await fetch("/api/empresas?slug=blis-corp", { signal: controller.signal })
      const empresaData = await empresaRes.json()
      const empresaId = empresaData?.data?.id || ""

      const fetchers = [
        (async () => {
          const res = await fetch(`/api/productos?empresa_id=${empresaId}`, { signal: controller.signal })
          const data = await res.json()
          if (data.success && data.data) {
            for (const p of data.data) {
              if (p.nombre?.toLowerCase().includes(lower)) {
                allResults.push({ id: p.id, title: p.nombre, subtitle: `$${p.precio || 0}`, url: `/superadmin/productos`, category: "productos" })
              }
            }
          }
        })(),
        (async () => {
          const res = await fetch(`/api/admin/clientes?empresa_id=${empresaId}`, { signal: controller.signal })
          const data = await res.json()
          if (data.success && data.data) {
            for (const c of data.data) {
              const name = c.nombre || c.email || ""
              const email = c.email || ""
              if (name.toLowerCase().includes(lower) || email.toLowerCase().includes(lower)) {
                allResults.push({ id: c.id, title: name, subtitle: email, url: `/superadmin/clientes`, category: "clientes" })
              }
            }
          }
        })(),
        (async () => {
          const res = await fetch(`/api/leads?empresa_id=${empresaId}`, { signal: controller.signal })
          const data = await res.json()
          if (data.success && data.data) {
            for (const l of data.data) {
              if (l.nombre?.toLowerCase().includes(lower)) {
                allResults.push({ id: l.id, title: l.nombre, subtitle: l.email || l.estado, url: `/superadmin/leads`, category: "leads" })
              }
            }
          }
        })(),
        (async () => {
          const res = await fetch(`/api/blog?empresa_id=${empresaId}`, { signal: controller.signal })
          const data = await res.json()
          if (data.success && data.data) {
            for (const b of data.data) {
              if (b.titulo?.toLowerCase().includes(lower)) {
                allResults.push({ id: b.id, title: b.titulo, subtitle: b.estado, url: `/superadmin/blog/crear?id=${b.id}`, category: "blog" })
              }
            }
          }
        })(),
        (async () => {
          const res = await fetch(`/api/admin/projects?empresa_id=${empresaId}`, { signal: controller.signal })
          const data = await res.json()
          if (data.success && data.data) {
            for (const pr of data.data) {
              if (pr.nombre?.toLowerCase().includes(lower)) {
                allResults.push({ id: pr.id, title: pr.nombre, subtitle: pr.estado || "", url: `/superadmin/proyectos`, category: "proyectos" })
              }
            }
          }
        })(),
      ]

      await Promise.allSettled(fetchers)

      if (!controller.signal.aborted) {
        setResults(allResults)
        setNoResults(allResults.length === 0)
        setSelectedIndex(0)
      }
    } catch {
      if (!controller.signal.aborted) {
        setResults([])
        setNoResults(true)
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults([])
      setNoResults(false)
      setLoading(false)
      return
    }
    debounceRef.current = setTimeout(() => performSearch(query), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, performSearch])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault()
      router.push(results[selectedIndex].url)
      setOpen(false)
    }
  }

  const grouped = results.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = []
    acc[r.category].push(r)
    return acc
  }, {} as Record<string, SearchResult[]>)

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  if (typeof window === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[20000] bg-black/80 backdrop-blur-md flex items-start justify-center pt-[15vh]"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
              <Search className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar productos, clientes, leads, blog, proyectos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-white text-sm placeholder-gray-600 outline-none"
              />
              {loading && <Loader2 className="w-4 h-4 text-blis-red animate-spin flex-shrink-0" />}
              <kbd className="hidden sm:flex items-center gap-0.5 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-500 font-medium">
                <CornerDownLeft className="w-3 h-3" /> ESC
              </kbd>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {query.trim() && loading && results.length === 0 && !noResults && (
                <div className="flex items-center justify-center gap-3 py-12 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Buscando...</span>
                </div>
              )}

              {noResults && query.trim() && !loading && (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-500">
                  <Search className="w-8 h-8 opacity-30" />
                  <p className="text-sm">Sin resultados para &quot;{query}&quot;</p>
                </div>
              )}

              {!query.trim() && !loading && (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-600">
                  <Search className="w-8 h-8 opacity-20" />
                  <p className="text-xs font-medium uppercase tracking-wider">Empieza a escribir para buscar</p>
                </div>
              )}

              {results.length > 0 && Object.entries(grouped).map(([cat, items]) => {
                const config = CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-2 px-5 py-2 bg-white/[0.02] border-b border-white/5">
                      <config.icon className={`w-3.5 h-3.5 ${config.color}`} />
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{config.label}</span>
                      <span className="text-[9px] text-gray-700 font-bold">{items.length}</span>
                    </div>
                    {items.map((item) => {
                      const isSelected = results.indexOf(item) === selectedIndex
                      return (
                        <button
                          key={`${item.category}-${item.id}`}
                          onClick={() => { router.push(item.url); setOpen(false) }}
                          className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors border-b border-white/[0.02] ${isSelected ? "bg-white/10" : "hover:bg-white/5"}`}
                        >
                          <div className={`p-1.5 rounded-lg ${config.bg}`}>
                            <config.icon className={`w-3.5 h-3.5 ${config.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{item.title}</p>
                            {item.subtitle && (
                              <p className="text-[11px] text-gray-500 truncate">{item.subtitle}</p>
                            )}
                          </div>
                          <span className="text-[9px] text-gray-700 font-bold uppercase tracking-wider flex-shrink-0">{config.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-4 px-5 py-3 border-t border-white/5">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px]">↑↓</kbd>
                <span>Navegar</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px]">Enter</kbd>
                <span>Abrir</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px]">Esc</kbd>
                <span>Cerrar</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
