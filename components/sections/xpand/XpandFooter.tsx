"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { TrendingUp, MapPin, Mail, Phone, Send, ChevronRight, Star, ArrowUpRight, Loader2, Check } from "lucide-react"
import Link from "next/link"

const quickLinks = [
  { label: "Inicio", href: "#hero" },
  { label: "Nuestros Servicios", href: "#servicios" },
  { label: "Tipo de Educación", href: "#educacion" },
  { label: "Resultados Reales", href: "#resultados" },
  { label: "Tu Roadmap", href: "#roadmap" },
  { label: "Testimonios", href: "#testimonios" },
  { label: "Planes y Precios", href: "#pricing" },
  { label: "Preguntas Frecuentes", href: "#faq" },
]

const stats = [
  { value: "10+", label: "Años de Experiencia" },
  { value: "5,240+", label: "Estudiantes" },
  { value: "94%", label: "Tasa de Éxito" },
  { value: "1,320+", label: "Certificados" },
]

const socialBrandIcons: Record<string, string> = {
  "Facebook": "/icons/brands/facebook.svg",
  "Instagram": "/icons/brands/instagram.svg",
  "Threads": "/icons/brands/threads.svg",
  "TikTok": "/icons/brands/tiktok.svg",
  "YouTube": "/icons/brands/youtube.svg",
}

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/expandcapital.redes/" },
  { label: "Threads", href: "https://www.threads.net/@expandcapital.redes" },
  { label: "TikTok", href: "https://www.tiktok.com/@xpandcapital1" },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61569463964413" },
  { label: "YouTube", href: "https://www.youtube.com/@XpandCapital" },
]

export function XpandFooter() {
  const [email, setEmail] = useState("")
  const [subState, setSubState] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) return
    setSubState("loading")
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      setSubState(data.success ? "success" : "error")
      if (data.success) setEmail("")
    } catch {
      setSubState("error")
    }
    setTimeout(() => setSubState("idle"), 4000)
  }

  return (
    <footer id="footer" className="relative bg-[#020202] border-t border-[#e8c600]/20 overflow-hidden">
      <div className="absolute inset-0 texture-grid-dark pointer-events-none opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(232,198,0,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-10">
        {/* Top row: Logo + Newsletter */}
        <div className="grid md:grid-cols-2 gap-10 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/" className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#e8c600]/15 border border-[#e8c600]/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#e8c600]" />
              </div>
              <span className="text-white font-black text-2xl tracking-tight">
                Xpand<span className="text-[#e8c600]">Capital</span>
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm mb-6">
              Academia de trading y educación financiera de élite. Transformamos
              vidas a través del conocimiento del mercado de divisas, formando
              traders disciplinados con estrategias probadas.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-[#e8c600] hover:border-[#e8c600]/50 hover:bg-[#e8c600]/10 transition-all"
                  aria-label={link.label}
                >
                  <img src={socialBrandIcons[link.label]} alt={link.label} className="w-4 h-4 invert opacity-50 group-hover:opacity-100" style={{ filter: "invert(1) opacity(0.5)" }} />
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">
              Mantente al día
            </h4>
            <p className="text-white/30 text-sm mb-4 max-w-sm">
              Recibe análisis de mercado, señales y contenido exclusivo directamente en tu correo.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                placeholder="Tu mejor email"
                disabled={subState === "loading"}
                className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-[#e8c600]/60 focus:outline-none transition-colors disabled:opacity-50"
              />
              <button
                onClick={handleSubscribe}
                disabled={subState === "loading" || subState === "success"}
                className="px-5 py-3 bg-[#e8c600] text-black font-bold text-sm rounded-xl hover:bg-[#f0d400] transition-all flex items-center gap-2 hover:shadow-[0_0_20px_rgba(232,198,0,0.3)] disabled:opacity-60"
              >
                {subState === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : subState === "success" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {subState === "loading" ? "Enviando..." : subState === "success" ? "Suscrito" : "Suscribirse"}
                </span>
              </button>
            </div>
            {subState === "error" && (
              <p className="text-red-400 text-xs mt-2">Error al suscribir. Intenta de nuevo.</p>
            )}
          </motion.div>
        </div>

        {/* Divider with glow */}
        <div className="relative mb-14">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e8c600]/15" />
          </div>
          <div className="relative flex justify-center">
            <div className="w-2 h-2 rounded-full bg-[#e8c600] shadow-[0_0_12px_rgba(232,198,0,0.6)]" />
          </div>
        </div>

        {/* Middle row: Quick links + Contact + Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <h4 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-5">
              Enlaces Rápidos
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/35 text-sm hover:text-[#e8c600] transition-colors flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="w-3 h-3 text-[#e8c600]/0 group-hover:text-[#e8c600]/70 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-5">
              Contacto
            </h4>
            <ul className="space-y-4">
              <li>
                <a href="mailto:info@xpancapital.org" className="flex items-start gap-3 text-white/35 text-sm hover:text-[#e8c600] transition-colors group">
                  <Mail className="w-4 h-4 mt-0.5 shrink-0 text-[#e8c600]/40 group-hover:text-[#e8c600]" />
                  <span>info@xpancapital.org</span>
                </a>
              </li>
              <li>
                <a href="https://wa.me/573223501170" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-white/35 text-sm hover:text-[#e8c600] transition-colors group">
                  <Phone className="w-4 h-4 mt-0.5 shrink-0 text-[#e8c600]/40 group-hover:text-[#e8c600]" />
                  <span>+57 322 350 1170</span>
                </a>
              </li>
              <li>
                <span className="flex items-start gap-3 text-white/35 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#e8c600]/40" />
                  <span>Colombia · Latam</span>
                </span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="sm:col-span-2 lg:col-span-1"
          >
            <h4 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-5">
              Xpand en Números
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:border-[#e8c600]/30 transition-colors group/stat"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Star className="w-3 h-3 text-[#e8c600]/50 group-hover/stat:text-[#e8c600] transition-colors" />
                    <span className="text-xl font-black text-white group-hover/stat:text-[#e8c600] transition-colors tabular-nums">
                      {stat.value}
                    </span>
                  </div>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.04] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/15 text-xs text-center md:text-left">
            &copy; {new Date().getFullYear()} Xpand Capital Academy. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/legal/terminos" className="text-white/15 text-xs hover:text-[#e8c600] transition-colors">
              Términos y Condiciones
            </Link>
            <Link href="/legal/privacidad" className="text-white/15 text-xs hover:text-[#e8c600] transition-colors">
              Política de Privacidad
            </Link>
          </div>
          <p className="text-white/10 text-xs text-center md:text-right flex items-center gap-1.5">
            <ArrowUpRight className="w-3 h-3" />
            El trading conlleva riesgos. Infórmate adecuadamente.
          </p>
        </div>
      </div>
    </footer>
  )
}
