"use client"

import { useState } from 'react'
import { useMisCapacitaciones } from './_hooks/useMisCapacitaciones'
import { useRouter } from 'next/navigation'
import { GraduationCap, Loader2, BookOpen, CheckCircle2, PlayCircle, AlertCircle, Clock, Trophy, TrendingUp, ChevronRight, BookMarked, ShoppingBag, Users } from 'lucide-react'
import { motion } from 'framer-motion'

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string; icon: any }> = {
  asignado: { label: 'Sin iniciar', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-400', icon: BookOpen },
  en_progreso: { label: 'En progreso', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400', icon: PlayCircle },
  completado: { label: 'Completado', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400', icon: CheckCircle2 },
  bloqueado: { label: 'Bloqueado', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-red-400', icon: AlertCircle },
}

function StatCard({ icon: Icon, value, label, colorClass, bgClass }: {
  icon: any, value: number | string, label: string, colorClass: string, bgClass: string
}) {
  return (
    <div className={`${bgClass} border border-white/5 rounded-2xl p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl ${bgClass.replace('/10', '/20')} flex items-center justify-center shrink-0`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
      <div>
        <p className={`text-2xl font-black ${colorClass}`}>{value}</p>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  )
}

function CourseCard({ curso, navigatingTo, onClick }: {
  curso: any, navigatingTo: string | null, onClick: () => void
}) {
  const estado = ESTADO_CONFIG[curso.estado] || ESTADO_CONFIG.asignado
  const EstadoIcon = estado.icon
  const cursoData = curso.cursos as any
  const modulos = cursoData?.modulos || []
  const totalLecciones = modulos.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0)
  const leccionesCompletadas = Array.isArray(curso.lecciones_completadas) ? curso.lecciones_completadas.length : 0

  const progresoColor = curso.progreso >= 100 ? '#10b981' : curso.progreso > 0 ? '#f59e0b' : '#3b82f6'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <div
        onClick={onClick}
        className={`
          relative bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden
          hover:border-white/10 transition-all duration-300 cursor-pointer
          hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-1
          ${navigatingTo === curso.curso_id ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        {/* Image area - square and outside the image */}
        <div className="relative aspect-square overflow-hidden bg-zinc-900 ml-1">
          {navigatingTo === curso.curso_id && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 text-blis-red animate-spin" />
            </div>
          )}
          {cursoData?.imagen_principal ? (
            <img
              src={cursoData.imagen_principal}
              alt={cursoData.nombre}
              className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
              <GraduationCap className="w-12 h-12 text-gray-700" />
            </div>
          )}
        </div>

        {/* Status & team badge - below image */}
        <div className="flex items-center gap-2 px-4 pt-3">
          <div className={`flex items-center gap-1.5 ${estado.bg} ${estado.color} border ${estado.border} px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
            <EstadoIcon className="w-3 h-3" />
            {estado.label}
          </div>
          {cursoData?.para_equipo && (
            <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-blis-red/10 text-blis-red border border-blis-red/20 uppercase tracking-wider">Solo Equipo</span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-white font-bold text-sm mb-3 line-clamp-2 leading-tight group-hover:text-blis-red transition-colors">
            {cursoData?.nombre || 'Curso'}
          </h3>

          {/* Meta info */}
          <div className="flex items-center gap-4 mb-4 text-[10px] text-gray-500 uppercase tracking-wider font-bold">
            <span className="flex items-center gap-1">
              <BookMarked className="w-3 h-3" />
              {modulos.length} módulos
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {leccionesCompletadas}/{totalLecciones} lecciones
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Progreso</span>
              <span className="text-xs font-bold text-white">{curso.progreso}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${curso.progreso}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: progresoColor }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {curso.nota_final !== null ? (
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                <Trophy className="w-3.5 h-3.5" />
                Nota: {curso.nota_final}%
              </div>
            ) : (
              <div className="text-[10px] text-gray-600">
                Asignado {new Date(curso.asignado_en).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </div>
            )}
            <div className="flex items-center gap-1 text-blis-red text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
              Continuar
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function MisCapacitacionesPage() {
  const router = useRouter()
  const { cursos, loading, error, isAdmin } = useMisCapacitaciones()
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

  if (cursos.length === 0) {
    return (
      <div className="w-full mx-auto px-4 md:px-8 pt-8 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-blis-red/10 text-blis-red border border-blis-red/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Mis Capacitaciones</h1>
            <p className="text-gray-500 text-sm">Cursos asignados a tu perfil</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-24 bg-zinc-950 border border-white/5 rounded-2xl">
          <GraduationCap className="w-16 h-16 text-gray-700 mb-4" />
          <p className="text-gray-500 text-lg font-bold">No tienes capacitaciones asignadas</p>
          <p className="text-gray-600 text-sm mt-2">Cuando te asignen un curso, aparecerá aquí</p>
        </div>
      </div>
    )
  }

  const cursosPublicos = cursos.filter(c => !((c.cursos as any)?.para_equipo))
  const capacitacionesEquipo = cursos.filter(c => (c.cursos as any)?.para_equipo)

  const totalPublicos = cursosPublicos.length
  const publicosEnProgreso = cursosPublicos.filter(c => c.estado === 'en_progreso').length
  const publicosCompletados = cursosPublicos.filter(c => c.estado === 'completado').length
  const promedioPublicos = totalPublicos ? Math.round(cursosPublicos.reduce((acc, c) => acc + c.progreso, 0) / totalPublicos) : 0

  const totalEquipo = capacitacionesEquipo.length
  const equipoEnProgreso = capacitacionesEquipo.filter(c => c.estado === 'en_progreso').length
  const equipoCompletados = capacitacionesEquipo.filter(c => c.estado === 'completado').length
  const promedioEquipo = totalEquipo ? Math.round(capacitacionesEquipo.reduce((acc, c) => acc + c.progreso, 0) / totalEquipo) : 0

  const asignados = cursos.filter(c => c.estado === 'asignado').length
  const enProgreso = cursos.filter(c => c.estado === 'en_progreso').length
  const completados = cursos.filter(c => c.estado === 'completado').length
  const promedioGeneral = Math.round(cursos.reduce((acc, c) => acc + c.progreso, 0) / cursos.length)

  return (
    <div className="w-full mx-auto px-4 md:px-8 pt-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-blis-red/10 text-blis-red border border-blis-red/20 flex items-center justify-center">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Mis Capacitaciones</h1>
          <p className="text-gray-500 text-sm">
            {isAdmin ? 'Gestiona tu progreso de aprendizaje' : 'Cursos asignados a tu perfil'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard icon={BookOpen} value={cursos.length} label="Total Cursos" colorClass="text-blue-400" bgClass="bg-blue-500/10" />
        <StatCard icon={Clock} value={asignados} label="Sin Iniciar" colorClass="text-gray-400" bgClass="bg-white/5" />
        <StatCard icon={TrendingUp} value={enProgreso} label="En Progreso" colorClass="text-amber-400" bgClass="bg-amber-500/10" />
        <StatCard icon={Trophy} value={completados} label="Completados" colorClass="text-emerald-400" bgClass="bg-emerald-500/10" />
      </div>

      {/* Breakdown by type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Cursos / En Venta
            </h3>
            <span className="text-2xl font-black text-white">{totalPublicos}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-amber-400 font-bold">{publicosEnProgreso} en progreso</span>
            <span className="text-gray-600">·</span>
            <span className="text-emerald-400 font-bold">{publicosCompletados} completados</span>
          </div>
          <div className="mt-3 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700" style={{ width: `${promedioPublicos}%` }} />
          </div>
        </div>
        <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-purple-400 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4" />
              Capacitaciones de Equipo
            </h3>
            <span className="text-2xl font-black text-white">{totalEquipo}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-purple-400 font-bold">{equipoEnProgreso} en progreso</span>
            <span className="text-gray-600">·</span>
            <span className="text-emerald-400 font-bold">{equipoCompletados} completados</span>
          </div>
          <div className="mt-3 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-700" style={{ width: `${promedioEquipo}%` }} />
          </div>
        </div>
      </div>

      {/* Overall Progress Banner */}
      <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 mb-8 flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-blis-red/10 border border-blis-red/20 flex items-center justify-center shrink-0">
          <TrendingUp className="w-8 h-8 text-blis-red" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Tu progreso general</span>
            <span className="text-2xl font-black text-white">{promedioGeneral}%</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blis-red to-blis-red/60 transition-all duration-700"
              style={{ width: `${promedioGeneral}%` }}
            />
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 pl-6 border-l border-white/5 text-center">
          <div>
            <p className="text-xl font-black text-amber-400">{publicosCompletados}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Cursos</p>
          </div>
          <div>
            <p className="text-xl font-black text-purple-400">{equipoCompletados}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Equipo</p>
          </div>
          <div>
            <p className="text-xl font-black text-amber-400">{enProgreso}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">En curso</p>
          </div>
        </div>
      </div>

      {/* Courses Grid - Public/For Sale */}
      {cursosPublicos.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Cursos / En Venta
            </h2>
            <span className="text-xs text-gray-600">{cursosPublicos.length} cursos</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mb-10">
            {cursosPublicos.map(curso => (
              <CourseCard
                key={curso.id}
                curso={curso}
                navigatingTo={navigatingTo}
                onClick={() => {
                  setNavigatingTo(curso.curso_id)
                  router.push(`/superadmin/mis-capacitaciones/${curso.curso_id}`)
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Courses Grid - Team */}
      {capacitacionesEquipo.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4" />
              Capacitaciones de Equipo
            </h2>
            <span className="text-xs text-gray-600">{capacitacionesEquipo.length} cursos</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {capacitacionesEquipo.map(curso => (
              <CourseCard
                key={curso.id}
                curso={curso}
                navigatingTo={navigatingTo}
                onClick={() => {
                  setNavigatingTo(curso.curso_id)
                  router.push(`/superadmin/mis-capacitaciones/${curso.curso_id}`)
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}