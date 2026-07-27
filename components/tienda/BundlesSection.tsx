"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Package, ShoppingCart, Zap, CheckCircle2, TrendingUp } from "lucide-react";

const BUNDLES = [
  {
    id: 1,
    name: "Plan Trimestral",
    tag: "Más Popular",
    tagColor: "bg-blis-red text-white",
    glow: "shadow-[0_0_40px_rgba(213,193,8,0.2)] border-blis-red/30",
    items: [
      "Acceso a todos los cursos",
      "Herramientas de trading",
      "Comunidad de traders",
    ],
    originalTotal: 299,
    bundlePrice: 199,
    savings: 100,
    savingsPct: 33,
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f44f?w=400&q=80",
    stock: 47,
    totalStock: 100,
    accent: "blis-red",
    accentHex: "#c9b500",
  },
  {
    id: 2,
    name: "Plan Anual",
    tag: "Mayor Ahorro",
    tagColor: "bg-amber-500 text-black",
    glow: "shadow-[0_0_40px_rgba(245,158,11,0.15)] border-amber-500/30",
    items: [
      "Acceso a todos los cursos",
      "Herramientas premium",
      "Mentorías personalizadas",
      "Comunidad VIP",
    ],
    originalTotal: 899,
    bundlePrice: 599,
    savings: 300,
    savingsPct: 33,
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80",
    stock: 23,
    totalStock: 50,
    accent: "amber-500",
    accentHex: "#f59e0b",
  },
  {
    id: 3,
    name: "Plan Anual + Mentoría",
    tag: "Todo Incluido",
    tagColor: "bg-purple-500 text-white",
    glow: "shadow-[0_0_40px_rgba(168,85,247,0.15)] border-purple-500/30",
    items: [
      "Plan Anual completo",
      "Mentoría 1:1 (12 sesiones)",
      "Análisis de operaciones",
      "Plan de trading personalizado",
      "Acceso vitalicio a grabaciones",
    ],
    originalTotal: 1398,
    bundlePrice: 799,
    savings: 599,
    savingsPct: 43,
    image: "https://images.unsplash.com/photo-1552581234-26160f608093?w=400&q=80",
    stock: 12,
    totalStock: 30,
    accent: "purple-500",
    accentHex: "#a855f7",
  },
];

export function BundlesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} id="bundles" className="w-full rounded-2xl border border-white/5 bg-[#050608] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blis-red/10 border border-blis-red/30 flex items-center justify-center">
          <Package className="w-4 h-4 text-blis-red" />
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Combos Exclusivos</p>
          <h3 className="text-sm font-black text-white uppercase">Bundles con Máximo Ahorro</h3>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-blis-red font-bold uppercase tracking-widest">
          <Zap className="w-3 h-3 fill-blis-red" /> Stock Limitado
        </div>
      </div>

      {/* Cards */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {BUNDLES.map((bundle, i) => (
          <motion.div
            key={bundle.id}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            onClick={() => setSelected(selected === bundle.id ? null : bundle.id)}
            className={`relative rounded-2xl border bg-black/40 overflow-hidden cursor-pointer transition-all duration-300 ${bundle.glow} ${selected === bundle.id ? "ring-2 ring-white/20" : ""}`}
          >
            {/* Imagen */}
            <div className="relative h-40 overflow-hidden">
              <img src={bundle.image} alt={bundle.name} className="w-full h-full object-cover opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

              {/* Tag */}
              <div className={`absolute top-3 left-3 text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${bundle.tagColor}`}>
                {bundle.tag}
              </div>

              {/* Savings badge */}
              <div className="absolute top-3 right-3 bg-black/80 border border-white/10 rounded-xl px-2.5 py-1.5 text-center">
                <p className="text-[8px] text-gray-500 uppercase">Ahorras</p>
                <p className="text-base font-black text-emerald-400 leading-none">{bundle.savingsPct}%</p>
              </div>

              {/* Bundle name */}
              <div className="absolute bottom-3 left-3">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Bundle</p>
                <h4 className="text-lg font-black text-white uppercase leading-tight">{bundle.name}</h4>
              </div>
            </div>

            {/* Body */}
            <div className="p-4">
              {/* Items incluidos */}
              <div className="space-y-1.5 mb-4">
                {bundle.items.map((item, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-[11px] text-gray-400 leading-tight">{item}</span>
                  </div>
                ))}
              </div>

              {/* Stock bar */}
              <div className="mb-4">
                <div className="flex justify-between text-[9px] text-gray-600 mb-1.5 font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-2.5 h-2.5 text-blis-red" />
                    {bundle.stock} disponibles
                  </span>
                  <span className="text-blis-red">{Math.round((bundle.stock / bundle.totalStock) * 100)}% restante</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${(bundle.stock / bundle.totalStock) * 100}%` } : {}}
                    transition={{ delay: i * 0.15 + 0.3, duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${bundle.accentHex}, ${bundle.accentHex}88)` }}
                  />
                </div>
              </div>

              {/* Precio */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-gray-600 line-through">${bundle.originalTotal} por separado</p>
                  <p className="text-2xl font-black text-white">${bundle.bundlePrice}</p>
                  <p className="text-[10px] text-emerald-400 font-bold">Ahorras ${bundle.savings}</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-white transition-all active:scale-95"
                  style={{ background: bundle.accentHex, boxShadow: `0 0 20px ${bundle.accentHex}44` }}>
                  <ShoppingCart className="w-3.5 h-3.5" /> Obtener
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-gray-600">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        Acceso inmediato a todos los productos del bundle · Licencia permanente incluida
      </div>
    </section>
  );
}

