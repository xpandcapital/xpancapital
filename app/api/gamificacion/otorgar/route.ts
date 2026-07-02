import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { GamificacionConfig } from '@/lib/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

type Categoria = 'cursos' | 'comunidad' | 'blog'

const categoriaMap: Record<string, Categoria> = {
  leccion_completada: 'cursos',
  curso_completado: 'cursos',
  certificado: 'cursos',
  post_comunidad: 'comunidad',
  comentario_comunidad: 'comunidad',
  reaccion: 'comunidad',
  dia_activo: 'comunidad',
  comentario_blog: 'blog',
  lectura_blog: 'blog',
}

const columnaMap: Record<string, string> = {
  leccion_completada: 'puntos_cursos',
  curso_completado: 'puntos_cursos',
  certificado: 'puntos_cursos',
  post_comunidad: 'puntos_comunidad',
  comentario_comunidad: 'puntos_comunidad',
  reaccion: 'puntos_comunidad',
  dia_activo: 'puntos_comunidad',
  comentario_blog: 'puntos_blog',
  lectura_blog: 'puntos_blog',
}

const topesMap: Record<string, keyof any> = {
  comentario_comunidad: 'max_comentarios_comunidad_dia',
  post_comunidad: 'max_posts_comunidad_dia',
  reaccion: 'max_reacciones_dia',
  comentario_blog: 'max_comentarios_blog_dia',
  lectura_blog: 'max_lecturas_blog_dia',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_id, empresa_id, tipo, referencia_tipo,
      referencia_id, descripcion, puntos_override,
    } = body

    if (!user_id || !empresa_id || !tipo) {
      return NextResponse.json({ success: false, error: 'user_id, empresa_id y tipo requeridos' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const categoria = categoriaMap[tipo]
    const columna = columnaMap[tipo]

    const { data: config, error: cfgErr } = await supabase
      .from('gamificacion_config')
      .select('*')
      .eq('empresa_id', empresa_id)
      .single()

    if (cfgErr || !config) {
      return NextResponse.json({ success: false, error: cfgErr?.message || 'Config no encontrada' }, { status: 400 })
    }

    if (!config.activo) {
      return NextResponse.json({ success: false, error: 'Gamificación no activa' }, { status: 400 })
    }

    let puntosOtorgados = puntos_override

    if (!puntosOtorgados) {
      const puntosMap: Record<string, number> = {
        leccion_completada: config.puntos_leccion_completada,
        curso_completado: config.puntos_curso_completado,
        post_comunidad: config.puntos_post_comunidad,
        comentario_comunidad: config.puntos_comentario_comunidad,
        reaccion: config.puntos_reaccion,
        comentario_blog: config.puntos_comentario_blog,
        lectura_blog: config.puntos_lectura_blog,
        dia_activo: config.puntos_dia_activo,
      }
      puntosOtorgados = puntosMap[tipo] || 0
    }

    if (!puntosOtorgados) {
      return NextResponse.json({ success: true, data: { puntos_otorgados: 0 } })
    }

    // Validar tope diario para acciones de comunidad/blog
    if (categoria !== 'cursos' && topesMap[tipo]) {
      const topeKey = topesMap[tipo] as keyof GamificacionConfig
      const tope = (config as any)[topeKey] ?? 99
      const hoy = new Date().toISOString().split('T')[0]

      const { count } = await supabase
        .from('gamificacion_puntos')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user_id)
        .eq('tipo', tipo)
        .gte('creado_en', hoy + 'T00:00:00')
        .lte('creado_en', hoy + 'T23:59:59')

      if ((count ?? 0) >= tope) {
        return NextResponse.json({
          success: true,
          data: { puntos_otorgados: 0, mensaje: `Tope diario alcanzado (${tope})` },
        })
      }
    }

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('puntos, puntos_nivel, puntos_cursos, puntos_comunidad, puntos_blog, racha_dias, ultima_actividad')
      .eq('id', user_id)
      .single()

    if (profileErr) {
      return NextResponse.json({ success: false, error: profileErr.message }, { status: 400 })
    }

    // Actualizar racha
    const hoy = new Date().toISOString().split('T')[0]
    const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    let nuevaRacha = profile.racha_dias || 0

    if (profile.ultima_actividad === ayer) {
      nuevaRacha = nuevaRacha + 1
    } else if (profile.ultima_actividad !== hoy) {
      nuevaRacha = 1
    }

    // Calcular nuevos valores
    const nuevosPuntos = (profile.puntos || 0) + puntosOtorgados
    const nuevosPuntosCurso = categoria === 'cursos'
      ? (profile.puntos_cursos || 0) + puntosOtorgados
      : (profile.puntos_cursos || 0)
    const nuevosPuntosComunidad = categoria === 'comunidad'
      ? (profile.puntos_comunidad || 0) + puntosOtorgados
      : (profile.puntos_comunidad || 0)
    const nuevosPuntosBlog = categoria === 'blog'
      ? (profile.puntos_blog || 0) + puntosOtorgados
      : (profile.puntos_blog || 0)

    // Nivel basado SOLO en puntos_cursos
    const { data: niveles } = await supabase
      .from('gamificacion_niveles')
      .select('*')
      .eq('empresa_id', empresa_id)
      .order('orden', { ascending: true })

    let nuevoPuntosNivel = profile.puntos_nivel || 1
    if (niveles) {
      for (let i = niveles.length - 1; i >= 0; i--) {
        if (nuevosPuntosCurso >= niveles[i].puntos_requeridos) {
          nuevoPuntosNivel = niveles[i].nivel
          break
        }
      }
    }

    // Si la acción es admin_ajuste, el admin decide qué columna modificar
    // Por defecto va a puntos_cursos
    const updateData: Record<string, any> = {
      puntos: nuevosPuntos,
      puntos_nivel: nuevoPuntosNivel,
      racha_dias: nuevaRacha,
      ultima_actividad: hoy,
      actualizado_en: new Date().toISOString(),
    }

    if (categoria === 'cursos' || tipo === 'admin_ajuste') {
      updateData.puntos_cursos = nuevosPuntosCurso
    }
    if (categoria === 'comunidad') {
      updateData.puntos_comunidad = nuevosPuntosComunidad
    }
    if (categoria === 'blog') {
      updateData.puntos_blog = nuevosPuntosBlog
    }

    const { error: updateErr } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user_id)

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 400 })
    }

    const { data: transaccion, error: transErr } = await supabase
      .from('gamificacion_puntos')
      .insert({
        empresa_id, user_id,
        puntos: puntosOtorgados,
        tipo, referencia_tipo, referencia_id, descripcion,
      })
      .select('*')
      .single()

    if (transErr) {
      console.error('[otorgar-puntos] Error insertando transacción:', transErr.message)
    }

    await verificarLogros(supabase, user_id, empresa_id, profile.puntos + puntosOtorgados, nuevaRacha)

    return NextResponse.json({
      success: true,
      data: {
        puntos_otorgados: puntosOtorgados,
        puntos_totales: nuevosPuntos,
        puntos_nivel: nuevoPuntosNivel,
        puntos_cursos: nuevosPuntosCurso,
        puntos_comunidad: nuevosPuntosComunidad,
        puntos_blog: nuevosPuntosBlog,
        racha_dias: nuevaRacha,
        transaccion,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

async function verificarLogros(
  supabase: any,
  userId: string,
  empresaId: string,
  puntosTotales: number,
  rachaDias: number
) {
  try {
    const { data: logrosActivos } = await supabase
      .from('gamificacion_logros')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('activo', true)

    if (!logrosActivos?.length) return

    const { data: desbloqueados } = await supabase
      .from('gamificacion_logros_usuarios')
      .select('logro_id')
      .eq('user_id', userId)

    const desbloqueadosIds = new Set((desbloqueados || []).map((d: any) => d.logro_id))

    for (const logro of logrosActivos) {
      if (desbloqueadosIds.has(logro.id)) continue

      const cond = logro.condicion as Record<string, any>
      let cumple = false

      if (cond.puntos_totales !== undefined) {
        cumple = puntosTotales >= cond.puntos_totales
      } else if (cond.racha_dias !== undefined) {
        cumple = rachaDias >= cond.racha_dias
      } else if (cond.cursos_completados !== undefined) {
        const { count } = await supabase
          .from('equipo_cursos')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('estado', 'completado')
        cumple = (count ?? 0) >= cond.cursos_completados
      } else if (cond.comentarios !== undefined) {
        const { count } = await supabase
          .from('comunidad_post_comentarios')
          .select('id', { count: 'exact', head: true })
          .eq('usuario_id', userId)
        cumple = (count ?? 0) >= cond.comentarios
      } else if (cond.posts_comunidad !== undefined) {
        const { count } = await supabase
          .from('comunidad_posts')
          .select('id', { count: 'exact', head: true })
          .eq('autor_id', userId)
        cumple = (count ?? 0) >= cond.posts_comunidad
      } else if (cond.lecturas_blog !== undefined) {
        const { count } = await supabase
          .from('blog_lecturas')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
        cumple = (count ?? 0) >= cond.lecturas_blog
      } else if (cond.certificado_primer_intento !== undefined) {
        const { count } = await supabase
          .from('certificado_intentos')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('intento_en_ciclo', 1)
          .eq('ciclo', 1)
        cumple = (count ?? 0) >= 1
      }

      if (cumple) {
        await supabase.from('gamificacion_logros_usuarios').insert({
          user_id: userId,
          logro_id: logro.id,
        })

        if (logro.puntos_bonus > 0) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('puntos, puntos_cursos')
            .eq('id', userId)
            .single()

          const nuevosPts = (profile?.puntos || 0) + logro.puntos_bonus
          const nuevosCurso = (profile?.puntos_cursos || 0) + logro.puntos_bonus

          await supabase
            .from('profiles')
            .update({
              puntos: nuevosPts,
              puntos_cursos: nuevosCurso,
              actualizado_en: new Date().toISOString(),
            })
            .eq('id', userId)

          await supabase.from('gamificacion_puntos').insert({
            empresa_id: empresaId,
            user_id: userId,
            puntos: logro.puntos_bonus,
            tipo: 'logro_desbloqueado',
            descripcion: `Logro desbloqueado: ${logro.nombre}`,
          })
        }
      }
    }
  } catch (err) {
    console.error('[verificarLogros] Error:', err)
  }
}
