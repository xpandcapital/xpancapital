"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Bell, CheckCheck, Trash2, ExternalLink, ArrowLeft, Settings, ShoppingCart, GraduationCap, FileText, MessageSquare, UserPlus, Banknote, AlertTriangle, Clock } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

interface Notificacion {
  id: string
  tipo: string
  titulo: string
  mensaje: string
  link: string | null
  leida: boolean
  creado_en: string
}

const TIPO_ICONOS: Record<string, React.ComponentType<{ className?: string }>> = {
  sistema: Settings, chat: MessageSquare, lead: UserPlus, venta: Banknote,
  alerta: AlertTriangle, recordatorio: Clock, info: FileText, warning: AlertTriangle,
  success: CheckCheck, error: AlertTriangle, blog: FileText, compras: ShoppingCart,
  cursos: GraduationCap, mensaje: MessageSquare,
}

function tiempoRelativo(fecha: string): string {
  const ahora = Date.now()
  const diff = ahora - new Date(fecha).getTime()
  const minutos = Math.floor(diff / 60000)
  const horas = Math.floor(minutos / 60)
  const dias = Math.floor(horas / 24)
  if (minutos < 1) return "Ahora"
  if (minutos < 60) return `Hace ${minutos}m`
  if (horas < 24) return `Hace ${horas}h`
  if (dias < 7) return `Hace ${dias}d`
  return new Date(fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })
}

export default function NotificacionesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    fetch("/api/notificaciones").then(r => r.json()).then(data => {
      setNotificaciones(data.notifications || [])
    }).finally(() => setLoading(false))
  }, [user])

  const marcarLeida = async (id: string) => {
    await fetch("/api/notificaciones", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
  }

  const marcarTodas = async () => {
    await fetch("/api/notificaciones", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ marcar_todas: true }) })
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
  }

  const eliminar = async (id: string) => {
    await fetch(`/api/notificaciones?id=${id}`, { method: "DELETE" })
    setNotificaciones(prev => prev.filter(n => n.id !== id))
  }

  const noLeidas = notificaciones.filter(n => !n.leida).length

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => {
            if (window.history.length > 1) router.back()
            else router.push('/miembros')
          }} className="p-2 hover:bg-white/5 rounded-xl text-gray-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white">Notificaciones</h1>
            {noLeidas > 0 && <p className="text-xs text-gray-500">{noLeidas} sin leer</p>}
          </div>
          {noLeidas > 0 && (
            <button onClick={marcarTodas} className="ml-auto text-[10px] font-bold text-blis-red uppercase flex items-center gap-1">
              <CheckCheck className="w-3.5 h-3.5" /> Marcar todas
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-white/[0.02] rounded-xl animate-pulse" />)}</div>
        ) : notificaciones.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">Sin notificaciones</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notificaciones.map(n => {
              const Icon = TIPO_ICONOS[n.tipo] || Settings
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => marcarLeida(n.id)}
                  className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-colors ${
                    n.leida ? "bg-white/[0.01] hover:bg-white/[0.03]" : "bg-white/[0.03] border border-blis-red/10"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.leida ? "text-gray-400" : "text-white font-bold"}`}>{n.titulo}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.mensaje}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-gray-600">{tiempoRelativo(n.creado_en)}</span>
                      <div className="flex items-center gap-2">
                        {n.link && (
                          <a href={n.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-gray-600 hover:text-blis-red">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); eliminar(n.id) }} className="text-gray-600 hover:text-red-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
