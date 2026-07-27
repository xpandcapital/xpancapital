"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2, Loader2, XCircle, ArrowLeft, Clock,
  ExternalLink, Zap, Gift
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/sections/Header";
import { XpandFooter } from "@/components/sections/xpand/XpandFooter";
import { getSupabase } from "@/lib/supabase";

type PaymentState = "loading" | "paid" | "pending" | "failed";

export default function CheckoutStatusPage() {
  return (
    <Suspense fallback={<CheckoutStatusLoading />}>
      <CheckoutStatusContent />
    </Suspense>
  );
}

function CheckoutStatusLoading() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Header />
      <div className="max-w-2xl mx-auto px-4 pt-40 pb-20 text-center">
        <div className="space-y-8">
          <div className="w-28 h-28 mx-auto bg-amber-500/10 border border-amber-500/30 rounded-3xl flex items-center justify-center">
            <Loader2 className="w-14 h-14 text-amber-400 animate-spin" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Cargando...
            </h1>
          </div>
        </div>
      </div>
      <XpandFooter />
    </main>
  );
}

function CheckoutStatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const izipaySuccess = searchParams.get("izipay_success");
  const wompiSuccess = searchParams.get("wompi_success");
  const totalIzipay = searchParams.get("total");
  const [state, setState] = useState<PaymentState>(izipaySuccess === "1" || wompiSuccess === "1" ? "paid" : "loading");
  const [errorMsg, setErrorMsg] = useState("");

  // Si estamos dentro de un iframe (Wompi), enviar postMessage al padre y NO mostrar UI
  useEffect(() => {
    if (window !== window.parent && wompiSuccess === "1") {
      parent.postMessage({ type: 'WOMPI_PAYMENT_DONE', order_id: orderId }, window.location.origin)
    }
  }, [wompiSuccess, orderId])

  const isIframe = typeof window !== 'undefined' && window !== window.parent && wompiSuccess === "1"

  useEffect(() => {
    if (izipaySuccess === "1" || wompiSuccess === "1") return;

    if (!orderId) {
      setState("failed");
      setErrorMsg("No se encontró la orden.");
      return;
    }

    let attempts = 0;
    const maxAttempts = 30;

    const checkStatus = async () => {
      try {
        const supabase = getSupabase();
        const { data: orden } = await supabase
          .from("compras")
          .select("estado, metodo_pago, metadata")
          .eq("id", orderId)
          .maybeSingle();

        if (!orden) {
          setState("failed");
          setErrorMsg("Orden no encontrada.");
          return;
        }

        if (orden.estado === "completado") {
          setState("paid");
          return;
        }

        if (orden.estado === "cancelado") {
          setState("failed");
          setErrorMsg("El pago no fue completado o fue cancelado.");
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          setState("pending");
          return;
        }

        setTimeout(checkStatus, 3000);
      } catch {
        attempts++;
        if (attempts >= maxAttempts) {
          setState("pending");
        } else {
          setTimeout(checkStatus, 3000);
        }
      }
    };

    checkStatus();
  }, [orderId]);

  // Si está en iframe y pago exitoso, mostrar mensaje breve mientras se redirige
  if (isIframe) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <p className="text-white font-black text-lg">¡Pago Exitoso!</p>
          <p className="text-gray-500 text-sm mt-2">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-40 pb-20 text-center">
      {/* Loading */}
      {state === "loading" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <div className="w-28 h-28 mx-auto bg-amber-500/10 border border-amber-500/30 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.2)]">
            <Loader2 className="w-14 h-14 text-amber-400 animate-spin" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Verificando Pago
            </h1>
            <p className="text-gray-400 text-lg">
              Estamos confirmando tu pago con Cryptomus...
            </p>
            <p className="text-gray-600 text-sm">
              Esto puede tomar unos segundos. No cierres esta página.
            </p>
          </div>
          <div className="flex justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-amber-500"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Paid */}
      {state === "paid" && (
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="space-y-8"
        >
          <div className="w-28 h-28 mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-14 h-14 text-emerald-400" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
              ¡Pago Exitoso!
            </h1>
            <p className="text-gray-400 text-lg">
              {izipaySuccess === "1"
                ? `Tu pago de $${totalIzipay} USD fue procesado por Izipay.`
                : "Tu pago fue procesado por Cryptomus. Recibirás un email con los detalles."}
            </p>
            <p className="text-emerald-500/60 text-sm font-bold">
              {izipaySuccess === "1"
                ? "Pago confirmado · Recibirás acceso inmediato"
                : "Pago convertido a USDT · Recibirás acceso inmediato"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 pt-4"
          >
            <Link
              href="/miembros"
              className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            >
              <Zap className="w-5 h-5" /> Acceder a Mis Productos
            </Link>
            <Link
              href="/tienda"
              className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold uppercase rounded-2xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Seguir Comprando
            </Link>
          </motion.div>
        </motion.div>
      )}

      {/* Pending (timeout) */}
      {state === "pending" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <div className="w-28 h-28 mx-auto bg-sky-500/10 border border-sky-500/30 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(14,165,233,0.2)]">
            <Clock className="w-14 h-14 text-sky-400" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Procesando Pago
            </h1>
            <p className="text-gray-400 text-lg">
              Tu pago está siendo procesado por Cryptomus.
            </p>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Si ya realizaste el pago, recibirás un email de confirmación en breve. También puedes revisar el estado en tu cuenta.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3 pt-4"
          >
            <Link
              href="/miembros"
              className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-sky-600 hover:bg-sky-500 text-white font-black uppercase rounded-2xl transition-all"
            >
              <ExternalLink className="w-4 h-4" /> Ir a Mi Cuenta
            </Link>
            <Link
              href="/tienda"
              className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold uppercase rounded-2xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a la Tienda
            </Link>
          </motion.div>
        </motion.div>
      )}

      {/* Failed */}
      {state === "failed" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <div className="w-28 h-28 mx-auto bg-red-500/10 border border-red-500/30 rounded-3xl flex items-center justify-center">
            <XCircle className="w-14 h-14 text-red-400" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Pago No Completado
            </h1>
            <p className="text-gray-400 text-lg">
              {errorMsg || "El pago no pudo ser procesado."}
            </p>
            <p className="text-gray-500 text-sm">
              Puedes intentar nuevamente o elegir otro método de pago.
            </p>
          </div>
          <div className="space-y-3 pt-4">
            <Link
              href="/tienda/checkout"
              className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase rounded-2xl transition-all"
            >
              Intentar de Nuevo
            </Link>
            <Link
              href="/tienda"
              className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold uppercase rounded-2xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a la Tienda
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
