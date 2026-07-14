"use client"

import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Suspense, useState } from "react"
import { ArrowLeft, Check, Zap, Crown, ArrowRight, Loader2, User, Mail, Phone } from "lucide-react"
import Link from "next/link"

const plans = {
  trimestral: { name: "Plan Trimestral", icon: Zap, price: "115", period: "cada 4 meses", total: "$345 al año" },
  anual: { name: "Plan Anual", icon: Crown, price: "300", period: "pago único", total: "$300 al año" },
}

function PlanCheckoutInner() {
  const params = useSearchParams()
  const plan = params.get("plan") || "anual"
  const data = plans[plan as keyof typeof plans] || plans.anual

  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [telefono, setTelefono] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre || !email) { setError("Completa todos los campos requeridos"); return }
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/planes/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, nombre, email, telefono }),
      })
      const result = await res.json()
      if (result.success) {
        window.location.href = `/tienda/checkout/izipay?form_token=${result.formToken}&public_key=${result.publicKey}&order_id=${result.ordenId}&total=${result.total}`
      } else {
        setError(result.error || "Error al procesar el pago")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link href="/#pricing" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-8 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a planes
        </Link>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <data.icon className="w-6 h-6 text-[#d5c108]" />
            <h1 className="text-xl font-bold">{data.name}</h1>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-[#d5c108]">${data.price}</span>
              <span className="text-white/30 text-sm">/{data.period}</span>
            </div>
            <p className="text-white/20 text-xs mt-1">{data.total}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-white/40 text-xs mb-1.5"><User className="w-3.5 h-3.5" /> Nombre completo</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#d5c108]/50 focus:outline-none transition-colors" placeholder="Tu nombre" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-white/40 text-xs mb-1.5"><Mail className="w-3.5 h-3.5" /> Correo electrónico</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#d5c108]/50 focus:outline-none transition-colors" placeholder="tu@email.com" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-white/40 text-xs mb-1.5"><Phone className="w-3.5 h-3.5" /> Teléfono (opcional)</label>
              <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#d5c108]/50 focus:outline-none transition-colors" placeholder="+51 999 888 777" />
            </div>

            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

            <button type="submit" disabled={loading}
              className="flex items-center justify-center gap-2 w-full bg-[#d5c108] text-black font-bold py-4 rounded-xl hover:bg-[#e5d100] disabled:opacity-50 transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Ir a pagar <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
            {["Acceso completo a cursos", "Señales de trading diarias", "Mentorías en vivo", "Comunidad VIP"].map(f => (
              <div key={f} className="flex items-center gap-2 text-xs text-white/40">
                <Check className="w-3.5 h-3.5 text-[#d5c108] shrink-0" /> {f}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function PlanCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
      <PlanCheckoutInner />
    </Suspense>
  )
}
