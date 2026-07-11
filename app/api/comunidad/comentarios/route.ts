export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, isAdmin } from '@/lib/supabase/api-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('post_id')

    if (!postId) {
      return NextResponse.json({ success: false, error: 'post_id requerido' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: comentarios, error } = await supabase
      .from('comunidad_post_comentarios')
      .select(`
        id, post_id, usuario_id, contenido, padre_id, oculto, created_at, updated_at,
        autor:usuario_id(id, nombre, apellido, avatar_url, rol)
      `)
      .eq('post_id', postId)
      .eq('oculto', false)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    const raices = (comentarios || []).filter(c => !c.padre_id)
    const respuestas = (comentarios || []).filter(c => c.padre_id)

    const resultado = raices.map(r => ({
      ...r,
      respuestas: respuestas.filter(res => res.padre_id === r.id).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    }))

    return NextResponse.json({ success: true, data: resultado })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error del servidor'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    const { post_id, contenido, padre_id } = body

    if (!post_id || !contenido?.trim()) {
      return NextResponse.json({ success: false, error: 'post_id y contenido requeridos' }, { status: 400 })
    }

    const { data: comentario, error } = await supabase
      .from('comunidad_post_comentarios')
      .insert({
        post_id,
        usuario_id: user.userId,
        contenido: contenido.trim(),
        padre_id: padre_id || null
      })
      .select(`
        id, post_id, usuario_id, contenido, padre_id, oculto, created_at, updated_at,
        autor:usuario_id(id, nombre, apellido, avatar_url, rol)
      `)
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    fetch(`${request.nextUrl.origin}/api/gamificacion/otorgar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.userId,
        empresa_id: user.empresaId,
        tipo: 'comentario_comunidad',
        referencia_tipo: 'comunidad_post_comentarios',
        referencia_id: comentario.id,
        descripcion: 'Comentario en la comunidad',
      }),
    }).catch(err => console.error('[gamificacion] Error otorgando puntos:', err))

    return NextResponse.json({ success: true, data: comentario })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error del servidor'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 })
    }

    const { data: existing } = await supabase.from('comunidad_post_comentarios').select('usuario_id').eq('id', id).single()
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Comentario no encontrado' }, { status: 404 })
    }
    if (existing.usuario_id !== user.userId && !isAdmin(user)) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    await supabase.from('comunidad_post_comentarios').update({ oculto: true, updated_at: new Date().toISOString() }).eq('id', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error del servidor'
    }, { status: 500 })
  }
}

