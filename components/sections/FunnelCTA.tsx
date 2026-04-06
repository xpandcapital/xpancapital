"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface FunnelCTAProps {
  data?: {
    title?: string;
    subtitle?: string;
    description?: string;
    primaryBtnText?: string;
    primaryBtnLink?: string;
    secondaryBtnText?: string;
    secondaryBtnLink?: string;
    accentColor?: string;
    backgroundColor?: string;
    showUrgency?: boolean;
    urgencyText?: string;
  };
}

export function FunnelCTA({ data = {} }: FunnelCTAProps) {
  const {
    title = "¿Listo para Dar el Siguiente Paso?",
    subtitle = "Acción Inmediata",
    description = "No dejes pasar esta oportunidad. Los lugares son limitados y la demanda es alta.",
    primaryBtnText = "Inscribirme Ahora",
    primaryBtnLink = "#formulario",
    secondaryBtnText = "Ver Detalles",
    secondaryBtnLink = "#detalles",
    accentColor = "#B10D24",
    showUrgency = true,
    urgencyText = "Últimos lugares disponibles"
  } = data;

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{ 
          background: `linear-gradient(135deg, ${accentColor}20 0%, transparent 50%)` 
        }}
      />
      
      <div className="absolute inset-0">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full blur-[200px] opacity-20"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {showUrgency && (
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                {urgencyText}
              </span>
            </div>
          )}

          <p 
            className="text-sm font-black uppercase tracking-widest mb-4"
            style={{ color: accentColor }}
          >
            {subtitle}
          </p>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white mb-6">
            {title}
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={primaryBtnLink}
              className="w-full sm:w-auto px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-2xl"
              style={{ backgroundColor: accentColor, color: '#fff' }}
            >
              {primaryBtnText}
              <ArrowRight className="w-5 h-5" />
            </Link>

            {secondaryBtnText && secondaryBtnLink && (
              <Link
                href={secondaryBtnLink}
                className="w-full sm:w-auto px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm border border-white/10 text-white hover:bg-white/5 transition-all"
              >
                {secondaryBtnText}
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}