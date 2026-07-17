"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronUp, ChevronDown } from "lucide-react"

const HOME_SECTIONS = [
    { id: "hero", label: "Inicio" },
    { id: "video", label: "Presentación" },
    { id: "ecosistema", label: "¿Por qué Xpand?" },
    { id: "servicios", label: "Servicios" },
    { id: "educacion", label: "Educación" },
    { id: "resultados", label: "Resultados" },
    { id: "roadmap", label: "Tu Camino" },
    { id: "instructor", label: "Instructor" },
    { id: "testimonios", label: "Testimonios" },
    { id: "pricing", label: "Planes" },
    { id: "recursos", label: "Recursos" },
    { id: "contenido", label: "Contenido" },
    { id: "faq", label: "FAQ" },
    { id: "unete", label: "Únete" },
    { id: "footer", label: "Contacto" },
]

const BLOG_SECTIONS = [
    { id: "blog-hero", label: "Portada" },
    { id: "deck-inversiones", label: "Inversiones" },
    { id: "deck-arquitectura", label: "Arquitectura" },
    { id: "deck-legal", label: "Legal" },
]

export function SideAnchorNav() {
    const pathname = usePathname()
    const isBlog = pathname === "/blog"
    const [activeId, setActiveId] = useState("")
    const [isVisibleMobile, setIsVisibleMobile] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastScrollY = useRef(0)

    const sections = isBlog ? BLOG_SECTIONS : HOME_SECTIONS

    useEffect(() => {
        if (pathname !== "/" && pathname !== "/blog") return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id)
                    }
                })
            },
            { rootMargin: "-20% 0px -70% 0px" }
        )

        sections.forEach((section: { id: string }) => {
            const el = document.getElementById(section.id)
            if (el) observer.observe(el)
        })

        const handleScrollActivity = () => {
            const currentY = window.scrollY
            if (Math.abs(currentY - lastScrollY.current) > 10) {
                setIsVisibleMobile(true)
                if (timeoutRef.current) clearTimeout(timeoutRef.current)
                timeoutRef.current = setTimeout(() => setIsVisibleMobile(false), 5000)
            }
            lastScrollY.current = currentY
        }

        window.addEventListener("scroll", handleScrollActivity, { passive: true })

        return () => {
            observer.disconnect()
            window.removeEventListener("scroll", handleScrollActivity)
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [pathname, sections])

    if (pathname !== "/" && pathname !== "/blog") return null

    const handleScroll = (id: string) => {
        const el = document.getElementById(id)
        const scrollOffset = isBlog ? 10 : 70
        if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY - scrollOffset
            window.scrollTo({ top, behavior: "smooth" })
        }
    }

    const navigateTo = (direction: 'up' | 'down') => {
        const currentIndex = sections.findIndex((s: { id: string }) => s.id === activeId)

        let nextIndex: number
        if (currentIndex === -1) {
            nextIndex = direction === 'down' ? 1 : 0
        } else {
            nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
        }
        if (nextIndex < 0) nextIndex = 0
        if (nextIndex >= sections.length) nextIndex = sections.length - 1

        handleScroll((sections[nextIndex] as { id: string }).id)
    }

    return (
        <>
            {/* Desktop Navigation */}
            <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-end gap-3 group/nav p-4">
                <div className="w-6 flex justify-center mb-2">
                    <button
                        onClick={() => navigateTo('up')}
                        className="w-6 h-6 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300 hover:border-white/50"
                    >
                        <ChevronUp className="w-4 h-4" />
                    </button>
                </div>

                {sections.map((section: { id: string; label: string }) => {
                    const isActive = activeId === section.id
                    return (
                        <div key={section.id} className="relative flex items-center justify-end w-full">
                            <span className={`absolute right-10 px-3 py-1.5 bg-[#0A0D11]/90 backdrop-blur-md text-[9px] font-bold tracking-widest uppercase rounded border opacity-0 group-hover/nav:opacity-100 transition-all pointer-events-none translate-x-4 group-hover/nav:translate-x-0 duration-300 w-28 text-right ${isActive ? 'text-blis-red border-blis-red shadow-[0_4px_15px_rgba(213,193,8,0.5)]' : 'border-white/10 text-white'}`}>
                                {section.label}
                            </span>
                            <div className="w-6 flex justify-center">
                                <button
                                    onClick={() => handleScroll(section.id)}
                                    className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${isActive ? 'bg-blis-red border-blis-red scale-[1.3] shadow-[0_0_12px_rgba(213,193,8,0.8)]' : 'bg-transparent border-blis-red/50 hover:border-blis-red hover:bg-blis-red/20'}`}
                                    aria-label={`Ir a ${section.label}`}
                                />
                            </div>
                        </div>
                    )
                })}

                <div className="w-6 flex justify-center mt-2">
                    <button
                        onClick={() => navigateTo('down')}
                        className="w-6 h-6 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300 hover:border-white/50"
                    >
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Mobile Anchor Navigator */}
            <AnimatePresence>
                {isVisibleMobile && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: "-50%", y: 10 }}
                        animate={{ opacity: 1, scale: 1, x: "-50%", y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: "-50%", y: 10 }}
                        className="fixed bottom-8 left-1/2 z-[100] flex items-center lg:hidden pointer-events-none"
                    >
                        <div className="flex items-center gap-1.5 glass-card bg-black/60 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] pointer-events-auto">
                            <button
                                onClick={() => navigateTo('up')}
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-blis-red/20 transition-all text-gray-400 hover:text-white"
                            >
                                <ChevronUp className="w-5 h-5" />
                            </button>

                            <div className="px-4 flex flex-col min-w-[100px] items-center">
                                <span className="text-[8px] font-mono text-blis-red uppercase tracking-[0.2em] font-black opacity-60">Sección:</span>
                                <span className="text-[11px] font-bold text-white uppercase tracking-wider whitespace-nowrap">
                                    {(sections.find((s: { id: string }) => s.id === activeId) as { label?: string })?.label || "Explorar"}
                                </span>
                            </div>

                            <button
                                onClick={() => navigateTo('down')}
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-blis-red/20 transition-all text-gray-400 hover:text-white"
                            >
                                <ChevronDown className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

