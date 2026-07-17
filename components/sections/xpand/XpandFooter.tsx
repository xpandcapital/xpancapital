"use client"

import { motion } from "framer-motion"
import { TrendingUp } from "lucide-react"
import Link from "next/link"

const socialLinks = [
  { label: "Facebook", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "TikTok", href: "#" },
  { label: "YouTube", href: "#" },
]

const legalLinks = [
  { label: "Términos y Condiciones", href: "#" },
  { label: "Política de Privacidad", href: "#" },
]

export function XpandFooter() {
  return (
    <footer id="footer" className="bg-[#020202] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/" className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-6 h-6 text-[#d5c108]" />
              <span className="text-white font-bold text-lg">
                Xpand<span className="text-[#d5c108]">Capital</span>
              </span>
            </Link>
            <p className="text-white/30 text-sm leading-relaxed max-w-xs">
              Academia de trading y educación financiera de élite. Transformando
              vidas a través del conocimiento del mercado de divisas.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/30 text-sm hover:text-[#d5c108] transition-colors"
                  >
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
            <h4 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">
              Redes Sociales
            </h4>
            <ul className="space-y-2">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/30 text-sm hover:text-[#d5c108] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs">
            &copy; {new Date().getFullYear()} Xpand Capital Academy. Todos los derechos
            reservados.
          </p>
          <p className="text-white/10 text-xs">
            El trading conlleva riesgos. Infórmate adecuadamente.
          </p>
        </div>
      </div>
    </footer>
  )
}
