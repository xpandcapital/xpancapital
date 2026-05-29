"use client"

export const dynamic = 'force-dynamic'

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Header } from "@/components/sections/Header"
import { FooterSections } from "@/components/sections/Footer"
import { Building2, Copy, Phone, ArrowLeft, CheckCircle2, Clock, Zap } from "lucide-react"
import Link from "next/link"

export default function TransferGraciasPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Content />
    </Suspense>
  )
}

function Loading() {
  return (
    <main className="min-h-screen bg-[#050505]">
      <Header />
      <div className="max-w-lg mx-auto px-4 pt-40 pb-20">
        <div className="bg-sky-500/5 border border-sky-500/10 rounded-3xl p-8 animate-pulse">
          <div className="w-16 h-16 bg-white/5 rounded-2xl mx-auto mb-4" />
          <div className="h-8 w-48 bg-white/5 rounded mx-auto mb-2" />
          <div className="h-4 w-64 bg-white/5 rounded mx-auto" />
        </div>
      </div>
      <FooterSections />
    </main>
  )
}

function Content() {
  const searchParams = useSearchParams()
  const infoRaw = searchParams.get('info') || '{}'

  let info: { config?: any; country?: string; total?: number; metodo?: string } = {}
  try { info = JSON.parse(decodeURIComponent(infoRaw)) } catch {}

  const config = info.config || {}
  const country = info.country || 'PE'
  const total = info.total || 0
  const metodo = info.metodo || 'transfer'

  const countries = config?.countries || {}
  const countryData = countries[country] || Object.values(countries)[0] || {}
  const banks = countryData.banks || []
  const whatsapp = config?.whatsapp || ''
  const instructions = config?.instructions || ''

  const msg = encodeURIComponent(
    `Hola! Realicé un pago por transferencia:\n\n` +
    `💰 Monto: $${total.toFixed(2)}\n` +
    `🏦 País: ${countryData.label || country}\n` +
    `📧 Adjunto mi comprobante de pago.`
  )

  return (
    <main className="min-h-screen bg-[#050505]">
      <Header />

      <div className="max-w-lg mx-auto px-4 pt-32 pb-20">
        {/* Success header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="w-20 h-20 mx-auto mb-5 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.2)]"
          >
            <Clock className="w-10 h-10 text-amber-400" />
          </motion.div>

          <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
            ¡Pedido Recibido!
          </h1>
          <p className="text-gray-400">
            Tu orden está <span className="text-amber-400 font-bold">pendiente de pago</span>.
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Completa la transferencia para recibir acceso inmediato.
          </p>
        </motion.div>

        {/* Bank info card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 md:p-8 mb-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Datos Bancarios</h2>
              <p className="text-xs text-gray-500">
                {countryData.flag || '🏳️'} {countryData.label || 'Perú'}
              </p>
            </div>
          </div>

          {banks.length > 0 ? (
            <div className="space-y-3">
              {banks.map((bank: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="bg-black/30 border border-white/10 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-white">{bank.name}</p>
                    <span className="text-[10px] text-gray-500 font-bold">
                      {bank.currency === 'USD' ? 'USD' : 'PEN'}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {bank.account_number && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 text-xs">Cuenta</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-xs">{bank.account_number}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText((bank.account_number || '').replace(/[\s-]/g, ''))}
                            className="text-gray-500 hover:text-white transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                    {bank.cci && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 text-xs">CCI</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-xs">{bank.cci}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText((bank.cci || '').replace(/[\s-]/g, ''))}
                            className="text-gray-500 hover:text-white transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                    {bank.account_holder && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 text-xs">Titular</span>
                        <span className="text-white text-xs">{bank.account_holder}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic text-center py-4">
              No hay bancos configurados para este país.
            </p>
          )}

          {/* Amount */}
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-sm text-gray-400">Monto a transferir</span>
            <span className="text-xl font-black text-white">${total.toFixed(2)}</span>
          </div>
        </motion.div>

        {/* WhatsApp button */}
        {whatsapp && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <a
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${msg}`}
              target="_blank"
              className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-sm rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.25)]"
            >
              <Phone className="w-5 h-5" /> Enviar Comprobante por WhatsApp
            </a>
            {instructions && (
              <p className="text-[10px] text-gray-500 text-center mt-3">{instructions}</p>
            )}
          </motion.div>
        )}

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6"
        >
          <Link
            href="/miembros"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Zap className="w-4 h-4" /> Ir a Mis Productos
          </Link>
        </motion.div>
      </div>

      <FooterSections />
    </main>
  )
}
