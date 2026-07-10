"use client"

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useRef } from 'react'
import { ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'
import { getDefaultRouteForRole, ROLE_CONFIG, type UserRole } from '@/lib/auth/permissions'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading, loginWithEmail, resetPassword } = useAuth()
  const { defaultRoute, loading: permLoading } = usePermissions()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSending, setForgotSending] = useState(false)
  const [forgotMessage, setForgotMessage] = useState<string | null>(null)
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileSolved, setTurnstileSolved] = useState(false)
  const turnstileContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/admin/seguridad').then(r => r.json()).then(d => {
      if (d?.data?.bot_protection?.habilitado) {
        const key = d.data.bot_protection.site_key
        if (key) {
          setTurnstileSiteKey(key)
          if (!document.querySelector('script[src*="turnstile"]')) {
            const script = document.createElement('script')
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
            script.async = true
            script.defer = true
            document.head.appendChild(script)
          }
        }
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!turnstileSiteKey || !turnstileContainerRef.current) return
    const el = turnstileContainerRef.current
    if (el.hasAttribute('data-rendered')) return
    let attempts = 0
    const tryRender = () => {
      if (window.turnstile) {
        window.turnstile.render(el, {
          sitekey: turnstileSiteKey,
          theme: 'dark',
          language: 'es',
          size: 'normal',
          appearance: 'always',
          callback: (token: string) => {
            setTurnstileToken(token)
            setTurnstileSolved(true)
          }
        })
        el.setAttribute('data-rendered', '1')
      } else if (attempts < 30) {
        attempts++
        setTimeout(tryRender, 200)
      }
    }
    tryRender()
  }, [turnstileSiteKey])

  const redirectTo = searchParams.get('redirect') || null

  // Si ya está autenticado, redirigir según rol
  useEffect(() => {
    if (!loading && !permLoading && user) {
      if (redirectTo) {
        window.location.href = redirectTo
      } else {
        window.location.href = defaultRoute || getDefaultRouteForRole(user.role)
      }
    }
  }, [user, loading, permLoading, redirectTo, defaultRoute, router])

  // Safety: si tarda más de 8s, forzar redirección
  useEffect(() => {
    const t = setTimeout(() => {
      if (loading || permLoading) {
        window.location.href = '/superadmin'
      }
    }, 8000)
    return () => clearTimeout(t)
  }, [loading, permLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const result = await loginWithEmail(email, password)
      if (!result.success) {
        setError(result.error || 'Credenciales inválidas')
        return
      }
      // Redirección se maneja en el useEffect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSubmitting(false)
    }
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotMessage(null)
    setForgotSending(true)

    try {
      const result = await resetPassword(forgotEmail)
      if (!result.success) {
        setForgotMessage(result.error || 'No se pudo enviar el correo')
        return
      }
      setForgotMessage('Te hemos enviado un enlace para restablecer tu contraseña.')
      setTimeout(() => setShowForgot(false), 4000)
    } catch (err) {
      setForgotMessage(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setForgotSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
      </div>
    )
  }

  // Si ya está logueado, no mostrar el formulario
  if (user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center relative overflow-hidden">
      {/* Efectos de fondo estilo BLIS */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[150px] opacity-[0.08] bg-blis-red pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.04] bg-blis-red pointer-events-none" />

      <div className="w-full max-w-md p-8 relative z-10">
        {/* Logo y título */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blis-red/10 border border-blis-red/20 mb-4">
            <ShieldCheck className="w-8 h-8 text-blis-red" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2">
            BLIS CORP
          </h1>
          <p className="text-blis-red text-sm font-bold tracking-widest">HQ</p>
          <p className="text-gray-500 mt-2 text-xs uppercase tracking-widest">
            Acceso Restringido
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <p className="text-red-400 text-sm font-medium text-center">{error}</p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5 bg-white/[0.03] backdrop-blur-xl p-8 rounded-2xl border border-white/[0.06] shadow-2xl relative">
          {/* Decoraciones de esquina */}
          <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-blis-red/30" style={{borderTopLeftRadius:14}} />
          <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-blis-red/30" style={{borderTopRightRadius:14}} />
          <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-blis-red/30" style={{borderBottomLeftRadius:14}} />
          <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-blis-red/30" style={{borderBottomRightRadius:14}} />

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Correo Electrónico
            </label>
            <input
              type="text"
              inputMode="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@blis-corp.com"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blis-red/50 focus:bg-black/70 transition-all"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blis-red/50 focus:bg-black/70 transition-all tracking-[0.2em]"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForgot(!showForgot)
                  setForgotMessage(null)
                  setForgotEmail(email)
                }}
                className="text-[11px] text-blis-red hover:text-red-400 transition-colors font-medium tracking-wide"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          {turnstileSiteKey && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                {turnstileSolved ? (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                    ✓ Humano verificado
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider animate-pulse">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5" />
                    Escaneando conexión...
                  </span>
                )}
              </div>
              <div className={`border-2 transition-all duration-500 overflow-hidden w-fit mx-auto max-w-full ${
                turnstileSolved
                  ? 'border-emerald-500/60 shadow-[0_0_16px_rgba(16,185,129,0.4)]'
                  : 'border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
              }`}>
                <div ref={turnstileContainerRef} className="[&>iframe]:block [&>iframe]:m-0 leading-[0] [&>iframe]:max-w-full" />
              </div>
            </div>
          )}

          {/* Botón de login */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 bg-blis-red text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#87082a] transition-all flex items-center justify-center gap-3 text-sm shadow-[0_0_20px_rgba(190,11,60,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Entrar al Sistema
              </>
            )}
          </button>
        </form>

        {/* Recuperar contraseña */}
        {showForgot && (
          <form
            onSubmit={handleForgotSubmit}
            className="mt-6 space-y-4 bg-white/[0.03] backdrop-blur-xl p-6 rounded-2xl border border-white/[0.06] shadow-2xl"
          >
            <h3 className="text-sm font-black uppercase tracking-widest text-white text-center">
              Restablecer contraseña
            </h3>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blis-red/50 focus:bg-black/70 transition-all"
              />
            </div>
            {forgotMessage && (
              <div className={`p-3 rounded-xl text-xs font-medium text-center ${
                forgotMessage.includes('enviado')
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {forgotMessage}
              </div>
            )}
            <button
              type="submit"
              disabled={forgotSending}
              className="w-full bg-white/5 border border-blis-red/30 text-blis-red py-3 rounded-xl font-black uppercase tracking-widest hover:bg-blis-red hover:text-white transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {forgotSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Enviar enlace'
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-[10px] text-gray-600 mt-8 font-mono tracking-wider">
          IP Registrada y Monitoreada • Blis Corp SecureNet
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}