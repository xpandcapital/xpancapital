"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, Users, TrendingUp, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface FunnelHeroProps {
  data?: {
    title1?: string;
    title2?: string;
    subtitle?: string;
    description?: string;
    backgroundImage?: string;
    videoUrl?: string;
    primaryBtnText?: string;
    primaryBtnLink?: string;
    urgencyText?: string;
    urgencyCount?: number;
    accentColor?: string;
    showCountdown?: boolean;
    countdownEnd?: string;
  };
}

export function FunnelHero({ data = {} }: FunnelHeroProps) {
  const {
    title1 = "Transforma Tu",
    title2 = "Patrimonio",
    subtitle = "La Oportunidad Inmobiliaria del Año",
    description = "Descubre cómo multiplicar tu inversión con terrenos de alta plusvalía.",
    backgroundImage,
    videoUrl,
    primaryBtnText = "Quiero Participar",
    primaryBtnLink = "#formulario",
    urgencyText = "Cupos Limitados",
    urgencyCount = 12,
    accentColor = "#B10D24",
    showCountdown = false,
    countdownEnd
  } = data;

  return (
    <section className="relative min-h-screen flex items-center bg-black overflow-hidden">
      {backgroundImage && (
        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt="Background"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/50" />
        </div>
      )}

      <div className="absolute inset-0">
        <div 
          className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-15"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              >
                <Clock className="w-3 h-3 inline mr-1" />
                {urgencyText}
              </div>
              {urgencyCount && (
                <div className="flex items-center gap-2 text-white/80">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-bold">{urgencyCount} lugares</span>
                </div>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter text-white mb-4">
              {title1}
              <br />
              <span style={{ color: accentColor }}>{title2}</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-4 font-medium">
              {subtitle}
            </p>

            <p className="text-gray-400 mb-8 max-w-lg">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={primaryBtnLink}
                className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-2xl"
                style={{ backgroundColor: accentColor, color: '#fff' }}
              >
                {primaryBtnText}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6">
              <div className="text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2" style={{ color: accentColor }} />
                <p className="text-2xl font-black text-white">+250%</p>
                <p className="text-xs text-gray-500 uppercase">Plusvalía</p>
              </div>
              <div className="text-center">
                <Users className="w-6 h-6 mx-auto mb-2" style={{ color: accentColor }} />
                <p className="text-2xl font-black text-white">2,500+</p>
                <p className="text-xs text-gray-500 uppercase">Clientes</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-2" style={{ color: accentColor }} />
                <p className="text-2xl font-black text-white">100%</p>
                <p className="text-xs text-gray-500 uppercase">Seguro</p>
              </div>
            </div>
          </motion.div>

          {videoUrl && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative aspect-video rounded-[2rem] overflow-hidden shadow-2xl border border-white/10"
            >
              <iframe
                src={videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}