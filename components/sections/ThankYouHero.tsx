"use client";

import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface ThankYouHeroProps {
  data?: {
    title1?: string;
    title2?: string;
    subtitle?: string;
    description?: string;
    icon?: string;
    primaryBtnText?: string;
    primaryBtnLink?: string;
    secondaryBtnText?: string;
    secondaryBtnLink?: string;
    backgroundColor?: string;
    accentColor?: string;
  };
}

export function ThankYouHero({ data = {} }: ThankYouHeroProps) {
  const {
    title1 = "¡Gracias!",
    title2 = "Confirmación Exitosa",
    subtitle = "Tu operación ha sido procesada correctamente",
    description = "Hemos recibido tu información y te contactaremos a la brevedad.",
    primaryBtnText = "Ir al Dashboard",
    primaryBtnLink = "/miembros",
    secondaryBtnText,
    secondaryBtnLink,
    accentColor = "#10B981"
  } = data;

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      <div className="absolute inset-0">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-20"
          style={{ backgroundColor: accentColor }}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/50 to-black" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 md:px-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div 
            className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full flex items-center justify-center shadow-2xl"
            style={{ 
              backgroundColor: `${accentColor}20`,
              boxShadow: `0 0 60px ${accentColor}40`
            }}
          >
            <CheckCircle 
              className="w-12 h-12 md:w-16 md:h-16" 
              style={{ color: accentColor }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white mb-4">
            {title1}
            {title2 && (
              <>
                <br />
                <span style={{ color: accentColor }}>{title2}</span>
              </>
            )}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-4 font-medium">
            {subtitle}
          </p>
          
          <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto mb-10">
            {description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href={primaryBtnLink}
            className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 transition-all hover:scale-105 shadow-2xl"
            style={{ 
              backgroundColor: accentColor,
              color: '#000'
            }}
          >
            <Sparkles className="w-5 h-5" />
            {primaryBtnText}
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          {secondaryBtnText && secondaryBtnLink && (
            <Link
              href={secondaryBtnLink}
              className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm border border-white/10 text-white hover:bg-white/5 transition-all"
            >
              {secondaryBtnText}
            </Link>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-16 pt-8 border-t border-white/10"
        >
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            ¿Necesitas ayuda?{" "}
            <Link href="/contacto" className="text-white hover:underline">
              Contáctanos
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}