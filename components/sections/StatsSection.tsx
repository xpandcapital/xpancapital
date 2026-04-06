"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { TrendingUp, Users, Award, Building2, MapPin, Calendar } from "lucide-react";

interface Stat {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  description?: string;
  icon?: string;
}

interface StatsSectionProps {
  data?: {
    title?: string;
    subtitle?: string;
    description?: string;
    stats?: Stat[];
    accentColor?: string;
    layout?: 'grid' | 'horizontal' | 'featured';
    animated?: boolean;
    showIcons?: boolean;
  };
}

const ICON_MAP: Record<string, React.ElementType> = {
  TrendingUp, Users, Award, Building2, MapPin, Calendar
};

function AnimatedNumber({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(value * easeOut);
        
        setDisplayValue(current);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [isInView, value]);

  return (
    <span ref={ref} className="font-mono">
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

export function StatsSection({ data = {} }: StatsSectionProps) {
  const {
    title = "En Números",
    subtitle = "Nuestra Trayectoria",
    description = "Resultados que hablan por sí solos.",
    stats = [
      { value: 250, suffix: "+", label: "Proyectos", icon: "Building2" },
      { value: 2500, suffix: "+", label: "Clientes", icon: "Users" },
      { value: 10, label: "Años", icon: "Calendar" },
      { value: 15, prefix: "$", suffix: "M+", label: "Vendidos", icon: "TrendingUp" }
    ],
    accentColor = "#B10D24",
    layout = "grid",
    animated = true,
    showIcons = true
  } = data;

  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = ICON_MAP[iconName];
    return IconComponent ? <IconComponent className="w-6 h-6" /> : null;
  };

  if (layout === "horizontal") {
    return (
      <section className="py-12 border-y border-white/10" style={{ backgroundColor: `${accentColor}05` }}>
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                {animated ? (
                  <div className="text-3xl md:text-4xl font-black" style={{ color: accentColor }}>
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                  </div>
                ) : (
                  <div className="text-3xl md:text-4xl font-black" style={{ color: accentColor }}>
                    {stat.prefix}{stat.value.toLocaleString()}{stat.suffix}
                  </div>
                )}
                <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (layout === "featured") {
    const featured = stats[0];
    const rest = stats.slice(1);

    return (
      <section className="py-20 md:py-32 bg-zinc-950">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-zinc-900 rounded-[2rem] p-12 text-center"
              style={{
                boxShadow: `0 0 80px ${accentColor}20`
              }}
            >
              {showIcons && featured.icon && (
                <div
                  className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${accentColor}15` }}
                >
                  <div style={{ color: accentColor }}>{getIcon(featured.icon)}</div>
                </div>
              )}
              
              {animated ? (
                <div className="text-6xl md:text-7xl font-black mb-4" style={{ color: accentColor }}>
                  <AnimatedNumber value={featured.value} suffix={featured.suffix} prefix={featured.prefix} />
                </div>
              ) : (
                <div className="text-6xl md:text-7xl font-black mb-4" style={{ color: accentColor }}>
                  {featured.prefix}{featured.value.toLocaleString()}{featured.suffix}
                </div>
              )}
              
              <p className="text-2xl font-bold text-white mb-2">{featured.label}</p>
              {featured.description && (
                <p className="text-gray-400">{featured.description}</p>
              )}
            </motion.div>

            <div>
              {subtitle && (
                <p className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: accentColor }}>
                  {subtitle}
                </p>
              )}
              {title && (
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-6">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-gray-400 text-lg mb-8">{description}</p>
              )}

              <div className="grid grid-cols-2 gap-6">
                {rest.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4"
                  >
                    {animated ? (
                      <div className="text-2xl font-black mb-1" style={{ color: accentColor }}>
                        <AnimatedNumber value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                      </div>
                    ) : (
                      <div className="text-2xl font-black mb-1" style={{ color: accentColor }}>
                        {stat.prefix}{stat.value.toLocaleString()}{stat.suffix}
                      </div>
                    )}
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Grid layout (default)
  return (
    <section className="py-20 md:py-32 bg-zinc-950">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        {(title || subtitle || description) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            {subtitle && (
              <p className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: accentColor }}>
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-4">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-gray-400 max-w-2xl mx-auto">{description}</p>
            )}
          </motion.div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6"
            >
              {showIcons && stat.icon && (
                <div
                  className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${accentColor}15` }}
                >
                  <div style={{ color: accentColor }}>{getIcon(stat.icon)}</div>
                </div>
              )}
              
              {animated ? (
                <div className="text-3xl md:text-4xl font-black mb-2" style={{ color: accentColor }}>
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                </div>
              ) : (
                <div className="text-3xl md:text-4xl font-black mb-2" style={{ color: accentColor }}>
                  {stat.prefix}{stat.value.toLocaleString()}{stat.suffix}
                </div>
              )}
              
              <p className="text-white font-bold mb-1">{stat.label}</p>
              {stat.description && (
                <p className="text-gray-400 text-sm">{stat.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}