'use client'

import { useState, useEffect } from 'react'
import { CorreoLayout } from './_components/CorreoLayout'
import { Server, Loader2 } from 'lucide-react'

export default function CorreoPage() {
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'ok' | 'down'>('checking')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const check = async () => {
      try {
        const ctrl = new AbortController()
        const timer = setTimeout(() => ctrl.abort(), 3000)
        const res = await fetch('/api/correo/cuentas', { signal: ctrl.signal })
        clearTimeout(timer)
        setSupabaseStatus(res.ok || res.status === 401 ? 'ok' : 'down')
      } catch {
        setSupabaseStatus('down')
      }
    }
    check()
  }, [])

  if (supabaseStatus === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (supabaseStatus === 'down') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="text-center max-w-md">
          <Server className="w-16 h-16 text-amber-500 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-white mb-2">Supabase en recuperación</h2>
          <p className="text-gray-400 text-sm mb-4">La base de datos está restableciéndose después de un reinicio del proyecto. Esto puede tomar hasta 5 minutos.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2.5 rounded-xl bg-blis-red text-white text-sm font-semibold hover:bg-blis-red-neon transition-all">Reintentar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-full overflow-hidden -mt-8 md:mt-0 md:space-y-4">
      <div className="flex items-center justify-between hidden md:flex">
        <div>
          <h1 className="text-2xl font-bold text-white">Correo Corporativo</h1>
          <p className="text-sm text-gray-400 mt-1">Gestiona tus correos empresariales con IMAP</p>
        </div>
      </div>
      <CorreoLayout sidebarOpen={sidebarOpen} onToggleSidebar={setSidebarOpen} />
    </div>
  )
}
