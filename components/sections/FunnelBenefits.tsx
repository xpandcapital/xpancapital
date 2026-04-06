"use client";

import { motion } from "framer-motion";
import { Check, Star, TrendingUp, Shield, Users, Clock, Zap, Award } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Star, TrendingUp, Shield, Users, Clock, Zap, Award, Check
};

interface FunnelBenefitsProps {
  data?: {
    title?: string;
    subtitle?: string;
    description?: string;
    accentColor?: string;
    benefits?: Array<{
      icon?: string;
      title: string;
      description: string;
    }>;
    layout?: 'grid' | 'list';
  };
}

export function FunnelBenefits({ data = {} }: FunnelBenefitsProps) {
  const {
    title = "¿Por qué elegirnos?",
    subtitle = "Beneficios Exclusivos",
    accentColor = "#B10D24",
    benefits = [
      { icon: "TrendingUp", title: "Alta Plusvalía", description: "Propiedades con incremento de valor garantizado" },
      { icon: "Shield", title: "Seguridad Legal", description: "100% documentos en regla y saneamiento completo" },
      { icon: "Users", title: "Comunidad Exclusiva", description: "Acceso a una red de inversores de alto nivel" }
    ],
    layout = "grid"
  } = data;

  const getIcon = (iconName?: string) => {
    if (!iconName) return Check;
    return ICON_MAP[iconName] || Check;
  };

  return (
    <section className="relative py-20 md:py-32 bg-zinc-950 overflow-hidden">
      <div className="absolute inset-0">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-5"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p 
            className="text-xs font-black uppercase tracking-widest mb-4"
            style={{ color: accentColor }}
          >
            {subtitle}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white">
            {title}
          </h2>
        </motion.div>

        {layout === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = getIcon(benefit.icon);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-zinc-900/50 border border-white/5 rounded-[2rem] p-8 hover:border-white/10 transition-all"
                >
                  <div 
                    className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ 
                      background: `radial-gradient(circle at 50% 0%, ${accentColor}10 0%, transparent 50%)` 
                    }}
                  />
                  
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${accentColor}15` }}
                  >
                    <IconComponent className="w-7 h-7" style={{ color: accentColor }} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {benefits.map((benefit, index) => {
              const IconComponent = getIcon(benefit.icon);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 bg-zinc-900/30 border border-white/5 rounded-2xl p-6"
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${accentColor}15` }}
                  >
                    <IconComponent className="w-5 h-5" style={{ color: accentColor }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{benefit.title}</h3>
                    <p className="text-gray-400 text-sm">{benefit.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}