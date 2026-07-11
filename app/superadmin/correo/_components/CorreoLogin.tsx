'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Server, CheckCircle } from 'lucide-react'
import { useCorreoCuenta } from '../_hooks/useCorreoCuenta'

interface Props {
  onConectado: (cuenta: any) => void
}

export function CorreoLogin({ onConectado }: Props) {
  const { conectarCuenta, loading, error } = useCorreoCuenta()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombreMostrado, setNombreMostrado] = useState('')
  const [paso, setPaso] = useState<'form' | 'connecting' | 'success'>('form')
  const [dominio, setDominio] = useState('')

  const dominioDetectado = email.includes('@') ? email.split('@')[1] : ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setPaso('connecting')
    try {
      const result = await conectarCuenta(email, password, nombreMostrado || undefined)
      setDominio(result.dominio)
      setPaso('success')
      setTimeout(() => onConectado(result), 800)
    } catch {
      setPaso('form')
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-blis-red/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              {paso === 'success' ? (
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              ) : (
                <Mail className="w-8 h-8 text-blis-red" />
              )}
            </motion.div>
            <h2 className="text-xl font-bold text-white">
              {paso === 'success' ? '¡Conectado!' : 'Correo Corporativo'}
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              {paso === 'success'
                ? `Conectado a @${dominio}`
                : 'Ingresa con tu cuenta de correo corporativa'}
            </p>
          </div>

          {paso !== 'success' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu-nombre@xpancapital.org"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blis-red/50 transition-all"
                    autoFocus
                    disabled={loading}
                  />
                </div>
                {dominioDetectado && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
                    <Server className="w-3 h-3" />
                    <span>Dominio: @{dominioDetectado}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                  Nombre para mostrar (opcional)
                </label>
                <input
                  type="text"
                  value={nombreMostrado}
                  onChange={(e) => setNombreMostrado(e.target.value)}
                  placeholder="Central Xpand Capital"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blis-red/50 transition-all"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña de tu correo"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blis-red/50 transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-start gap-2 p-3 rounded-xl bg-blis-red/10 border border-blis-red/20"
                >
                  <AlertCircle className="w-4 h-4 text-blis-red mt-0.5 shrink-0" />
                  <p className="text-xs text-red-300">{error}</p>
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading || !email || !password}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 rounded-xl bg-blis-red text-white font-semibold text-sm
                  disabled:opacity-40 disabled:cursor-not-allowed
                  hover:bg-blis-red-neon transition-all duration-300
                  flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verificando credenciales...
                  </>
                ) : (
                  <>
                    Iniciar Sesión
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          Tus credenciales se cifran con AES-256 antes de almacenarse
        </p>
      </motion.div>
    </div>
  )
}

