"use client"

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useRef } from 'react'
import { ShieldCheck, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'

function ResetPasswordForm() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loadingSession, setLoadingSession] = useState(true)
  const [sessionReady, setSessionReady] = useState(false)
  const supabaseRef = useRef<ReturnType<typeof getSupabase>>(null)

  useEffect(() => {
    const supabase = getSupabase()
    supabaseRef.current = supabase
    if (!supabase) {
      setError('Supabase no está configurado')
      setLoadingSession(false)
      return
    }

    let resolved = false
    const finish = (ok: boolean, err?: string) => {
      if (resolved) return
      resolved = true
      setSessionReady(ok)
      if (err) setError(err)
      setLoadingSession(false)
    }

    const INVALID_MSG = 'El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.'

    // 1. Escuchar eventos de autenticación (PASSWORD_RECOVERY / SIGNED_IN)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        finish(true)
      }
    })

    const checkSession = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) finish(true)
        else finish(false, INVALID_MSG)
      }).catch(() => finish(false, INVALID_MSG))
    }

    // 2. Recuperar tokens del hash (flujo implicit). @supabase/ssr fuerza PKCE y no
    //    procesa el access_token del hash, así que lo hacemos manual con setSession.
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')

    if (access_token && refresh_token) {
      window.location.hash = ''
      supabase.auth.setSession({ access_token, refresh_token })
        .then(({ error }) => {
          if (error) finish(false, INVALID_MSG)
          else finish(true)
        })
        .catch(() => checkSession())
    } else {
      checkSession()
    }

    // 3. Safety: jamás quedarse en spinner infinito
    const safetyTimer = setTimeout(() => finish(false, INVALID_MSG), 8000)

    return () => {
      clearTimeout(safetyTimer)
      subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (!supabaseRef.current) {
      setError('Supabase no está configurado')
      return
    }

    setSubmitting(true)

    try {
      const { error: updateError } = await supabaseRef.current.auth.updateUser({ password })

      if (updateError) {
        setError(updateError.message)
        setSubmitting(false)
        return
      }

    setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[150px] opacity-[0.08] bg-blis-red pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.04] bg-blis-red pointer-events-none" />

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blis-red/10 border border-blis-red/20 mb-4">
            <ShieldCheck className="w-8 h-8 text-blis-red" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2">
            Xpand Capital
          </h1>
          <p className="text-blis-red text-sm font-bold tracking-widest">HQ</p>
          <p className="text-gray-500 mt-2 text-xs uppercase tracking-widest">
            Nueva Contraseña
          </p>
        </div>

        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-black uppercase tracking-widest text-white">
              Contraseña actualizada
            </h3>
            <p className="text-emerald-400 text-sm">
              Tu contraseña se ha restablecido correctamente. Serás redirigido al login en unos segundos.
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-sm font-medium text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 bg-white/[0.03] backdrop-blur-xl p-8 rounded-2xl border border-white/[0.06] shadow-2xl relative">
              <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-blis-red/30" style={{ borderTopLeftRadius: 14 }} />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-blis-red/30" style={{ borderTopRightRadius: 14 }} />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-blis-red/30" style={{ borderBottomLeftRadius: 14 }} />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-blis-red/30" style={{ borderBottomRightRadius: 14 }} />

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blis-red/50 focus:bg-black/70 transition-all tracking-[0.2em]"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Confirmar Contraseña
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blis-red/50 focus:bg-black/70 transition-all tracking-[0.2em]"
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 bg-blis-red text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#87082a] transition-all flex items-center justify-center gap-3 text-sm shadow-[0_0_20px_rgba(213,193,8,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Guardar Contraseña
                  </>
                )}
              </button>
            </form>
          </>
        )}

        <p className="text-center text-[10px] text-gray-600 mt-8 font-mono tracking-wider">
          IP Registrada y Monitoreada • Xpand Capital SecureNet
        </p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}


