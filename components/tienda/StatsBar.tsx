"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Users, ShoppingBag, Star, TrendingUp } from "lucide-react";

interface StatItem {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix: string;
  color: string;
}

const STATS: StatItem[] = [
  { icon: Users,       label: "Clientes Activos",    value: 4820,  suffix: "+",  color: "text-emerald-400" },
  { icon: ShoppingBag, label: "Productos Vendidos",   value: 12400, suffix: "+",  color: "text-blis-red"    },
  { icon: Star,        label: "Calificación Promedio",value: 4.9,   suffix: "/5", color: "text-amber-400"   },
  { icon: TrendingUp,  label: "Crecimiento Mensual",  value: 38,    suffix: "%",  color: "text-sky-400"     },
];

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const isDecimal = target % 1 !== 0;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [target, duration, start]);
  return count;
}

function StatCard({ stat, index, inView }: { stat: StatItem; index: number; inView: boolean }) {
  const count = useCountUp(stat.value, 1600, inView);
  const Icon = stat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="flex-1 flex flex-col items-center justify-center py-6 px-4 border-r border-white/5 last:border-r-0"
    >
      <div className={`mb-2 ${stat.color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className={`text-3xl md:text-4xl font-black tabular-nums ${stat.color}`}>
        {count}{stat.suffix}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mt-1 text-center">
        {stat.label}
      </div>
    </motion.div>
  );
}

export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/5">
        {STATS.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} inView={inView} />
        ))}
      </div>
    </div>
  );
}
