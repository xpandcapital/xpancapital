"use client"

export const dynamic = 'force-dynamic';

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Header } from "@/components/sections/Header"
import { XpandFooter } from "@/components/sections/xpand/XpandFooter"
import { MessageSquare, Send, CheckCircle2, Loader2, Shield, AlertTriangle, FileText, Star } from "lucide-react"

type ReclamoTipo = "reclamo" | "queja" | "sugerencia"

export default function ReclamacionesPage() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    tipo: "reclamo" as ReclamoTipo,
    producto: "",
    descripcion: "",
  })
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.email.trim() || !form.descripcion.trim()) {
      setError("Por favor completa los campos requeridos (*)")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Email inválido")
      return
    }

    setStatus("sending")
    setError("")

    // Simulación de envío (reemplazar con API cuando esté lista)
    await new Promise((r) => setTimeout(r, 1500))
    setStatus("sent")
  }

  const inputCls =
    "w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 placeholder-gray-600 transition-all"
  const labelCls =
    "text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block"

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Header />

      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-32 pb-20">
        {status === "sent" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 space-y-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-28 h-28 mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.2)]"
            >
              <CheckCircle2 className="w-14 h-14 text-emerald-400" />
            </motion.div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Reclamo Enviado</h2>
            <p className="text-gray-400">
              Hemos recibido tu {form.tipo}. Te contactaremos en un plazo máximo de 15 días hábiles.
            </p>
            <button
              onClick={() => {
                setStatus("idle")
                setForm({ nombre: "", email: "", tipo: "reclamo", producto: "", descripcion: "" })
              }}
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all"
            >
              Enviar otro
            </button>
          </motion.div>
        ) : (
          <>
            {/* Hero */}
            <div className="text-center mb-16 space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-24 h-24 mx-auto mb-6 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] flex items-center justify-center"
              >
                <MessageSquare className="w-12 h-12 text-amber-400" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                Libro de <span className="text-amber-400">Reclamaciones</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-lg mx-auto">
                Conforme a la normativa de protección al consumidor de Perú y Ecuador. Respondemos en un máximo de 15 días hábiles.
              </p>
            </div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6"
            >
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Tipo */}
              <div>
                <label className={labelCls}>Tipo *</label>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { id: "reclamo", icon: AlertTriangle, label: "Reclamo", desc: "Producto o servicio" },
                    { id: "queja", icon: Star, label: "Queja", desc: "Atención recibida" },
                    { id: "sugerencia", icon: FileText, label: "Sugerencia", desc: "Mejora o idea" },
                  ] as const).map(({ id, icon: Icon, label, desc }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, tipo: id }))}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        form.tipo === id
                          ? "bg-amber-500/10 border-amber-500/30"
                          : "bg-white/[0.02] border-white/8 hover:border-white/20"
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${form.tipo === id ? "text-amber-400" : "text-gray-600"}`} />
                      <p className="text-xs font-black text-white uppercase">{label}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nombre completo *</label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                    className={inputCls}
                    placeholder="Juan Pérez"
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className={inputCls}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Producto o servicio (opcional)</label>
                <input
                  type="text"
                  value={form.producto}
                  onChange={(e) => setForm((f) => ({ ...f, producto: e.target.value }))}
                  className={inputCls}
                  placeholder="Nombre del producto o servicio"
                />
              </div>

              <div>
                <label className={labelCls}>Descripción detallada *</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  rows={6}
                  className={`${inputCls} resize-none`}
                  placeholder="Describe tu reclamo, queja o sugerencia con el mayor detalle posible..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full py-5 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 text-sm shadow-[0_0_30px_rgba(217,119,6,0.2)]"
              >
                {status === "sending" ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
                ) : (
                  <><Send className="w-5 h-5" /> Enviar {form.tipo}</>
                )}
              </button>

              <p className="text-[11px] text-gray-600 text-center">
                Tus datos serán tratados conforme a nuestra{" "}
                <a href="/legal/privacidad" className="text-blis-red hover:underline font-bold">
                  Política de Privacidad
                </a>
                . Responderemos en un plazo máximo de 15 días hábiles conforme a la normativa de protección al consumidor.
              </p>
            </motion.form>
          </>
        )}
      </div>

      <XpandFooter />
    </main>
  )
}
