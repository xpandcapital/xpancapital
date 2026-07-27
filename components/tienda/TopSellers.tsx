"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Flame, ShoppingCart, Star, Crown } from "lucide-react";
import Link from "next/link";

const TOP_PRODUCTS = [
  {
    rank: 1,
    title: "Plan Anual",
    category: "Cursos",
    price: 599,
    originalPrice: 899,
    sales: 3847,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300&q=80",
    trend: +24,
    badge: "Campeón",
    badgeColor: "text-amber-400 border-amber-500/40 bg-amber-500/10",
    rankColor: "text-amber-400",
    glow: "shadow-[0_0_30px_rgba(245,158,11,0.15)]",
  },
  {
    rank: 2,
    title: "Plan Trimestral",
    category: "Cursos",
    price: 199,
    originalPrice: 299,
    sales: 962,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f44f?w=300&q=80",
    trend: +18,
    badge: "Tendencia",
    badgeColor: "text-blis-red border-blis-red/40 bg-blis-red/10",
    rankColor: "text-gray-300",
    glow: "shadow-[0_0_20px_rgba(213,193,8,0.1)]",
  },
  {
    rank: 3,
    title: "Curso: Análisis Técnico Profesional",
    category: "Cursos",
    price: 149,
    originalPrice: 249,
    sales: 1121,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=300&q=80",
    trend: +12,
    badge: "Popular",
    badgeColor: "text-sky-400 border-sky-500/40 bg-sky-500/10",
    rankColor: "text-amber-700",
    glow: "",
  },
  {
    rank: 4,
    title: "Curso: Psicología del Trading",
    category: "Cursos",
    price: 99,
    originalPrice: 179,
    sales: 780,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&q=80",
    trend: +8,
    badge: "Nuevo Hit",
    badgeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
    rankColor: "text-gray-500",
    glow: "",
  },
  {
    rank: 5,
    title: "Mentoría 1:1 con Trader Profesional",
    category: "Cursos",
    price: 299,
    originalPrice: 499,
    sales: 303,
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1552581234-26160f608093?w=300&q=80",
    trend: +31,
    badge: "Exclusivo",
    badgeColor: "text-purple-400 border-purple-500/40 bg-purple-500/10",
    rankColor: "text-gray-500",
    glow: "",
  },
];

function useCountUp(target: number, duration = 1400, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const steps = 50;
    const inc = target / steps;
    let cur = 0;
    const iv = setInterval(() => {
      cur += inc;
      if (cur >= target) { setCount(target); clearInterval(iv); }
      else setCount(Math.floor(cur));
    }, duration / steps);
    return () => clearInterval(iv);
  }, [target, duration, start]);
  return count;
}

function TopSellerRow({ product: p, index: i, inView }: { product: typeof TOP_PRODUCTS[0]; index: number; inView: boolean }) {
  const salesCount = useCountUp(p.sales, 1400, inView);
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: i * 0.08, duration: 0.4 }}
      className={`flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors group ${p.glow}`}
    >
      {/* Rank */}
      <div className={`text-3xl font-black tabular-nums w-10 text-center flex-shrink-0 ${p.rankColor}`}>
        {p.rank === 1 ? <Flame className="w-7 h-7 text-amber-400 fill-amber-400 mx-auto" /> : `#${p.rank}`}
      </div>

      {/* Imagen */}
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
        <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${p.badgeColor}`}>
            {p.badge}
          </span>
          <span className="text-[9px] text-gray-600 uppercase">{p.category}</span>
        </div>
        <p className="text-sm font-bold text-white leading-tight line-clamp-1 group-hover:text-blis-red transition-colors">
          {p.title}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
            <Star className="w-3 h-3 fill-amber-400" /> {p.rating}
          </span>
          <span className="text-[10px] text-gray-500 font-mono">
            {salesCount.toLocaleString()} ventas
          </span>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +{p.trend}% este mes
          </span>
        </div>
      </div>

      {/* Precio y CTA */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <div className="text-right">
          <p className="text-[10px] text-gray-600 line-through">${p.originalPrice}</p>
          <p className="text-base font-black text-white">${p.price}</p>
        </div>
        <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-blis-red/10 border border-blis-red/30 text-blis-red hover:bg-blis-red hover:text-white transition-all">
          <ShoppingCart className="w-3 h-3" /> Agregar
        </button>
      </div>
    </motion.div>
  );
}

export function TopSellers() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} id="top-sellers" className="w-full rounded-2xl border border-white/5 bg-[#050608] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <Crown className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Ranking</p>
          <h3 className="text-sm font-black text-white uppercase">Top 5 Más Vendidos</h3>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-400/5 border border-emerald-400/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Actualizado hoy
        </div>
      </div>

      {/* Lista */}
      <div className="divide-y divide-white/5">
        {TOP_PRODUCTS.map((p, i) => (
          <TopSellerRow key={p.rank} product={p} index={i} inView={inView} />
        ))}
      </div>
    </section>
  );
}


