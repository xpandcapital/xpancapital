"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Carlos Mendoza",
    role: "Trader · Colombia",
    avatar: "CM",
    rating: 5,
    text: "El Plan Anual de Xpand Capital cambió mi vida financiera. Pasé de no saber nada de trading a operar con confianza en 3 meses.",
    product: "Plan Anual - Academia Xpand",
    color: "from-amber-500/10",
  },
  {
    name: "Andrea Pereira",
    role: "Trader · México",
    avatar: "AP",
    rating: 5,
    text: "La Academia de Trading me dio herramientas que no encontré en ningún otro lado. Empecé el plan trimestral y al mes ya vi resultados reales.",
    product: "Plan Trimestral - Academia Xpand",
    color: "from-blis-red/10",
  },
  {
    name: "Felipe Ruiz",
    role: "Trader Senior · Perú",
    avatar: "FR",
    rating: 5,
    text: "Los cursos de Xpand son los más completos del mercado. Análisis técnico explicado de forma clara con casos reales que funcionan.",
    product: "Curso Análisis Técnico",
    color: "from-sky-500/10",
  },
  {
    name: "Mariana López",
    role: "Trader · Chile",
    avatar: "ML",
    rating: 5,
    text: "La comunidad de traders de Xpand es increíble. Aprendo todos los días de las operaciones que comparten y del feedback de los mentores.",
    product: "Comunidad Xpand",
    color: "from-emerald-500/10",
  },
  {
    name: "Roberto Torres",
    role: "Inversionista · Argentina",
    avatar: "RT",
    rating: 5,
    text: "La Mentoría 1:1 vale cada centavo. Mi mentor me ayudó a desarrollar un plan de trading personalizado. Resultados reales desde el primer mes.",
    product: "Mentoría 1:1 Xpand",
    color: "from-purple-500/10",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = (dir: number) => {
    setDirection(dir);
    setCurrent(c => (c + dir + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  useEffect(() => {
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, []);

  const t = TESTIMONIALS[current];

  return (
    <section className="w-full rounded-2xl border border-white/5 bg-[#050608] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Clientes Reales</p>
          <h3 className="text-sm font-black text-white uppercase">Lo Que Dicen de Nosotros</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => go(-1)} className="w-8 h-8 rounded-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => go(1)} className="w-8 h-8 rounded-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Testimonial */}
      <div className="relative overflow-hidden min-h-[200px] p-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={`absolute inset-0 p-6 bg-gradient-to-br ${t.color} to-transparent`}
          >
            <Quote className="w-8 h-8 text-white/5 mb-4" />
            <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">
              "{t.text}"
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blis-red to-zinc-800 border border-white/10 flex items-center justify-center font-black text-xs text-white flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-white font-black text-sm">{t.name}</p>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
              <div className="text-right">
                <Stars count={t.rating} />
                <p className="text-[9px] text-gray-600 mt-1 uppercase tracking-widest">{t.product}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 pb-4">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
            className={`h-1 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-blis-red" : "w-1 bg-white/20"}`}
          />
        ))}
      </div>
    </section>
  );
}

