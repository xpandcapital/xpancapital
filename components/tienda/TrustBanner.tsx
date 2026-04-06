"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Zap, Lock, Headphones, BadgeCheck, Globe } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Compra 100% Segura",
    desc: "Transacciones cifradas con SSL. Tu información siempre protegida.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/5 border-emerald-400/20",
    glow: "group-hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]",
  },
  {
    icon: Zap,
    title: "Acceso Inmediato",
    desc: "Descarga y accede a tu producto en segundos tras confirmar el pago.",
    color: "text-amber-400",
    bg: "bg-amber-400/5 border-amber-400/20",
    glow: "group-hover:shadow-[0_0_20px_rgba(251,191,36,0.15)]",
  },
  {
    icon: Lock,
    title: "Licencia Permanente",
    desc: "Una sola compra, acceso de por vida. Sin suscripciones ni cobros ocultos.",
    color: "text-sky-400",
    bg: "bg-sky-400/5 border-sky-400/20",
    glow: "group-hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]",
  },
  {
    icon: BadgeCheck,
    title: "Contenido Certificado",
    desc: "Creado por expertos BLIS con más de 10 años en el mercado inmobiliario.",
    color: "text-purple-400",
    bg: "bg-purple-400/5 border-purple-400/20",
    glow: "group-hover:shadow-[0_0_20px_rgba(192,132,252,0.15)]",
  },
  {
    icon: Headphones,
    title: "Soporte Prioritario",
    desc: "Equipo BLIS disponible para resolver dudas sobre tu producto adquirido.",
    color: "text-blis-red",
    bg: "bg-blis-red/5 border-blis-red/20",
    glow: "group-hover:shadow-[0_0_20px_rgba(190,11,60,0.15)]",
  },
  {
    icon: Globe,
    title: "Disponible en Todo LatAm",
    desc: "Precios en USD, acepta pagos locales. Comunidad activa en 12 países.",
    color: "text-teal-400",
    bg: "bg-teal-400/5 border-teal-400/20",
    glow: "group-hover:shadow-[0_0_20px_rgba(45,212,191,0.15)]",
  },
];

export function TrustBanner() {
  return (
    <section className="w-full rounded-2xl border border-white/5 bg-[#050608] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Por qué elegirnos</p>
        <h3 className="text-sm font-black text-white uppercase">Comprás con Confianza Total</h3>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-white/5">
        {TRUST_ITEMS.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className={`group bg-[#050608] p-6 flex flex-col gap-3 transition-all duration-300 cursor-default ${item.glow}`}
            >
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all duration-300 ${item.bg}`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div>
                <p className={`text-sm font-black mb-1 ${item.color}`}>{item.title}</p>
                <p className="text-[11px] text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer disclaimer */}
      <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01]">
        <p className="text-[10px] text-gray-600 text-center">
          Todos los productos son digitales. Por la naturaleza del contenido, <span className="text-gray-500 font-bold">no se realizan reembolsos</span> una vez otorgado el acceso. Revisa la descripción antes de comprar.
        </p>
      </div>
    </section>
  );
}
