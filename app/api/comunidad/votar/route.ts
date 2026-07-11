import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/api-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    const { encuesta_id, opcion_id } = body

    if (!encuesta_id || !opcion_id) {
      return NextResponse.json({ success: false, error: 'encuesta_id y opcion_id requeridos' }, { status: 400 })
    }

    // Verificar encuesta
    const { data: encuesta } = await supabase
      .from('comunidad_encuestas')
      .select('id, multiple, fecha_cierre')
      .eq('id', encuesta_id)
      .single()

    if (!encuesta) {
      return NextResponse.json({ success: false, error: 'Encuesta no encontrada' }, { status: 404 })
    }

    if (encuesta.fecha_cierre && new Date(encuesta.fecha_cierre) < new Date()) {
      return NextResponse.json({ success: false, error: 'Encuesta cerrada' }, { status: 400 })
    }

    // Verificar que la opción pertenece a la encuesta
    const { data: opcion } = await supabase
      .from('comunidad_encuesta_opciones')
      .select('id')
      .eq('id', opcion_id)
      .eq('encuesta_id', encuesta_id)
      .single()

    if (!opcion) {
      return NextResponse.json({ success: false, error: 'Opción inválida' }, { status: 400 })
    }

    if (!encuesta.multiple) {
      // Obtener IDs de todas las opciones de esta encuesta
      const { data: todasOps } = await supabase
        .from('comunidad_encuesta_opciones')
        .select('id')
        .eq('encuesta_id', encuesta_id)

      const opcionIds = (todasOps || []).map(o => o.id)

      if (opcionIds.length > 0) {
        // Verificar si ya votó por ESTA opción
        const { data: yaVoto } = await supabase
          .from('comunidad_encuesta_votos')
          .select('id')
          .eq('opcion_id', opcion_id)
          .eq('usuario_id', user.userId)
          .single()

        if (yaVoto) {
          // Toggle off: quitar voto
          await supabase.from('comunidad_encuesta_votos').delete().eq('id', yaVoto.id)
        } else {
          // Cambiar voto: eliminar todos los votos anteriores en esta encuesta
          await supabase
            .from('comunidad_encuesta_votos')
            .delete()
            .eq('usuario_id', user.userId)
            .in('opcion_id', opcionIds)

          // Insertar nuevo voto
          await supabase
            .from('comunidad_encuesta_votos')
            .insert({ opcion_id, usuario_id: user.userId })
        }
      }
    } else {
      // Encuesta múltiple: toggle individual
      const { data: existingVote } = await supabase
        .from('comunidad_encuesta_votos')
        .select('id')
        .eq('opcion_id', opcion_id)
        .eq('usuario_id', user.userId)
        .single()

      if (existingVote) {
        await supabase.from('comunidad_encuesta_votos').delete().eq('id', existingVote.id)
      } else {
        await supabase
          .from('comunidad_encuesta_votos')
          .insert({ opcion_id, usuario_id: user.userId })
      }
    }

    // Obtener conteo actualizado
    const { data: opcionesActualizadas } = await supabase
      .from('comunidad_encuesta_opciones')
      .select('id, texto, orden')
      .eq('encuesta_id', encuesta_id)
      .order('orden')

    const opcionIds = opcionesActualizadas?.map(o => o.id) || []
    const { data: votosActuales } = await supabase
      .from('comunidad_encuesta_votos')
      .select('opcion_id, usuario_id')
      .in('opcion_id', opcionIds)

    const resultado = opcionesActualizadas?.map(o => ({
      ...o,
      votos_count: (votosActuales || []).filter(v => v.opcion_id === o.id).length,
      votada: (votosActuales || []).some(v => v.opcion_id === o.id && v.usuario_id === user.userId)
    }))

    return NextResponse.json({
      success: true,
      data: {
        opciones: resultado,
        total_votos: (votosActuales || []).length,
        usuario_voto: resultado?.filter(o => o.votada).map(o => o.id) || []
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error del servidor'
    }, { status: 500 })
  }
}
