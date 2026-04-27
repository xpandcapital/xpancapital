import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase()
    const userId = params.id

    const { data: equipoCursos, error } = await supabase
      .from('equipo_cursos')
      .select(`
        id,
        curso_id,
        progreso,
        estado,
        nota_final,
        lecciones_completadas,
        asignado_en,
        completado_en,
        curso:cursos(
          id,
          nombre,
          imagen_principal,
          modulos
        )
      `)
      .eq('user_id', userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: certificados } = await supabase
      .from('certificados')
      .select('id, nombre, fecha_emision, codigo_verificacion')
      .eq('user_id', userId)
      .order('fecha_emision', { ascending: false })

    const progress = (equipoCursos || []).map(ec => {
      const modulos = ec.curso?.modulos as any[] || []
      const totalLessons = modulos.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0)
      const completedLessons = ec.lecciones_completadas?.length || 0

      return {
        id: ec.id,
        courseId: ec.curso_id,
        course: ec.curso?.nombre || 'Curso',
        image: ec.curso?.imagen_principal,
        progress: ec.progreso || 0,
        grade: ec.nota_final,
        attempts: 0,
        maxAttempts: 3,
        examStatus: ec.estado === 'completado' ? 'approved' : 'pending',
        enrolledDate: ec.asignado_en,
        completedDate: ec.completado_en
      }
    })

    const certificates = (certificados || []).map(c => ({
      id: c.id,
      name: c.nombre,
      date: c.fecha_emision,
      verificationCode: c.codigo_verificacion
    }))

    return NextResponse.json({ success: true, data: { progress, certificates } })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
