"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Header } from "@/components/sections/Header"
import { FooterSections } from "@/components/sections/Footer"
import { Scale, Shield, BookOpen, Cookie, FileText, AlertTriangle, MessageSquare, ArrowRight } from "lucide-react"

const pages = [
  {
    slug: "terminos",
    title: "Términos y Condiciones",
    description: "Reglas de uso de la plataforma y condiciones de compra de contenido educativo digital.",
    icon: <Scale className="w-8 h-8" />,
    color: "text-blis-red",
    bg: "bg-blis-red/5",
    border: "border-blis-red/20",
  },
  {
    slug: "privacidad",
    title: "Política de Privacidad",
    description: "Cómo recolectamos, usamos y protegemos tu información personal.",
    icon: <Shield className="w-8 h-8" />,
    color: "text-sky-400",
    bg: "bg-sky-500/5",
    border: "border-sky-500/20",
  },
  {
    slug: "reembolsos",
    title: "Política de Reembolsos",
    description: "Condiciones y procedimiento para solicitar devoluciones.",
    icon: <BookOpen className="w-8 h-8" />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/5",
    border: "border-emerald-500/20",
  },
  {
    slug: "cookies",
    title: "Política de Cookies",
    description: "Tipos de cookies que usamos y cómo gestionarlas.",
    icon: <Cookie className="w-8 h-8" />,
    color: "text-amber-400",
    bg: "bg-amber-500/5",
    border: "border-amber-500/20",
  },
  {
    slug: "aviso",
    title: "Aviso Legal",
    description: "Información corporativa, registro mercantil y objeto social de BLIS CORP S.A.C.",
    icon: <AlertTriangle className="w-8 h-8" />,
    color: "text-purple-400",
    bg: "bg-purple-500/5",
    border: "border-purple-500/20",
  },
  {
    slug: "reclamaciones",
    title: "Libro de Reclamaciones",
    description: "Presenta tu reclamo, queja o sugerencia. Respondemos en 15 días hábiles.",
    icon: <MessageSquare className="w-8 h-8" />,
    color: "text-orange-400",
    bg: "bg-orange-500/5",
    border: "border-orange-500/20",
  },
]

export default function LegalHubPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Header />

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-32 pb-20">
        {/* Hero */}
        <div className="text-center mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="w-20 h-20 mx-auto mb-6 bg-blis-red/5 border border-blis-red/20 rounded-[1.5rem] flex items-center justify-center"
          >
            <Scale className="w-10 h-10 text-blis-red" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black uppercase tracking-tighter"
          >
            Centro <span className="text-blis-red">Legal</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-xl mx-auto"
          >
            Toda la información legal de BLIS CORP S.A.C. en un solo lugar. Transparencia y cumplimiento para nuestros clientes en Perú y Ecuador.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page, i) => (
            <motion.div
              key={page.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <Link href={`/legal/${page.slug}`}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative h-full p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer ${page.bg} ${page.border} hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4 ${page.color}`}>
                    {page.icon}
                  </div>
                  <h3 className="text-base font-black uppercase tracking-tight mb-2 text-white">
                    {page.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {page.description}
                  </p>
                  <div className="flex items-center gap-2 mt-4 text-[11px] font-black text-gray-600 uppercase tracking-widest group-hover:text-white transition-colors">
                    Ver documento <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 text-center"
        >
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            BLIS CORP S.A.C. — Número de Partida Registral 11449191, Zona Registral N° XII, Arequipa, Perú.
            Operaciones en Perú y Ecuador. La plataforma digital blis-corp.com se dedica exclusivamente a la
            comercialización de contenido educativo digital. Las transacciones inmobiliarias se gestionan
            únicamente por canales presenciales a través de nuestro Oficial de Cumplimiento.
          </p>
        </motion.div>
      </div>

      <FooterSections />
    </main>
  )
}
