"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Carlos Mendoza",
    role: "Agente Inmobiliario · México",
    avatar: "CM",
    rating: 5,
    text: "El Kit Legal de Agentes me ahorró meses de trabajo. Los contratos son impecables y mis clientes confían más en mí desde que los uso.",
    product: "Kit Legal de Agentes",
    color: "from-amber-500/10",
  },
  {
    name: "Andrea Pereira",
    role: "Desarrolladora · Colombia",
    avatar: "AP",
    rating: 5,
    text: "La Masterclass de Inteligencia Competitiva me dio herramientas que no encontré en ningún otro lado. Cerré 3 proyectos en el primer mes.",
    product: "Masterclass Inversiones",
    color: "from-blis-red/10",
  },
  {
    name: "Felipe Ruiz",
    role: "Broker Senior · Perú",
    avatar: "FR",
    rating: 5,
    text: "Los Ebooks de BLIS son los más completos del mercado. Lenguaje claro, casos reales y estrategias que funcionan desde el día uno.",
    product: "Ebook Técnicas de Cierre",
    color: "from-sky-500/10",
  },
  {
    name: "Mariana López",
    role: "Agente Independiente · Chile",
    avatar: "ML",
    rating: 5,
    text: "El Pack de Redes Sociales transformó mi presencia digital. Pasé de 200 a 4,800 seguidores en 3 meses con el contenido incluido.",
    product: "Pack Redes Sociales",
    color: "from-emerald-500/10",
  },
  {
    name: "Roberto Torres",
    role: "Inversionista · Argentina",
    avatar: "RT",
    rating: 5,
    text: "La Mentoría Elite vale cada centavo. Mi mentor me ayudó a estructurar una operación de $2M que parecía imposible. Resultados reales.",
    product: "Mentoría Elite",
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
