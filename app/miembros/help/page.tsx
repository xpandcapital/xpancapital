"use client";

import { motion } from "framer-motion";
import { HelpCircle, Book, MessageCircle, Video, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";

const HELPCATEGORIES = [
  {
    icon: Book,
    title: "Guías de Inicio",
    description: "Aprende a usar la plataforma desde cero",
    href: "/miembros/academia"
  },
  {
    icon: Video,
    title: "Video Tutoriales",
    description: "Tutoriales en video paso a paso",
    href: "/miembros/academia"
  },
  {
    icon: FileText,
    title: "Documentación",
    description: "Manuales y documentación técnica",
    href: "/miembros/biblioteca"
  },
  {
    icon: MessageCircle,
    title: "Soporte Directo",
    description: "Contacta con nuestro equipo de soporte",
    href: "https://wa.me/573223501170",
    external: true
  }
];

export default function HelpPage() {
  return (
    <div className="space-y-8 px-4 md:px-8 pt-8 w-full mx-auto pb-20">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-blis-red/10 rounded-3xl flex items-center justify-center mx-auto"
        >
          <HelpCircle className="w-10 h-10 text-blis-red" />
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter">
          Centro de Ayuda
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Encuentra respuestas a tus preguntas y aprende a maximizar el valor de tu membresía.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {HELPCATEGORIES.map((category, index) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={category.href}
              target={category.external ? "_blank" : undefined}
              rel={category.external ? "noopener noreferrer" : undefined}
              className="group bg-zinc-950 border border-white/5 rounded-[2rem] p-8 block hover:border-blis-red/30 transition-all"
            >
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-blis-red/10 transition-colors">
                  <category.icon className="w-6 h-6 text-gray-400 group-hover:text-blis-red transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-2 group-hover:text-blis-red transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-gray-500 text-sm">{category.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blis-red group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="bg-zinc-950 border border-white/5 rounded-[2rem] p-8 max-w-4xl mx-auto text-center">
        <h2 className="text-xl font-bold text-white mb-4">¿No encontraste lo que buscabas?</h2>
        <p className="text-gray-400 mb-6">Nuestro equipo está disponible 24/7 para ayudarte.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:soporte@xpancapital.org"
            className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Enviar Email
          </a>
          <a
            href="https://wa.me/573223501170"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-blis-red text-white font-bold rounded-xl hover:bg-blis-red/80 transition-colors"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
