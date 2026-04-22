"use client"

import { useState } from 'react'
import { useMisCapacitaciones } from './_hooks/useMisCapacitaciones'
import { useRouter } from 'next/navigation'
import { GraduationCap, Loader2, BookOpen, CheckCircle2, PlayCircle, AlertCircle } from 'lucide-react'

const ESTADO_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  asignado: { label: 'Sin iniciar', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: BookOpen },
  en_progreso: { label: 'En progreso', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: PlayCircle },
  completado: { label: 'Completado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
  bloqueado: { label: 'Bloqueado', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: AlertCircle },
}

export default function MisCapacitacionesPage() {
const router = useRouter();
const { cursos, loading, error } = useMisCapacitaciones()
const [navigatingTo, setNavigatingTo] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-blis-red animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-white/60 text-center">{error}</p>
        <button onClick={() => window.location.reload()} className="text-blis-red text-sm hover:underline mt-2">Reintentar</button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-white/60">{error}</p>
      </div>
    )
  }

  if (cursos.length === 0) {
    return (
      <div className="w-full mx-auto px-4 md:px-8 pt-8 pb-20 bg-black">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-blis-red/10 text-blis-red border border-blis-red/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Mis Capacitaciones</h1>
            <p className="text-gray-500 text-sm">Cursos asignados a tu perfil</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-950 border border-white/5 rounded-2xl">
          <GraduationCap className="w-16 h-16 text-gray-700 mb-4" />
          <p className="text-gray-500 text-lg font-bold">No tienes capacitaciones asignadas</p>
          <p className="text-gray-600 text-sm mt-2">Cuando te asignen un curso, aparecerá aquí</p>
        </div>
      </div>
    )
  }

  const asignados = cursos.filter(c => c.estado === 'asignado').length
  const enProgreso = cursos.filter(c => c.estado === 'en_progreso').length
  const completados = cursos.filter(c => c.estado === 'completado').length

  return (
    <div className="w-full mx-auto px-4 md:px-8 pt-8 pb-20 bg-black">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-blis-red/10 text-blis-red border border-blis-red/20 flex items-center justify-center">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Mis Capacitaciones</h1>
          <p className="text-gray-500 text-sm">Cursos asignados a tu perfil</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-blue-400">{asignados}</p>
          <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-wider">Sin iniciar</p>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-amber-400">{enProgreso}</p>
          <p className="text-[10px] font-bold text-amber-400/60 uppercase tracking-wider">En progreso</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-emerald-400">{completados}</p>
          <p className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-wider">Completados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cursos.map(curso => {
          const estado = ESTADO_CONFIG[curso.estado] || ESTADO_CONFIG.asignado
          const EstadoIcon = estado.icon
          const cursoData = curso.cursos as any
          return (
            <div
              key={curso.id}
              onClick={() => { setNavigatingTo(curso.curso_id); router.push(`/superadmin/mis-capacitaciones/${curso.curso_id}`); }}
              className={`group bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden hover:border-blis-red/20 transition-all cursor-pointer ${navigatingTo === curso.curso_id ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div className="aspect-square relative overflow-hidden bg-zinc-900">
                {navigatingTo === curso.curso_id && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <Loader2 className="w-8 h-8 text-blis-red animate-spin" />
                  </div>
                )}
                {cursoData?.imagen_principal ? (
                  <img src={cursoData.imagen_principal} alt={cursoData.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <GraduationCap className="w-16 h-16 text-gray-700" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`text-[9px] font-bold px-2 py-1 rounded-lg border ${estado.color} flex items-center gap-1`}>
                    <EstadoIcon className="w-3 h-3" />{estado.label}
                  </span>
                </div>
                {cursoData?.para_equipo && (
                  <div className="absolute top-2 left-2">
                    <span className="text-[9px] font-bold px-2 py-1 rounded-lg bg-blis-red/10 text-blis-red border border-blis-red/20">Solo Equipo</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">{cursoData?.nombre || 'Curso'}</h3>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Progreso</span>
                    <span className="text-xs font-bold text-white">{curso.progreso}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${curso.progreso}%`,
                        background: curso.progreso >= 100 ? '#10b981' : curso.progreso > 0 ? '#f59e0b' : '#3b82f6',
                      }}
                    />
                  </div>
                </div>
                {curso.nota_final !== null && (
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Nota: {curso.nota_final}%
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}