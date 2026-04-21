"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, GraduationCap, ChevronDown, ChevronRight, Video, FileText, HelpCircle, CheckCircle2, Loader2, BookOpen, PlayCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface Lesson {
  id: string
  title: string
  type: 'video' | 'text' | 'quiz'
  content: string
  videoUrl?: string
}

interface Module {
  id: string
  title: string
  description?: string
  lessons: Lesson[]
  isQuizEnabled?: boolean
}

interface CursoData {
  id: string
  nombre: string
  descripcion?: string
  imagen_principal?: string | null
  modulos?: Module[]
  para_equipo?: boolean
}

interface EquipoCurso {
  id: string
  curso_id: string
  progreso: number
  estado: string
  lecciones_completadas: string[]
  nota_final: number | null
  cursos: CursoData | null
}

const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
  asignado: { label: 'Sin iniciar', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  en_progreso: { label: 'En progreso', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  completado: { label: 'Completado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  bloqueado: { label: 'Bloqueado', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

const LessonIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'video': return <Video className="w-4 h-4 text-blue-400" />
    case 'quiz': return <HelpCircle className="w-4 h-4 text-amber-400" />
    default: return <FileText className="w-4 h-4 text-gray-400" />
  }
}

export default function CursoDetallePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const cursoId = params.cursoId as string

  const [cursoData, setCursoData] = useState<CursoData | null>(null)
  const [equipoCurso, setEquipoCurso] = useState<EquipoCurso | null>(null)
  const [loading, setLoading] = useState(true)
  const [openModules, setOpenModules] = useState<Set<string>>(new Set())
  const [togglingLesson, setTogglingLesson] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [cursoRes, meRes] = await Promise.all([
        fetch(`/api/admin/cursos?id=${cursoId}`),
        user?.email ? fetch(`/api/equipo-cursos/me?email=${encodeURIComponent(user.email)}`) : Promise.resolve({ json: () => Promise.resolve({ success: false, data: [] }) }),
      ])
      const cursoJson = await cursoRes.json()
      const meJson = await meRes.json() as any

      if (cursoRes.ok && cursoJson.data) {
        const curso = Array.isArray(cursoJson.data) ? cursoJson.data[0] : cursoJson.data
        setCursoData(curso)
        if (curso.modulos) {
          setOpenModules(new Set(curso.modulos.slice(0, 2).map((m: Module) => m.id)))
        }
      }

      if (meJson.success && Array.isArray(meJson.data)) {
        const found = meJson.data.find((ec: any) => ec.curso_id === cursoId)
        if (found) setEquipoCurso(found)
      }
    } catch {}
    finally { setLoading(false) }
  }, [cursoId, user?.email])

  useEffect(() => { fetchData() }, [fetchData])

  const toggleModule = (id: string) => {
    setOpenModules(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleLesson = async (leccionId: string, completado: boolean) => {
    if (!equipoCurso) return
    setTogglingLesson(leccionId)
    try {
      const res = await fetch('/api/equipo-cursos/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipo_curso_id: equipoCurso.id, leccion_id: leccionId, completado }),
      })
      const data = await res.json()
      if (data.success) {
        setEquipoCurso(prev => prev ? { ...prev, ...data.data } : prev)
      }
    } catch {}
    finally { setTogglingLesson(null) }
  }

  const completedSet = new Set(equipoCurso?.lecciones_completadas || [])
  const modulos: Module[] = cursoData?.modulos || []
  const totalLessons = modulos.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)
  const estadoInfo = ESTADO_CONFIG[equipoCurso?.estado || 'asignado'] || ESTADO_CONFIG.asignado

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 text-blis-red animate-spin" /></div>
  }

  if (!cursoData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-white/60">Curso no encontrado</p>
        <button onClick={() => router.push('/superadmin/mis-capacitaciones')} className="text-blis-red text-sm hover:underline">Volver a capacitaciones</button>
      </div>
    )
  }

  return (
    <div className="w-full mx-auto px-4 md:px-8 pt-8 pb-20 bg-black">
      <button onClick={() => router.push('/superadmin/mis-capacitaciones')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />Volver a capacitaciones
      </button>

      <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
        <div className="relative h-48 md:h-64 bg-zinc-900 overflow-hidden">
          {cursoData.imagen_principal ? (
            <img src={cursoData.imagen_principal} alt={cursoData.nombre} className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blis-red/20 to-transparent">
              <GraduationCap className="w-24 h-24 text-blis-red/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-[9px] font-bold px-2 py-1 rounded-lg border ${estadoInfo.color}`}>{estadoInfo.label}</span>
              {cursoData.para_equipo && <span className="text-[9px] font-bold px-2 py-1 rounded-lg bg-blis-red/10 text-blis-red border border-blis-red/20">Solo Equipo</span>}
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">{cursoData.nombre}</h1>
          </div>
        </div>

        {cursoData.descripcion && (
          <div className="px-6 pt-4 pb-2">
            <p className="text-gray-400 text-sm leading-relaxed">{cursoData.descripcion}</p>
          </div>
        )}

        <div className="px-6 py-4 border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Progreso general</span>
            <span className="text-xs font-bold text-white">{equipoCurso?.progreso || 0}%</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${equipoCurso?.progreso || 0}%`, background: (equipoCurso?.progreso || 0) >= 100 ? '#10b981' : (equipoCurso?.progreso || 0) > 0 ? '#f59e0b' : '#3b82f6' }} />
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] text-gray-500">
            <span>{completedSet.size} de {totalLessons} lecciones</span>
            {equipoCurso?.nota_final !== null && equipoCurso?.nota_final !== undefined && (
              <span className="text-emerald-400 font-bold">Nota final: {equipoCurso.nota_final}%</span>
            )}
          </div>
        </div>

        <div className="border-t border-white/5">
          {modulos.map((modulo, idx) => {
            const isOpen = openModules.has(modulo.id)
            const moduleLessons = modulo.lessons || []
            const completedInModule = moduleLessons.filter(l => completedSet.has(l.id)).length
            const moduleProgress = moduleLessons.length > 0 ? Math.round((completedInModule / moduleLessons.length) * 100) : 0

            return (
              <div key={modulo.id} className="border-b border-white/5 last:border-b-0">
                <button
                  onClick={() => toggleModule(modulo.id)}
                  className="w-full flex items-center gap-3 px-6 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-blis-red/10 text-blis-red border border-blis-red/20 flex items-center justify-center text-xs font-black">
                    {idx + 1}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-white text-sm font-bold truncate">{modulo.title}</p>
                    <p className="text-gray-500 text-[10px]">{completedInModule}/{moduleLessons.length} lecciones · {moduleProgress}%</p>
                  </div>
                  <div className="w-20">
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${moduleProgress}%`, background: moduleProgress >= 100 ? '#10b981' : '#f59e0b' }} />
                    </div>
                  </div>
                  {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </button>

                {isOpen && moduleLessons.length > 0 && (
                  <div className="px-6 pb-4 space-y-1">
                    {moduleLessons.map(lesson => {
                      const isCompleted = completedSet.has(lesson.id)
                      const isToggling = togglingLesson === lesson.id
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            if (!isToggling) toggleLesson(lesson.id, !isCompleted)
                          }}
                          disabled={isToggling}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${isCompleted ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-white/[0.02] border border-white/5 hover:border-white/10'}`}
                        >
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600 bg-transparent'}`}>
                            {isToggling ? <Loader2 className="w-3 h-3 animate-spin text-white" /> : isCompleted ? <CheckCircle2 className="w-3 h-3 text-white" /> : null}
                          </div>
                          <LessonIcon type={lesson.type} />
                          <span className={`text-sm flex-1 ${isCompleted ? 'text-emerald-400 line-through' : 'text-white'}`}>{lesson.title}</span>
                          <span className="text-[9px] text-gray-600 uppercase font-bold">{lesson.type}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}