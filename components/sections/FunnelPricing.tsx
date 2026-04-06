"use client";

import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";

interface PricingTier {
  name: string;
  price?: string;
  priceNote?: string;
  description?: string;
  features: string[];
  highlighted?: boolean;
  buttonText?: string;
  buttonLink?: string;
}

interface FunnelPricingProps {
  data?: {
    title?: string;
    subtitle?: string;
    description?: string;
    tiers?: PricingTier[];
    accentColor?: string;
    layout?: 'cards' | 'table' | 'comparison';
    showBadge?: boolean;
  };
}

export function FunnelPricing({ data = {} }: FunnelPricingProps) {
  const {
    title = "Elige tu Plan",
    subtitle = "Opciones de Inversión",
    description = "Selecciona la opción que mejor se adapte a tus necesidades.",
    tiers = [
      {
        name: "Básico",
        price: "$5,000",
        priceNote: "Inicial",
        description: "Ideal para comenzar en el mundo inmobiliario",
        features: [
          "Acceso a 1 proyecto",
          "Asesoría mensual",
          "Documentación básica",
          "Soporte por email"
        ],
        buttonText: "Comenzar",
        buttonLink: "#"
      },
      {
        name: "Premium",
        price: "$15,000",
        priceNote: "Inicial",
        description: "Para inversores que buscan mayor rentabilidad",
        features: [
          "Acceso a todos los proyectos",
          "Asesoría semanal personalizada",
          "Documentación completa",
          "Soporte prioritario 24/7",
          "Acceso a eventos exclusivos"
        ],
        highlighted: true,
        buttonText: "Elegir Premium",
        buttonLink: "#"
      },
      {
        name: "Élite",
        price: "$50,000+",
        priceNote: "Inversión mínima",
        description: "Para inversores institucionales",
        features: [
          "Proyectos exclusivos",
          "Asesoría dedicada",
          "Rentabilidad garantizada",
          "Soarte VIP",
          "Eventos privados",
          "Networking exclusivo"
        ],
        buttonText: "Contactar",
        buttonLink: "#"
      }
    ],
    accentColor = "#B10D24",
    layout = "cards",
    showBadge = true
  } = data;

  if (layout === "table") {
    const allFeatures = Array.from(
      new Set(tiers.flatMap(t => t.features))
    );

    return (
      <section className="py-20 md:py-32 bg-zinc-950">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            {subtitle && (
              <p
                className="text-sm font-bold uppercase tracking-widest mb-4"
                style={{ color: accentColor }}
              >
                {subtitle}
              </p>
            )}
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-4">
              {title}
            </h2>
            {description && (
              <p className="text-gray-400 max-w-2xl mx-auto">{description}</p>
            )}
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-4 text-left text-gray-400 text-sm font-bold uppercase">Características</th>
                  {tiers.map((tier, idx) => (
                    <th
                      key={idx}
                      className={`p-4 text-center ${tier.highlighted ? 'bg-white/5' : ''}`}
                    >
                      <p className="text-white font-bold">{tier.name}</p>
                      <p className="text-2xl font-black" style={{ color: tier.highlighted ? accentColor : 'white' }}>
                        {tier.price}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allFeatures.map((feature, fIdx) => (
                  <tr key={fIdx} className="border-t border-white/5">
                    <td className="p-4 text-gray-300 text-sm">{feature}</td>
                    {tiers.map((tier, tIdx) => (
                      <td
                        key={tIdx}
                        className={`p-4 text-center ${tier.highlighted ? 'bg-white/5' : ''}`}
                      >
                        {tier.features.includes(feature) ? (
                          <Check className="w-5 h-5 mx-auto" style={{ color: accentColor }} />
                        ) : (
                          <X className="w-5 h-5 mx-auto text-gray-600" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }

  // Cards layout (default)
  return (
    <section className="py-20 md:py-32 bg-zinc-950">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {subtitle && (
            <p
              className="text-sm font-bold uppercase tracking-widest mb-4"
              style={{ color: accentColor }}
            >
              {subtitle}
            </p>
          )}
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-4">
            {title}
          </h2>
          {description && (
            <p className="text-gray-400 max-w-2xl mx-auto">{description}</p>
          )}
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-[2rem] p-8 ${
                tier.highlighted
                  ? 'bg-zinc-900 border-2'
                  : 'bg-zinc-900/50 border border-white/5'
              }`}
              style={{
                borderColor: tier.highlighted ? accentColor : undefined,
                boxShadow: tier.highlighted ? `0 0 40px ${accentColor}20` : undefined
              }}
            >
              {tier.highlighted && showBadge && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1"
                  style={{ backgroundColor: accentColor }}
                >
                  <Sparkles className="w-3 h-3" />
                  Más Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-black" style={{ color: tier.highlighted ? accentColor : 'white' }}>
                    {tier.price}
                  </span>
                  {tier.priceNote && (
                    <span className="text-gray-400 text-sm ml-1">{tier.priceNote}</span>
                  )}
                </div>
                {tier.description && (
                  <p className="text-gray-400 text-sm">{tier.description}</p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 shrink-0 mt-0.5" style={{ color: accentColor }} />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {tier.buttonText && tier.buttonLink && (
                <a
                  href={tier.buttonLink}
                  className={`block w-full py-4 rounded-xl text-center font-bold uppercase tracking-widest text-sm transition-all ${
                    tier.highlighted
                      ? 'text-white'
                      : 'border border-white/10 text-white hover:bg-white/5'
                  }`}
                  style={tier.highlighted ? { backgroundColor: accentColor } : undefined}
                >
                  {tier.buttonText}
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}