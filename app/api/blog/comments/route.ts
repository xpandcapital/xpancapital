export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// GET - Listar comentarios deun post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('post_id')

    if (!postId) {
      return NextResponse.json({ success: false, error: 'post_id requerido' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('blog_comments')
      .select(`
        id,
        contenido,
        estado,
        creado_en,
        actualizado_en,
        padre_id,
        user:profiles(id, nombre, apellido, avatar_url)
      `)
      .eq('post_id', postId)
      .eq('estado', 'activo')
      .order('creado_en', { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    // Organizar comentarios en estructura jerárquica
    const commentsMap = new Map()
    const rootComments:unknown[] = []

    data.forEach((comment: Record<string, unknown>) => {
      commentsMap.set((comment as { id: string }).id, { ...comment, respuestas: [] })
    })

    data.forEach((comment: Record<string, unknown>) => {
      const commentWithReplies = commentsMap.get((comment as { id: string }).id)
      if ((comment as { padre_id: string | null }).padre_id) {
        const parent = commentsMap.get((comment as { padre_id: string | null }).padre_id)
        if (parent) {
          (parent as { respuestas: unknown[] }).respuestas.push(commentWithReplies)
        }
      } else {
        rootComments.push(commentWithReplies)
      }
    })

    return NextResponse.json({ success: true, data: rootComments })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 })
  }
}

// POST - Crear comentario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { empresa_id, post_id, user_id, contenido, padre_id } = body

    if (!empresa_id || !post_id || !user_id || !contenido) {
      return NextResponse.json({ 
        success: false, 
        error: 'empresa_id, post_id, user_id y contenido son requeridos' 
      }, { status: 400 })
    }

    // Verificar que el usuario existe
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, nombre, apellido')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Crear comentario
    const { data, error } = await supabase
      .from('blog_comments')
      .insert({
        empresa_id,
        post_id,
        user_id,
        contenido,
        padre_id: padre_id || null,
        estado: 'activo'
      })
      .select(`
        id,
        contenido,
        estado,
        creado_en,
        actualizado_en,
        padre_id,
        user:profiles(id, nombre, apellido, avatar_url)
      `)
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL!.replace('/rest/v1', '')}/api/gamificacion/otorgar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id,
        empresa_id,
        tipo: 'comentario_blog',
        referencia_tipo: 'blog_comments',
        referencia_id: data.id,
        descripcion: 'Comentario en el blog',
      }),
    }).catch(err => console.error('[gamificacion] Error otorgando puntos:', err))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 })
  }
}

// PUT - Actualizar comentario
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, user_id, contenido, estado } = body

    if (!id || !user_id) {
      return NextResponse.json({ success: false, error: 'id y user_id son requeridos' }, { status: 400 })
    }

    // Verificar que el comentario pertenece al usuario
    const { data: existingComment, error: fetchError } = await supabase
      .from('blog_comments')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingComment) {
      return NextResponse.json({ success: false, error: 'Comentario no encontrado' }, { status: 404 })
    }

    if (existingComment.user_id !== user_id) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    const updates: any = { actualizado_en: new Date().toISOString() }
    if (contenido) updates.contenido = contenido
    if (estado) updates.estado = estado

    const { data, error } = await supabase
      .from('blog_comments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 })
  }
}

// DELETE - Eliminar comentario
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('user_id')

    if (!id || !userId) {
      return NextResponse.json({ success: false, error: 'id y user_id son requeridos' }, { status: 400 })
    }

    // Verificar que el comentario pertenece al usuario
    const { data: existingComment, error: fetchError } = await supabase
      .from('blog_comments')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingComment) {
      return NextResponse.json({ success: false, error: 'Comentario no encontrado' }, { status: 404 })
    }

    if (existingComment.user_id !== userId) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    const { error } = await supabase
      .from('blog_comments')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 })
  }
}
