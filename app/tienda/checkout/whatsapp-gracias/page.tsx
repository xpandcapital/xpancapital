"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Clock, ArrowLeft, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/sections/Header";
import { FooterSections } from "@/components/sections/Footer";
import { getSupabase } from "@/lib/supabase";

type PageState = "loading" | "pendiente" | "completado" | "error";

export default function WhatsAppGraciasPage() {
  return (
    <Suspense fallback={<GraciasLoading />}>
      <WhatsAppGraciasContent />
    </Suspense>
  );
}

function GraciasLoading() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Header />
      <div className="max-w-2xl mx-auto px-4 pt-40 pb-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blis-red mx-auto" />
      </div>
      <FooterSections />
    </main>
  );
}

function WhatsAppGraciasContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [state, setState] = useState<PageState>(orderId ? "loading" : "error");
  const [metadata, setMetadata] = useState<any>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!orderId) return;

    const supabase = getSupabase();

    const loadInitial = async () => {
      const { data: orden } = await supabase
        .from("compras")
        .select("estado, metadata")
        .eq("id", orderId)
        .maybeSingle();

      if (!orden) {
        setState("error");
        return;
      }

      setMetadata(orden.metadata || {});

      if (orden.estado === "completado") {
        setState("completado");
        return;
      }

      if (orden.estado === "cancelado") {
        setState("error");
        return;
      }

      setState("pendiente");
    };

    loadInitial();

    const channel = supabase
      .channel(`order-wa-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "compras",
          filter: `id=eq.${orderId}`,
        },
        (payload: any) => {
          if (payload.new.estado === "completado") {
            setState("completado");
          }
          if (payload.new.estado === "cancelado") {
            setState("error");
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const handleWhatsApp = () => {
    const url = metadata?.whatsapp_url;
    if (!url) return;
    const sep = '?text='
    const idx = url.indexOf(sep)
    if (idx === -1) { window.open(url, '_blank'); return }
    const base = url.substring(0, idx + sep.length)
    const text = url.substring(idx + sep.length)
    const decoded = decodeURIComponent(text)
    window.open(base + encodeURIComponent(decoded), '_blank')
  };

  const asesorNombre = metadata?.asesor_nombre || "Blis Expert Team";
  const asesorFoto = metadata?.asesor_foto || null;

  const steps = [
    {
      num: 1,
      title: "Completa el pago por WhatsApp",
      desc: `Habla con tu asesor ${asesorNombre} para coordinar el pago.`,
      done: state !== "loading",
      icon: (props: { className?: string }) => <img src="/icons/brands/whatsapp.svg" className={props.className} alt="" />,
    },
    {
      num: 2,
      title: "Confirmación del administrador",
      desc: "Revisaremos tu pago y activaremos tu acceso.",
      done: state === "completado",
      icon: Clock,
    },
    {
      num: 3,
      title: "Acceso habilitado",
      desc: "Recibirás un email cuando todo esté listo.",
      done: state === "completado",
      icon: CheckCircle2,
    },
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Header />
      <div className="max-w-2xl mx-auto px-4 pt-40 pb-20">
        {state === "loading" && (
          <div className="text-center space-y-6">
            <Loader2 className="w-12 h-12 animate-spin text-blis-red mx-auto" />
            <p className="text-gray-400">Cargando tu pedido...</p>
          </div>
        )}

        {state === "error" && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-red-500/10 border border-red-500/30 rounded-3xl flex items-center justify-center">
              <Package className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-3xl font-black uppercase">Pedido no encontrado</h1>
            <p className="text-gray-400">No pudimos encontrar tu pedido o fue cancelado.</p>
            <Link
              href="/tienda"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a la Tienda
            </Link>
          </div>
        )}

        {(state === "pendiente" || state === "completado") && (
          <div className="space-y-10">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              {state === "completado" ? (
                <>
                  <div className="w-20 h-20 mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black uppercase">Pago Confirmado</h1>
                  <p className="text-gray-400">Tu acceso ha sido habilitado.</p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto bg-green-500/10 border border-green-500/30 rounded-3xl flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-green-400" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black uppercase">Pedido Registrado</h1>
                  <p className="text-gray-400">
                    Tu orden <span className="text-white font-bold">#{orderId?.substring(0, 8)}</span> está pendiente de pago.
                  </p>
                </>
              )}
            </motion.div>

            {/* Steps */}
            <div className="space-y-4">
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 + 0.2 }}
                  className={`relative flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                    step.done
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-white/5 border-white/5"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      step.done
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-white/10 text-gray-500"
                    }`}
                  >
                    {step.done ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          step.done ? "text-emerald-400" : "text-gray-500"
                        }`}
                      >
                        Paso {step.num}
                      </span>
                      {!step.done && (
                        <span className="text-[10px] text-amber-400 font-bold">⏳ Pendiente</span>
                      )}
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{step.desc}</p>

                    {step.num === 1 && (
                      <div className="mt-3 flex items-center gap-3">
                        {asesorFoto && (
                          <img
                            src={asesorFoto}
                            alt={asesorNombre}
                            className="w-10 h-10 rounded-full object-cover border border-white/10"
                          />
                        )}
                        <div>
                          <p className="text-xs font-bold text-white">{asesorNombre}</p>
                          <p className="text-[10px] text-gray-500">Blis Expert Team</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {!step.done && i === 0 && (
                    <div className="absolute -bottom-1 left-5 w-px h-4 bg-white/10" />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              {state === "completado" ? (
                <Link
                  href="/miembros"
                  className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase rounded-2xl transition-all"
                >
                  <Package className="w-5 h-5" /> Ir a Mis Productos
                </Link>
              ) : (
                <button
                  onClick={handleWhatsApp}
                  className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-black uppercase rounded-2xl transition-all"
                >
                  <img src="/icons/brands/whatsapp.svg" className="w-5 h-5" alt="" /> Abrir WhatsApp
                </button>
              )}

              <Link
                href="/tienda"
                className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold uppercase rounded-2xl transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Seguir Comprando
              </Link>
            </motion.div>
          </div>
        )}
      </div>
      <FooterSections />
    </main>
  );
}
