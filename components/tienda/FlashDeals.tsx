"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Clock, ShoppingCart, TrendingUp } from "lucide-react";

const DEALS = [
  {
    id: 1,
    title: "Kit Legal Completo de Agentes",
    category: "Contratos",
    originalPrice: 150,
    salePrice: 89,
    discount: 41,
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80",
    sold: 847,
    total: 1000,
    color: "from-amber-500/20 to-transparent",
    accent: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    id: 2,
    title: "Masterclass Inteligencia Competitiva",
    category: "Cursos",
    originalPrice: 499,
    salePrice: 249,
    discount: 50,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80",
    sold: 312,
    total: 500,
    color: "from-blis-red/20 to-transparent",
    accent: "text-blis-red border-blis-red/30 bg-blis-red/10",
  },
  {
    id: 3,
    title: "Pack Redes Sociales Real Estate",
    category: "Kits",
    originalPrice: 80,
    salePrice: 45,
    discount: 44,
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80",
    sold: 621,
    total: 800,
    color: "from-sky-500/20 to-transparent",
    accent: "text-sky-400 border-sky-500/30 bg-sky-500/10",
  },
];

function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s <= 0 ? initialSeconds : s - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [initialSeconds]);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return { h, m, s };
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-black border border-blis-red/40 rounded-lg w-9 h-9 flex items-center justify-center font-mono font-black text-sm text-white shadow-[0_0_10px_rgba(190,11,60,0.3)]">
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-[8px] text-gray-500 uppercase tracking-widest mt-1">{label}</span>
    </div>
  );
}

export function FlashDeals() {
  const { h, m, s } = useCountdown(4 * 3600 + 23 * 60 + 17);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % DEALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const deal = DEALS[active];

  return (
    <section id="flash-deals" className="w-full rounded-2xl border border-white/5 overflow-hidden bg-[#050608]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-blis-red/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blis-red flex items-center justify-center shadow-[0_0_15px_rgba(190,11,60,0.6)]">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Oferta Relámpago</p>
            <h3 className="text-sm font-black text-white uppercase">Flash Deals</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-blis-red" />
          <div className="flex items-center gap-1">
            <TimeUnit value={h} label="hrs" />
            <span className="text-blis-red font-black pb-3">:</span>
            <TimeUnit value={m} label="min" />
            <span className="text-blis-red font-black pb-3">:</span>
            <TimeUnit value={s} label="seg" />
          </div>
        </div>
      </div>

      {/* Deal cards */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {DEALS.map((d, i) => (
          <motion.div
            key={d.id}
            onClick={() => setActive(i)}
            animate={{ scale: active === i ? 1 : 0.97, opacity: active === i ? 1 : 0.6 }}
            transition={{ duration: 0.3 }}
            className={`relative text-left rounded-xl border overflow-hidden transition-all cursor-pointer ${active === i ? "border-white/20" : "border-white/5"}`}
          >
            {/* Imagen */}
            <div className="relative h-36 overflow-hidden">
              <img src={d.image} alt={d.title} className="w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-t ${d.color}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              {/* Descuento badge */}
              <div className="absolute top-3 left-3 bg-blis-red text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg">
                -{d.discount}%
              </div>
              {/* Categoría */}
              <span className={`absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${d.accent}`}>
                {d.category}
              </span>
            </div>

            {/* Info */}
            <div className="p-4 bg-black/60">
              <p className="text-xs font-black text-white uppercase leading-tight line-clamp-2 mb-3">
                {d.title}
              </p>

              {/* Barra de progreso de unidades */}
              <div className="mb-3">
                <div className="flex justify-between text-[9px] text-gray-500 mb-1 font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1"><TrendingUp className="w-2.5 h-2.5" /> {d.sold} vendidos</span>
                  <span>{d.total - d.sold} restantes</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(d.sold / d.total) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blis-red to-amber-500 rounded-full"
                  />
                </div>
              </div>

              {/* Precio */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-xs line-through">${d.originalPrice}</span>
                  <span className="text-white font-black text-xl ml-2">${d.salePrice}</span>
                </div>
                <button className="w-9 h-9 rounded-xl bg-blis-red/20 border border-blis-red/40 flex items-center justify-center hover:bg-blis-red transition-all group/cart">
                  <ShoppingCart className="w-4 h-4 text-blis-red group-hover/cart:text-white transition-colors" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 pb-4">
        {DEALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${active === i ? "w-6 bg-blis-red" : "w-1.5 bg-white/20"}`}
          />
        ))}
      </div>
    </section>
  );
}
