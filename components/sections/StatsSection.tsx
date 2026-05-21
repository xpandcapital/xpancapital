"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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

function generateSparkline(target: number, points = 10) {
  const data: number[] = [];
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    const growth = Math.pow(progress, 0.7);
    const noise = (Math.sin(i * 1.8) * 0.08 + Math.cos(i * 2.3) * 0.05);
    data.push(Math.max(0, Math.round(target * (growth * 0.85 + noise))));
  }
  data[data.length - 1] = target;
  return data;
}

function pathFromData(data: number[], max: number, width: number, height: number) {
  if (data.length < 2) return "";
  const xStep = width / (data.length - 1);
  return data.map((v, i) => {
    const x = i * xStep;
    const y = height - (v / max) * height;
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");
}

function StatSparklineCard({ stat, index }: { stat: Stat; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [sparkData] = useState(() => generateSparkline(stat.value, 10));
  const maxVal = Math.max(...sparkData, 1);

  const svgW = 120;
  const svgH = 36;
  const pathD = pathFromData(sparkData, maxVal, svgW, svgH);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="text-center p-6 rounded-2xl glass-card border border-white/5 hover:border-blis-red/30 transition-all duration-500 group"
    >
      <div className="flex flex-col items-center">
        <div className="text-3xl md:text-4xl font-black mb-2 text-white neon-text transition-all group-hover:scale-105">
          {stat.prefix}{stat.value.toLocaleString()}{stat.suffix}
        </div>
        <p className="text-white font-bold mb-3 text-sm uppercase tracking-wider">{stat.label}</p>

        {/* Sparkline SVG */}
        <div className="w-full flex justify-center mt-1">
          <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="overflow-visible">
            <defs>
              <linearGradient id={`sg-${index}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(255,30,86,0.1)" />
                <stop offset="100%" stopColor="rgba(255,30,86,0.9)" />
              </linearGradient>
            </defs>
            {/* Área bajo la curva */}
            <motion.path
              d={`${pathD} L ${svgW} ${svgH} L 0 ${svgH} Z`}
              fill={`url(#sg-${index})`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.25 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
            {/* Línea principal */}
            <motion.path
              d={pathD}
              fill="none"
              stroke="#ff1e56"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.2 + index * 0.1, ease: "easeOut" }}
              style={{
                filter: "drop-shadow(0 0 4px rgba(255,30,86,0.7))",
              }}
            />
            {/* Puntos críticos (peak glow) */}
            {sparkData.map((v, i) => (
              <motion.circle
                key={i}
                cx={i * (svgW / (sparkData.length - 1))}
                cy={svgH - (v / maxVal) * svgH}
                r={v === maxVal ? 2.5 : 0}
                fill="#ff1e56"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
                style={{
                  filter: "drop-shadow(0 0 6px rgba(255,30,86,1))",
                }}
              />
            ))}
          </svg>
        </div>
      </div>
    </motion.div>
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

  // Grid layout (default) — con sparklines
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
            <StatSparklineCard key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

// AnimatedNumber helper — mantiene el original
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

function useInView(ref: React.RefObject<HTMLElement | null>, options?: { once?: boolean }) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (options?.once) obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, options?.once]);

  return isInView;
}
