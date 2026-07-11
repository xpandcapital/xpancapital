import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    const empresaId = body.empresa_id

    if (!empresaId) {
      return NextResponse.json({ success: false, error: 'empresa_id requerido' }, { status: 400 })
    }

    const periodo = new Date().toISOString().slice(0, 7)
    const mesAnterior = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
      .toISOString().slice(0, 7)

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, puntos_cursos, puntos_comunidad, puntos_blog, puntos')
      .eq('empresa_id', empresaId)
      .gt('puntos', 0)

    if (!profiles?.length) {
      return NextResponse.json({ success: true, mensaje: 'Sin usuarios con actividad para archivar' })
    }

    const { data: rankingGlobal } = await supabase
      .from('profiles')
      .select('id')
      .eq('empresa_id', empresaId)
      .gt('puntos', 0)
      .order('puntos_nivel', { ascending: false })
      .order('puntos', { ascending: false })

    const rankMap = new Map(rankingGlobal?.map((r: any, i: number) => [r.id, i + 1]) || [])

    let archivados = 0
    for (const p of profiles) {
      const { error } = await supabase
        .from('gamificacion_historico')
        .upsert({
          user_id: p.id,
          empresa_id: empresaId,
          periodo: mesAnterior || periodo,
          puntos_cursos: p.puntos_cursos || 0,
          puntos_comunidad: p.puntos_comunidad || 0,
          puntos_blog: p.puntos_blog || 0,
          ranking_global: rankMap.get(p.id),
        }, { onConflict: 'user_id,periodo' })

      if (!error) archivados++

      const nuevosPuntos = p.puntos_cursos || 0
      const { data: niveles } = await supabase
        .from('gamificacion_niveles')
        .select('nivel, puntos_requeridos')
        .eq('empresa_id', empresaId)
        .order('orden', { ascending: true })

      let nuevoNivel = 1
      if (niveles) {
        for (let i = niveles.length - 1; i >= 0; i--) {
          if (nuevosPuntos >= niveles[i].puntos_requeridos) {
            nuevoNivel = niveles[i].nivel
            break
          }
        }
      }

      await supabase
        .from('profiles')
        .update({
          puntos_comunidad: 0,
          puntos_blog: 0,
          puntos: nuevosPuntos,
          puntos_nivel: nuevoNivel,
          actualizado_en: new Date().toISOString(),
        })
        .eq('id', p.id)
    }

    return NextResponse.json({
      success: true,
      data: { periodo, archivados },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
