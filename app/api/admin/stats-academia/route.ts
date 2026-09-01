import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

interface Modulo {
  id: string
  titulo: string
  lecciones?: { id: string; titulo: string }[]
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const empresa_id = searchParams.get('empresa_id') || DEFAULT_EMPRESA_ID

    const [
      { count: totalAlumnos },
      { count: totalCursos },
      { data: cursos },
      { data: progresos },
      { count: certificadosEmitidos },
      { data: rankingData },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresa_id)
        .not('rol', 'in', '("superadmin","admin")'),
      supabase.from('cursos').select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresa_id).eq('activo', true),
      supabase.from('cursos').select('id, nombre, modulos')
        .eq('empresa_id', empresa_id).eq('activo', true),
      supabase.from('curso_progreso').select('user_id, progreso, examen_estado, nota_final, intentos, curso_id')
        .eq('empresa_id', empresa_id),
      supabase.from('certificados').select('*', { count: 'exact', head: true }).eq('empresa_id', empresa_id),
      supabase.from('profiles').select('id, nombre, apellido, email, puntos_cursos, puntos_nivel')
        .eq('empresa_id', empresa_id)
        .not('rol', 'in', '("superadmin","admin")')
        .order('puntos_cursos', { ascending: false })
        .limit(20),
    ])

    // equipo_cursos puede no existir — se maneja con gracia
    let equipoCursos: any[] = []
    try {
      const cursoIdsEmpresa = (cursos || []).map(c => c.id)
      const { data: eq } = await supabase.from('equipo_cursos').select('user_id, progreso, estado, curso_id')
        .in('curso_id', cursoIdsEmpresa)
      equipoCursos = eq || []
    } catch { /* tabla no existe */ }

    // Totales de lecciones y módulos
    let totalLecciones = 0
    let totalModulos = 0
    const cursoInscritos: Record<string, { nombre: string; inscritos: number }> = {}

    for (const curso of cursos || []) {
      const modulos = (curso.modulos as Modulo[]) || []
      totalModulos += modulos.length
      for (const mod of modulos) {
        totalLecciones += (mod.lecciones || []).length
      }
      cursoInscritos[curso.id] = { nombre: curso.nombre, inscritos: 0 }
    }

    // Alumnos que iniciaron
    const alumnosConProgresoSet = new Set<string>()
    const progresoPorUsuario: Record<string, number> = {}
    let examenesRealizados = 0
    let examenesAprobados = 0
    let examenesReprobados = 0
    let examenesPendientes = 0

    for (const p of progresos || []) {
      if (p.progreso > 0) {
        alumnosConProgresoSet.add(p.user_id)
        if (!progresoPorUsuario[p.user_id] || p.progreso > progresoPorUsuario[p.user_id]) {
          progresoPorUsuario[p.user_id] = p.progreso
        }
      }
      if (p.examen_estado === 'aprobado') {
        examenesRealizados++
        examenesAprobados++
      } else if (p.examen_estado === 'reprobado' || p.examen_estado === 'bloqueado') {
        examenesRealizados++
        examenesReprobados++
      } else if (p.examen_estado === 'pendiente') {
        examenesPendientes++
      }
      if (cursoInscritos[p.curso_id]) {
        cursoInscritos[p.curso_id].inscritos++
      }
    }

    for (const e of equipoCursos || []) {
      if (e.progreso > 0) alumnosConProgresoSet.add(e.user_id)
      if (!progresoPorUsuario[e.user_id] || e.progreso > progresoPorUsuario[e.user_id]) {
        progresoPorUsuario[e.user_id] = e.progreso
      }
      if (cursoInscritos[e.curso_id]) {
        cursoInscritos[e.curso_id].inscritos++
      }
    }

    const alumnosIniciados = alumnosConProgresoSet.size
    const totalAlumnosCount = totalAlumnos || 0
    const alumnosNoIniciados = Math.max(0, totalAlumnosCount - alumnosIniciados)

    // Tasa de aprobación
    const tasaAprobacion = examenesRealizados > 0
      ? Math.round((examenesAprobados / examenesRealizados) * 100)
      : 0

    // Distribución de progreso
    const distribucionProgreso = { r0: 0, r25: 0, r50: 0, r75: 0 }
    for (const userId of alumnosConProgresoSet) {
      const p = progresoPorUsuario[userId] || 0
      if (p < 25) distribucionProgreso.r0++
      else if (p < 50) distribucionProgreso.r25++
      else if (p < 75) distribucionProgreso.r50++
      else distribucionProgreso.r75++
    }

    // Curso más popular
    const cursosOrdenados = Object.values(cursoInscritos).sort((a, b) => b.inscritos - a.inscritos)

    // Ranking
    const ranking = (rankingData || []).map((r, i) => ({
      posicion: i + 1,
      id: r.id,
      nombre: [r.nombre, r.apellido].filter(Boolean).join(' '),
      email: r.email,
      puntos_cursos: r.puntos_cursos || 0,
      nivel: r.puntos_nivel || 0,
    }))

    return NextResponse.json({
      success: true,
      data: {
        totalAlumnos: totalAlumnosCount,
        alumnosIniciados,
        alumnosNoIniciados,
        totalCursos: totalCursos || 0,
        totalModulos,
        totalLecciones,
        examenesRealizados,
        examenesAprobados,
        examenesReprobados,
        examenesPendientes,
        tasaAprobacion,
        certificadosEmitidos: certificadosEmitidos || 0,
        distribucionProgreso,
        cursoMasPopular: cursosOrdenados[0] || null,
        ranking,
      }
    })
  } catch (error) {
    console.error('Admin stats-academia error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
