"use client";

import { motion } from "framer-motion";
import { ArrowRight, Phone, Mail, MessageCircle, Calendar } from "lucide-react";
import Link from "next/link";

interface ThankYouNextStepsProps {
  data?: {
    title?: string;
    subtitle?: string;
    steps?: Array<{
      icon?: string;
      title: string;
      description: string;
      action?: string;
      link?: string;
    }>;
    contactInfo?: {
      phone?: string;
      email?: string;
      whatsapp?: string;
    };
    accentColor?: string;
  };
}

export function ThankYouNextSteps({ data = {} }: ThankYouNextStepsProps) {
  const {
    title = "¿Qué sigue?",
    subtitle = "Próximos Pasos",
    steps = [
      { icon: "Mail", title: "Revisa tu email", description: "Te enviamos un correo con todos los detalles" },
      { icon: "Phone", title: "Te contactaremos", description: "Un asesor te llamará en las próximas 24 horas" },
      { icon: "Calendar", title: "Agenda tu cita", description: "Programa una visita al proyecto de tu interés" }
    ],
    contactInfo,
    accentColor = "#10B981"
  } = data;

  const getIcon = (iconName?: string) => {
    const icons: Record<string, React.ElementType> = {
      Mail, Phone, MessageCircle, Calendar, ArrowRight
    };
    return icons[iconName || "Mail"] || Mail;
  };

  return (
    <section className="py-20 md:py-24 bg-black">
      <div className="w-full max-w-5xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p 
            className="text-xs font-black uppercase tracking-widest mb-3"
            style={{ color: accentColor }}
          >
            {subtitle}
          </p>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">
            {title}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => {
            const IconComponent = getIcon(step.icon);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="bg-zinc-950 border border-white/5 rounded-[2rem] p-8 text-center hover:border-white/10 transition-all h-full">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black bg-black border border-white/10 text-white">
                    {index + 1}
                  </div>
                  
                  <div 
                    className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${accentColor}15` }}
                  >
                    <IconComponent className="w-8 h-8" style={{ color: accentColor }} />
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4">
                    {step.description}
                  </p>

                  {step.action && step.link && (
                    <Link
                      href={step.link}
                      className="inline-flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all"
                      style={{ color: accentColor }}
                    >
                      {step.action}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {contactInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-gray-500 text-sm mb-4">¿Tienes dudas? Contáctanos directamente:</p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {contactInfo.phone && (
                <a 
                  href={`tel:${contactInfo.phone}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {contactInfo.phone}
                </a>
              )}
              {contactInfo.email && (
                <a 
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {contactInfo.email}
                </a>
              )}
              {contactInfo.whatsapp && (
                <a 
                  href={`https://wa.me/${contactInfo.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: accentColor }}
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}