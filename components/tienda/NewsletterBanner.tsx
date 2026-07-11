"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Zap, CheckCircle2, ArrowRight, Gift } from "lucide-react";

export function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setStatus("loading");
    // Simula envío — aquí conectarías con tu API real
    await new Promise(r => setTimeout(r, 1200));
    setStatus("success");
  };

  return (
    <section className="w-full rounded-2xl border border-blis-red/20 bg-gradient-to-br from-blis-red/10 via-[#050608] to-black overflow-hidden relative">
      {/* Orbe decorativo */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-blis-red/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
        {/* Icono y texto */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-blis-red/10 border border-blis-red/20 px-3 py-1.5 rounded-full mb-4">
            <Gift className="w-3.5 h-3.5 text-blis-red" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blis-red">Oferta de bienvenida</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white uppercase leading-tight mb-2">
            Recibe <span className="text-blis-red">10% OFF</span> en tu primera compra
          </h3>
          <p className="text-gray-400 text-sm max-w-md">
            Suscríbete y recibe ofertas exclusivas, análisis del mercado inmobiliario y acceso anticipado a nuevos productos.
          </p>
          <div className="flex items-center gap-4 mt-4 justify-center md:justify-start text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Sin spam</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Cancela cuando quieras</span>
          </div>
        </div>

        {/* Formulario */}
        <div className="w-full md:w-auto flex-shrink-0 md:min-w-[360px]">
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 py-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <p className="text-white font-black text-base">¡Suscripción confirmada!</p>
                <p className="text-gray-400 text-sm text-center">Revisa tu email — tu cupón de 10% OFF está en camino.</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-3"
              >
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-white placeholder-gray-500 text-sm outline-none focus:border-blis-red/50 focus:ring-1 focus:ring-blis-red/20 transition-all"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={status === "loading"}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-4 bg-blis-red hover:bg-red-700 disabled:opacity-60 text-white font-black uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(213,193,8,0.3)]"
                >
                  {status === "loading" ? (
                    <span className="flex items-center gap-2">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
                        <Zap className="w-4 h-4" />
                      </motion.div>
                      Procesando...
                    </span>
                  ) : (
                    <>
                      Quiero mi 10% OFF <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
                <p className="text-[10px] text-gray-600 text-center">
                  Al suscribirte aceptas recibir comunicaciones de BLIS Corp. Puedes darte de baja en cualquier momento.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

