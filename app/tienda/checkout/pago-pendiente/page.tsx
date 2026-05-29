"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Clock, ArrowLeft, Package, ShoppingBag, Building2, Wallet, Phone, Copy } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/sections/Header";
import { FooterSections } from "@/components/sections/Footer";
import { getSupabase } from "@/lib/supabase";

type PageState = "loading" | "pendiente" | "completado" | "error";

export default function PagoPendientePage() {
  return (
    <Suspense fallback={<PendienteLoading />}>
      <PagoPendienteContent />
    </Suspense>
  );
}

function PendienteLoading() {
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

function PagoPendienteContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [state, setState] = useState<PageState>(orderId ? "loading" : "error");
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [metodoPago, setMetodoPago] = useState("");
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!orderId) return;

    const supabase = getSupabase();

    const loadInitial = async () => {
      const { data: orden } = await supabase
        .from("compras")
        .select("estado, metadata, metodo_pago")
        .eq("id", orderId)
        .maybeSingle();

      if (!orden) {
        setState("error");
        return;
      }

      const meta = orden.metadata || {};
      setMetodoPago(orden.metodo_pago || "");
      const pd = meta.payment_details || meta;
      if (pd && meta.whatsapp_url) pd.whatsapp_url = meta.whatsapp_url;
      setPaymentDetails(pd);

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
      .channel(`order-pending-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "compras",
          filter: `id=eq.${orderId}`,
        },
        (payload: any) => {
          if (payload.new.estado === "completado") setState("completado");
          if (payload.new.estado === "cancelado") setState("error");
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const getStep1Title = () => {
    switch (metodoPago) {
      case "whatsapp": return "Completa el pago por WhatsApp";
      case "transfer": return "Realiza la transferencia bancaria";
      case "crypto_manual": return "Envía el pago en criptomonedas";
      default: return "Completa tu pago";
    }
  };

  const getStep1Desc = () => {
    switch (metodoPago) {
      case "whatsapp": return `Coordina el pago con tu asesor ${paymentDetails?.asesor_nombre || ""}.`;
      case "transfer": return "Transfiere el monto a la cuenta bancaria indicada.";
      case "crypto_manual": return "Envía el monto a la wallet de tu preferencia.";
      default: return "";
    }
  };

  const openWhatsAppSafe = (rawUrl: string) => {
    const sep = '?text='
    const idx = rawUrl.indexOf(sep)
    if (idx === -1) { window.open(rawUrl, '_blank'); return }
    const base = rawUrl.substring(0, idx + sep.length)
    const text = rawUrl.substring(idx + sep.length)
    const decoded = decodeURIComponent(text)
    const safe = base + encodeURIComponent(decoded)
    window.open(safe, '_blank')
  }

  const getStep1Action = () => {
    switch (metodoPago) {
      case "whatsapp":
        return { label: "Abrir WhatsApp", icon: "whatsapp", onClick: () => { const url = paymentDetails?.whatsapp_url; if (url) openWhatsAppSafe(url); } };
      case "transfer":
      case "crypto_manual":
        return { label: "Abrir WhatsApp", icon: "whatsapp", onClick: () => { const url = paymentDetails?.whatsapp_url; if (url) openWhatsAppSafe(url); } };
      default: return null;
    }
  };

  const step1Action = getStep1Action();

  const steps = [
    {
      num: 1,
      title: getStep1Title(),
      desc: getStep1Desc(),
      done: state !== "loading",
    },
    {
      num: 2,
      title: "Confirmación del administrador",
      desc: "Revisaremos tu pago y activaremos tu acceso.",
      done: state === "completado",
    },
    {
      num: 3,
      title: "Acceso habilitado",
      desc: "Recibirás un email cuando todo esté listo.",
      done: state === "completado",
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
            <Link href="/tienda" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-colors">
              <ArrowLeft className="w-4 h-4" /> Volver a la Tienda
            </Link>
          </div>
        )}

        {(state === "pendiente" || state === "completado") && (
          <div className="space-y-10">
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
                  <div className="w-20 h-20 mx-auto bg-amber-500/10 border border-amber-500/30 rounded-3xl flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-amber-400" />
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
                  className={`relative flex flex-col p-5 rounded-2xl border transition-all ${
                    step.done ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/5 border-white/5"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      step.done ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-gray-500"
                    }`}>
                      {step.done ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${step.done ? "text-emerald-400" : "text-gray-500"}`}>
                          Paso {step.num}
                        </span>
                        {state === "pendiente" && <span className="text-[10px] text-amber-400 font-bold">⏳ Pendiente</span>}
                      </div>
                      <h3 className="text-sm font-black text-white uppercase tracking-tight">{step.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">{step.desc}</p>

                      {/* Payment method details */}
                      {step.num === 1 && state === "pendiente" && (
                        <div className="mt-4 space-y-3">
                          {/* WhatsApp: show asesor */}
                          {metodoPago === "whatsapp" && paymentDetails?.asesor_foto && (
                            <div className="flex items-center gap-3">
                              <img src={paymentDetails.asesor_foto} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                              <div>
                                <p className="text-xs font-bold text-white">{paymentDetails.asesor_nombre || "Asesor"}</p>
                                <p className="text-[10px] text-gray-500">Blis Expert Team</p>
                              </div>
                            </div>
                          )}

                          {/* Transfer: show bank details */}
                          {metodoPago === "transfer" && (() => {
                            const c = paymentDetails?.countries || {};
                            const k = paymentDetails?.country || Object.keys(c)[0] || "";
                            const bks = c[k]?.banks || [];
                            return bks.length > 0 ? (
                              <div className="space-y-2">
                                <p className="text-[10px] text-gray-500 font-bold uppercase">{c[k]?.flag || ""} {c[k]?.label || k}</p>
                                {bks.map((b: any, bi: number) => (
                                  <div key={bi} className="bg-black/30 border border-white/10 rounded-xl p-3 text-xs space-y-1">
                                    <p className="text-white font-bold">{b.name}</p>
                                    <p className="text-gray-400">Cuenta: <span className="text-white font-mono">{b.account_number}</span></p>
                                    <p className="text-gray-400">Titular: <span className="text-white">{b.account_holder}</span></p>
                                    {b.cci && <p className="text-gray-400">CCI: <span className="text-white font-mono">{b.cci}</span></p>}
                                  </div>
                                ))}
                              </div>
                            ) : <p className="text-xs text-gray-600 italic">Datos bancarios no disponibles</p>;
                          })()}

                          {/* Crypto: show wallets */}
                          {metodoPago === "crypto_manual" && (() => {
                            const wls = paymentDetails?.wallets || [];
                            return wls.length > 0 ? (
                              <div className="space-y-2">
                                {wls.map((w: any, wi: number) => (
                                  <div key={wi} className="bg-black/30 border border-white/10 rounded-xl p-3">
                                    <p className="text-xs font-bold text-white mb-1">{w.label || w.network}</p>
                                    {w.address && (
                                      <div className="flex items-center gap-2">
                                        <p className="text-[10px] font-mono text-gray-400 break-all flex-1">{w.address}</p>
                                        <button onClick={() => navigator.clipboard.writeText(w.address)} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors">
                                          <Copy className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                    {w.qr_url && <img src={w.qr_url} alt="QR" className="w-24 h-24 mt-2 rounded-xl object-cover border border-white/10" />}
                                  </div>
                                ))}
                              </div>
                            ) : <p className="text-xs text-gray-600 italic">Wallets no disponibles</p>;
                          })()}
                        </div>
                      )}

                      {/* Step 1 action buttons */}
                      {step.num === 1 && state === "pendiente" && step1Action && (
                        <div className="mt-3">
                          <button onClick={step1Action.onClick} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-300 hover:text-white transition-all">
                            {step1Action.icon === "whatsapp" && <img src="/icons/brands/whatsapp.svg" className="w-4 h-4" alt="" style={{ filter: 'brightness(0) invert(1)' }} />}
                            {step1Action.icon === "copy" && <Copy className="w-4 h-4" />}
                            {step1Action.label}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              {state === "completado" ? (
                <Link href="/miembros" className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase rounded-2xl transition-all">
                  <Package className="w-5 h-5" /> Ir a Mis Productos
                </Link>
              ) : (
                step1Action && (
                  <button onClick={step1Action.onClick} className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-black uppercase rounded-2xl transition-all">
                    {step1Action.icon === "whatsapp" && <img src="/icons/brands/whatsapp.svg" className="w-5 h-5" alt="" style={{ filter: 'brightness(0) invert(1)' }} />}
                    {step1Action.icon === "copy" && <Copy className="w-5 h-5" />}
                    {step1Action.label}
                  </button>
                )
              )}

              <Link href="/tienda" className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold uppercase rounded-2xl transition-all">
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
