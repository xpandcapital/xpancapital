"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { Scale, Shield, BookOpen, Cookie, FileText, AlertTriangle, ChevronRight, Clock, Calendar, FileCheck, Search, Download, Share2, Printer, X, ArrowUp } from "lucide-react"
import { Header } from "@/components/sections/Header"
import { FooterSections } from "@/components/sections/Footer"

interface LegalArticle {
  title: string
  content: string
  icon?: string
}

interface LegalPageData {
  hero: {
    title: string
    subtitle: string
    lastUpdated: string
    icon?: string
  }
  articles: LegalArticle[]
  sidebar: {
    enabled: boolean
    position: "left" | "right"
  }
}

interface LegalPageProps {
  data: LegalPageData
  slug: string
}

const ICON_MAP: Record<string, React.ReactNode> = {
  scale: <Scale className="w-full h-full" />,
  shield: <Shield className="w-full h-full" />,
  book: <BookOpen className="w-full h-full" />,
  cookie: <Cookie className="w-full h-full" />,
  file: <FileText className="w-full h-full" />,
  alert: <AlertTriangle className="w-full h-full" />,
}

const ARTICLE_ICONS: Record<string, React.ReactNode> = {
  scale: <Scale className="w-4 h-4" />,
  shield: <Shield className="w-4 h-4" />,
  book: <BookOpen className="w-4 h-4" />,
  file: <FileText className="w-4 h-4" />,
  alert: <AlertTriangle className="w-4 h-4" />,
  check: <FileCheck className="w-4 h-4" />,
}

export function LegalPage({ data, slug }: LegalPageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showShare, setShowShare] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  const filteredArticles = searchQuery
    ? data.articles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : data.articles

  const totalSections = data.articles.length + 1

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: "-10% 0px -80% 0px", threshold: 0 }
    )

    const sections = document.querySelectorAll("[data-legal-section]")
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchQuery("")
        setShowShare(false)
      }
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [])

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [])

  const handlePrint = () => window.print()
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: data.hero.title, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  const icon = ICON_MAP[data.hero.icon || "scale"] || ICON_MAP.scale

  return (
    <main ref={containerRef} className="min-h-screen bg-[#050505] text-white">
      <Header />

      {/* Neural Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-[2px] bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-blis-red via-blis-red-neon to-amber-400"
          style={{ width: progressWidth }}
        />
        <div className="absolute top-0 left-0 right-0 h-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-20">
        {/* Hero Section */}
        <section className="relative mb-16 md:mb-24" data-legal-section id="legal-hero">
          {/* Animated Orbs */}
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blis-red/5 blur-[120px] pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

          <div className="relative z-10">
            {/* Animated Scale Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.4, duration: 1 }}
              className="w-32 h-32 mx-auto mb-8 bg-blis-red/5 border border-blis-red/20 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_80px_rgba(213,193,8,0.15)] relative"
            >
              <div className="w-16 h-16 text-blis-red/80">
                {icon}
              </div>
              {/* Orbiting particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-blis-red/40"
                  animate={{
                    x: [0, Math.cos(i * 60 * Math.PI / 180) * 60, 0],
                    y: [0, Math.sin(i * 60 * Math.PI / 180) * 60, 0],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-4"
            >
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                <span className="text-blis-red">{data.hero.title.split(" ")[0]}</span>{" "}
                {data.hero.title.split(" ").slice(1).join(" ")}
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">{data.hero.subtitle}</p>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-8"
            >
              {[
                { icon: <Clock className="w-4 h-4" />, label: "Tiempo de lectura", value: `${Math.max(1, Math.ceil(data.articles.length * 1.5))} min` },
                { icon: <FileText className="w-4 h-4" />, label: "Artículos", value: `${data.articles.length}` },
                { icon: <Calendar className="w-4 h-4" />, label: "Actualizado", value: data.hero.lastUpdated },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="glass-card rounded-2xl px-6 py-3 flex items-center gap-3 border border-white/5"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-sm font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto mb-16">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar en este documento..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-sm text-white outline-none focus:border-blis-red/50 focus:ring-1 focus:ring-blis-red/20 placeholder-gray-600 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-xl hover:bg-white/5 transition-all"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 3D TOC Sidebar */}
          {data.sidebar.enabled && (
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-28 space-y-2">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Contenido</p>
                {filteredArticles.map((article, i) => (
                  <motion.button
                    key={i}
                    onClick={() => scrollToSection(`article-${i}`)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    whileHover={{ x: 4, scale: 1.02 }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 group ${
                      activeSection === `article-${i}`
                        ? "bg-blis-red/10 border-blis-red/30 shadow-[0_0_20px_rgba(213,193,8,0.1)]"
                        : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      activeSection === `article-${i}`
                        ? "bg-blis-red/20 text-blis-red"
                        : "bg-white/5 text-gray-600 group-hover:text-gray-400"
                    }`}>
                      <span className="text-[10px] font-black">{i + 1}</span>
                    </div>
                    <span className={`text-xs font-bold line-clamp-2 transition-colors ${
                      activeSection === `article-${i}` ? "text-white" : "text-gray-500 group-hover:text-gray-300"
                    }`}>
                      {article.title}
                    </span>
                    {activeSection === `article-${i}` && (
                      <motion.div layoutId="toc-active" className="w-1 h-5 rounded-full bg-blis-red ml-auto shrink-0" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Articles */}
          <div className={data.sidebar.enabled ? "lg:col-span-3" : "lg:col-span-4 lg:max-w-3xl lg:mx-auto"}>
            <AnimatePresence mode="popLayout">
              {filteredArticles.map((article, i) => (
                <motion.section
                  key={i}
                  id={`article-${i}`}
                  data-legal-section
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="mb-8"
                >
                  <LegalArticleCard
                    article={article}
                    index={i}
                    isActive={activeSection === `article-${i}`}
                  />
                </motion.section>
              ))}
            </AnimatePresence>

            {filteredArticles.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <FileText className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No se encontraron artículos</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-blis-red font-bold mt-2 hover:underline"
                >
                  Limpiar búsqueda
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Compliance Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-24 pt-12 border-t border-white/5"
        >
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            {[
              { label: "SSL Secured", icon: <Shield className="w-3.5 h-3.5" /> },
              { label: "GDPR Ready", icon: <FileCheck className="w-3.5 h-3.5" /> },
              { label: "Verified Business", icon: <Scale className="w-3.5 h-3.5" /> },
              { label: "PCI Compliant", icon: <Shield className="w-3.5 h-3.5" /> },
            ].map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.02] border border-white/5"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="text-emerald-400"
                >
                  {badge.icon}
                </motion.div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{badge.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Floating Widgets */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePrint}
          className="w-12 h-12 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all shadow-lg"
          title="Imprimir"
        >
          <Printer className="w-5 h-5" />
        </motion.button>
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowShare(!showShare)}
            className="w-12 h-12 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all shadow-lg"
            title="Compartir"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
          <AnimatePresence>
            {showShare && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute bottom-14 right-0 bg-zinc-950 border border-white/10 rounded-2xl p-2 shadow-2xl"
              >
                <button
                  onClick={handleShare}
                  className="w-full text-left px-4 py-2 rounded-xl hover:bg-white/5 text-sm text-gray-400 hover:text-white transition-all whitespace-nowrap"
                >
                  {typeof navigator !== 'undefined' && (navigator as any).share ? "Compartir enlace" : "Copiar enlace"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-12 h-12 rounded-2xl bg-blis-red/20 backdrop-blur-xl border border-blis-red/30 flex items-center justify-center text-blis-red hover:bg-blis-red/30 transition-all shadow-lg"
          title="Volver arriba"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      </div>

      <FooterSections />
    </main>
  )
}

function LegalArticleCard({
  article,
  index,
  isActive,
}: {
  article: LegalArticle
  index: number
  isActive: boolean
}) {
  const [expanded, setExpanded] = useState(true)
  const icon = ARTICLE_ICONS[article.icon || "file"] || ARTICLE_ICONS.file

  return (
    <motion.div
      whileHover={{ scale: 1.005 }}
      className={`glass-card rounded-[2.5rem] border overflow-hidden transition-all duration-300 ${
        isActive
          ? "border-blis-red/30 shadow-[0_0_40px_rgba(213,193,8,0.08)]"
          : "border-white/5"
      }`}
    >
      {/* Article Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-6 text-left group"
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
          isActive
            ? "bg-blis-red/20 text-blis-red shadow-[0_0_20px_rgba(213,193,8,0.2)]"
            : "bg-white/5 text-gray-500 group-hover:text-gray-300"
        }`}>
          <span className="text-sm font-black">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-black uppercase tracking-tight transition-colors ${
            isActive ? "text-white" : "text-gray-400 group-hover:text-white"
          }`}>
            {article.title}
          </h3>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0"
        >
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </motion.div>
      </button>

      {/* Article Content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-8">
              <div className="h-px bg-gradient-to-r from-blis-red/50 via-white/5 to-transparent mb-6" />
              <div
                className="prose prose-invert prose-sm max-w-none text-gray-400 leading-relaxed space-y-4 [&_strong]:text-white [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-2 [&_p]:mb-4 [&_h4]:text-white [&_h4]:font-black [&_h4]:text-sm [&_h4]:uppercase [&_h4]:tracking-wider [&_h4]:mt-6 [&_h4]:mb-3"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export type { LegalArticle, LegalPageData }

