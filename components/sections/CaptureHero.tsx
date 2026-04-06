"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Shield, Clock } from "lucide-react";
import { CaptureForm } from "./CaptureForm";

interface CaptureHeroProps {
  data?: {
    title1?: string;
    title2?: string;
    subtitle?: string;
    description?: string;
    backgroundImage?: string;
    accentColor?: string;
    showStats?: boolean;
    stats?: Array<{
      value: string;
      label: string;
    }>;
    benefits?: Array<{
      icon?: string;
      text: string;
    }>;
    form?: {
      title?: string;
      subtitle?: string;
      fields?: Array<{
        name: string;
        label: string;
        type: 'text' | 'email' | 'tel' | 'select';
        placeholder?: string;
        required?: boolean;
        options?: string[];
      }>;
      submitText?: string;
      successTitle?: string;
      successMessage?: string;
      privacyText?: string;
      redirectUrl?: string;
    };
  };
}

export function CaptureHero({ data = {} }: CaptureHeroProps) {
  const {
    title1 = "Obtén Acceso",
    title2 = "Exclusivo",
    subtitle = "Únete a la élite inmobiliaria",
    description = "Regístrate para recibir contenido exclusivo, oportunidades de inversión y asesoría personalizada.",
    backgroundImage,
    accentColor = "#B10D24",
    showStats = true,
    stats = [
      { value: "+250%", label: "Plusvalía Promedio" },
      { value: "2,500+", label: "Clientes Satisfechos" },
      { value: "10+", label: "Años de Experiencia" }
    ],
    benefits = [
      { text: "Acceso anticipado a proyectos" },
      { text: "Asesoría gratuita mensual" },
      { text: "Contenido exclusivo del mercado" }
    ],
    form
  } = data;

  return (
    <section className="relative min-h-screen flex items-center bg-black overflow-hidden">
      {backgroundImage && (
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-black/70" />
        </div>
      )}

      <div className="absolute inset-0">
        <div 
          className="absolute top-1/4 right-1/3 w-[600px] h-[600px] rounded-full blur-[180px] opacity-10"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: `${accentColor}15` }}>
              <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                Acceso Limitado
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white mb-4">
              {title1}
              <br />
              <span style={{ color: accentColor }}>{title2}</span>
            </h1>

            <p className="text-xl text-gray-300 mb-3 font-medium">
              {subtitle}
            </p>

            <p className="text-gray-400 mb-8 max-w-lg">
              {description}
            </p>

            {benefits.length > 0 && (
              <div className="space-y-4 mb-10">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${accentColor}20` }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                    </div>
                    <span className="text-gray-300">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {showStats && stats.length > 0 && (
              <div className="grid grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center md:text-left">
                    <p className="text-2xl md:text-3xl font-black text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
              <CaptureForm data={form || {}} />
              
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-6 text-gray-500">
                <div className="flex items-center gap-2 text-xs">
                  <Shield className="w-4 h-4" />
                  Datos Seguros
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-4 h-4" />
                  Respuesta 24h
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}