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
    const { post_id, tipo = 'like' } = body

    if (!post_id) {
      return NextResponse.json({ success: false, error: 'post_id requerido' }, { status: 400 })
    }

    // Verificar si ya reaccionó
    const { data: existing } = await supabase
      .from('comunidad_post_reacciones')
      .select('id, tipo')
      .eq('post_id', post_id)
      .eq('usuario_id', user.userId)
      .single()

    if (existing) {
      if (existing.tipo === tipo) {
        // Quitar reacción (toggle off)
        await supabase.from('comunidad_post_reacciones').delete().eq('id', existing.id)
        return NextResponse.json({ success: true, accion: 'removido', tipo: null })
      } else {
        // Cambiar tipo de reacción
        const { error } = await supabase
          .from('comunidad_post_reacciones')
          .update({ tipo })
          .eq('id', existing.id)
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
        return NextResponse.json({ success: true, accion: 'actualizado', tipo })
      }
    }

    // Crear nueva reacción
    const { error } = await supabase
      .from('comunidad_post_reacciones')
      .insert({ post_id, usuario_id: user.userId, tipo })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, accion: 'creado', tipo })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error del servidor'
    }, { status: 500 })
  }
}
