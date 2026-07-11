export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, isAdmin } from '@/lib/supabase/api-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const PAGE_SIZE = 12

function baseQuery() {
  return createClient(supabaseUrl, supabaseServiceKey)
    .from('comunidad_posts')
    .select(`
      id, empresa_id, autor_id, tipo, contenido, origen, origen_id,
      fijado, oculto, created_at, updated_at,
      autor:autor_id(id, nombre, apellido, avatar_url, rol),
      media:comunidad_post_media(id, post_id, tipo, url_original, url_comprimida, url_thumbnail, mime_type, nombre_archivo, tamaño_original, tamaño_comprimido, duracion_segundos, orden)
    `, { count: 'exact' })
}

async function enrichPosts(supabase: any, posts: any[], userId: string) {
  if (!posts.length) return posts

  const postIds: string[] = posts.map((p: any) => p.id)

  // Wave 1: queries independientes en paralelo
  const [
    { data: encuestas },
    { data: eventos },
    { data: reacciones },
    { data: comentariosCount },
  ] = await Promise.all([
    supabase.from('comunidad_encuestas').select('id, post_id, pregunta, multiple, fecha_cierre').in('post_id', postIds),
    supabase.from('comunidad_eventos').select('id, post_id, titulo, descripcion, imagen_url, fecha_inicio, fecha_fin, hora_inicio, hora_fin, ubicacion, ubicacion_url, es_digital, url_evento, tipo, capacidad').in('post_id', postIds),
    supabase.from('comunidad_post_reacciones').select('post_id, usuario_id, tipo').in('post_id', postIds),
    supabase.from('comunidad_post_comentarios').select('post_id', { count: 'exact', head: false }).in('post_id', postIds).eq('oculto', false),
  ])

  const encuestasList = (encuestas || []) as any[]
  const eventosList = (eventos || []) as any[]
  const reaccionesList = (reacciones || []) as any[]
  const comentariosCountList = (comentariosCount || []) as any[]

  // Wave 2: queries que dependen de wave 1
  const encuestaIds = encuestasList.map((e: any) => e.id)
  const eventoIds = eventosList.map((e: any) => e.id)

  const opcionesPromise = encuestaIds.length
    ? supabase.from('comunidad_encuesta_opciones').select('id, encuesta_id, texto, orden').in('encuesta_id', encuestaIds).order('orden')
    : Promise.resolve({ data: [] as any[] })

  const inscritosPromise = eventoIds.length
    ? supabase.from('comunidad_evento_inscritos').select('evento_id, usuario_id, estado').in('evento_id', eventoIds)
    : Promise.resolve({ data: [] as any[] })

  // Referencias en paralelo
  const productoIds = posts.filter((p: any) => p.origen === 'producto' && p.origen_id).map((p: any) => p.origen_id)
  const blogIds = posts.filter((p: any) => p.origen === 'blog' && p.origen_id).map((p: any) => p.origen_id)

  const productosPromise = productoIds.length
    ? supabase.from('productos').select('id, nombre, slug, imagen_principal, precio_usd').in('id', productoIds)
    : Promise.resolve({ data: [] as any[] })
  const blogPromise = blogIds.length
    ? supabase.from('blog_posts').select('id, titulo, slug, imagen_portada').in('id', blogIds)
    : Promise.resolve({ data: [] as any[] })

  const [
    { data: opciones },
    { data: inscritos },
    { data: productosRef },
    { data: blogRef },
  ] = await Promise.all([opcionesPromise, inscritosPromise, productosPromise, blogPromise])

  const opcionesList = (opciones || []) as any[]
  const inscritosList = (inscritos || []) as any[]
  const productosRefList = (productosRef || []) as any[]
  const blogRefList = (blogRef || []) as any[]

  // Wave 3: votos (depende de opciones)
  let votosData: any[] = []
  if (opcionesList.length) {
    const opcionIds = opcionesList.map((o: any) => o.id)
    const { data: v } = await supabase
      .from('comunidad_encuesta_votos')
      .select('opcion_id, usuario_id')
      .in('opcion_id', opcionIds)
    votosData = (v || []) as any[]
  }

  // Mapear encuestas
  const encuestaMap = new Map(encuestasList.map((e: any) => [e.post_id, e]))
  const opsByEncuesta = new Map<string, any[]>()
  opcionesList.forEach((o: any) => {
    if (!opsByEncuesta.has(o.encuesta_id)) opsByEncuesta.set(o.encuesta_id, [])
    const ops = opsByEncuesta.get(o.encuesta_id)!
    const votosCount = votosData.filter((v: any) => v.opcion_id === o.id).length
    const votada = votosData.some((v: any) => v.opcion_id === o.id && v.usuario_id === userId)
    ops.push({ ...o, votos_count: votosCount, votada })
  })

  // Mapear eventos
  const eventoMap = new Map(eventosList.map((e: any) => {
    const evtInscritos = inscritosList.filter((i: any) => i.evento_id === e.id)
    return [e.post_id, {
      ...e,
      inscritos_count: evtInscritos.length,
      usuario_inscrito: evtInscritos.some((i: any) => i.usuario_id === userId),
      usuario_estado: evtInscritos.find((i: any) => i.usuario_id === userId)?.estado
    }]
  }))

  // Mapear reacciones
  const reaccionesAgg = new Map<string, { tipo: string; count: number }[]>()
  reaccionesList.forEach((r: any) => {
    if (!reaccionesAgg.has(r.post_id)) reaccionesAgg.set(r.post_id, [])
    const arr = reaccionesAgg.get(r.post_id)!
    const existing = arr.find(a => a.tipo === r.tipo)
    if (existing) existing.count++
    else arr.push({ tipo: r.tipo, count: 1 })
  })

  const miReaccionMap = new Map<string, string | null>()
  reaccionesList.forEach((r: any) => {
    if (r.usuario_id === userId) miReaccionMap.set(r.post_id, r.tipo)
  })

  const comentariosCountMap = new Map<string, number>()
  comentariosCountList.forEach((c: any) => {
    comentariosCountMap.set(c.post_id, (comentariosCountMap.get(c.post_id) || 0) + 1)
  })

  const productoRefMap = new Map(productosRefList.map((p: any) => [p.id, p]))
  const blogRefMap = new Map(blogRefList.map((b: any) => [b.id, b]))

  return posts.map((post: any) => ({
    ...post,
    encuesta: encuestaMap.has(post.id) ? {
      ...encuestaMap.get(post.id)!,
      opciones: opsByEncuesta.get(encuestaMap.get(post.id)!.id) || [],
      total_votos: (opsByEncuesta.get(encuestaMap.get(post.id)!.id) || []).reduce((s: number, o: any) => s + (o.votos_count || 0), 0),
      usuario_voto: (opsByEncuesta.get(encuestaMap.get(post.id)!.id) || [])
        .filter((o: any) => o.votada).map((o: any) => o.id)
    } : undefined,
    evento: eventoMap.get(post.id),
    reacciones: reaccionesAgg.get(post.id) || [],
    mi_reaccion: miReaccionMap.get(post.id) || null,
    comentarios_count: comentariosCountMap.get(post.id) || 0,
    producto_ref: post.origen === 'producto' ? productoRefMap.get(post.origen_id) || null : null,
    blog_ref: post.origen === 'blog' ? blogRefMap.get(post.origen_id) || null : null
  }))
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const tipo = searchParams.get('tipo')
    const limit = parseInt(searchParams.get('limit') || String(PAGE_SIZE))

    let query = baseQuery().eq('empresa_id', user.empresaId).eq('oculto', false).order('fijado', { ascending: false }).order('created_at', { ascending: false })

    if (cursor) {
      query = query.lt('created_at', cursor)
    }
    if (tipo) {
      query = query.eq('tipo', tipo)
    }
    // TODO: re-activar cuando se ejecute migración 116 (es_evento_mentor)
    // if (esEventoMentor === 'true') {
    //   query = query.eq('es_evento_mentor', true)
    // }

    query = query.limit(limit)

    const { data: posts, error, count } = await query

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    const enriched = await enrichPosts(supabase, posts || [], user.userId)

    const nextCursor = enriched.length === limit ? enriched[enriched.length - 1]?.created_at : undefined

    return NextResponse.json({ success: true, data: enriched, count, cursor: nextCursor })
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

    const { tipo = 'post', contenido, encuesta, evento, media_ids } = body

    if (tipo === 'anuncio' && !isAdmin(user)) {
      return NextResponse.json({ success: false, error: 'Solo admins pueden crear anuncios' }, { status: 403 })
    }

    const { data: post, error: postError } = await supabase
      .from('comunidad_posts')
      .insert({
        empresa_id: user.empresaId,
        autor_id: user.userId,
        tipo,
        contenido: contenido || null,
        origen: 'manual'
      })
      .select()
      .single()

    if (postError) {
      return NextResponse.json({ success: false, error: postError.message }, { status: 400 })
    }

    // Vincular media existente
    if (media_ids?.length) {
      await supabase.from('comunidad_post_media').update({ post_id: post.id }).in('id', media_ids)
    }

    // Crear encuesta
    if (encuesta?.pregunta && encuesta?.opciones?.length >= 2) {
      const { data: enc, error: encError } = await supabase
        .from('comunidad_encuestas')
        .insert({
          post_id: post.id,
          pregunta: encuesta.pregunta,
          multiple: encuesta.multiple || false,
          fecha_cierre: encuesta.fecha_cierre || null
        })
        .select()
        .single()

      if (!encError && enc) {
        for (let i = 0; i < encuesta.opciones.length; i++) {
          await supabase.from('comunidad_encuesta_opciones').insert({
            encuesta_id: enc.id,
            texto: encuesta.opciones[i],
            orden: i
          })
        }
      }
    }

    // Crear evento
    if (evento?.titulo && evento?.fecha_inicio) {
      await supabase.from('comunidad_eventos').insert({
        post_id: post.id,
        titulo: evento.titulo,
        descripcion: evento.descripcion || null,
        imagen_url: evento.imagen_url || null,
        fecha_inicio: evento.fecha_inicio,
        fecha_fin: evento.fecha_fin || null,
        hora_inicio: evento.hora_inicio || null,
        hora_fin: evento.hora_fin || null,
        ubicacion: evento.ubicacion || null,
        ubicacion_url: evento.ubicacion_url || null,
        es_digital: evento.es_digital || false,
        url_evento: evento.url_evento || null,
        tipo: evento.tipo || 'presencial',
        capacidad: evento.capacidad || null
      })
    }

    const enriched = await enrichPosts(supabase, [post], user.userId)

    fetch(`${request.nextUrl.origin}/api/gamificacion/otorgar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.userId,
        empresa_id: user.empresaId,
        tipo: 'post_comunidad',
        referencia_tipo: 'comunidad_posts',
        referencia_id: post.id,
        descripcion: 'Post en la comunidad',
      }),
    }).catch(err => console.error('[gamificacion] Error otorgando puntos:', err))

    return NextResponse.json({ success: true, data: enriched[0] })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error del servidor'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 })
    }

    // Verificar autoría o admin
    const { data: existing } = await supabase.from('comunidad_posts').select('autor_id').eq('id', id).single()
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Post no encontrado' }, { status: 404 })
    }
    if (existing.autor_id !== user.userId && !isAdmin(user)) {
      return NextResponse.json({ success: false, error: 'No autorizado para editar' }, { status: 403 })
    }

    const allowed = ['contenido', 'fijado', 'oculto']
    const filtered: Record<string, any> = {}
    for (const key of allowed) {
      if (key in updates) filtered[key] = updates[key]
    }
    filtered.updated_at = new Date().toISOString()

    const { data: post, error } = await supabase.from('comunidad_posts').update(filtered).eq('id', id).select().single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    const enriched = await enrichPosts(supabase, [post], user.userId)

    return NextResponse.json({ success: true, data: enriched[0] })
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

    const { data: existing } = await supabase.from('comunidad_posts').select('autor_id').eq('id', id).single()
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Post no encontrado' }, { status: 404 })
    }
    if (existing.autor_id !== user.userId && !isAdmin(user)) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    // Soft-delete
    const { error } = await supabase.from('comunidad_posts').update({ oculto: true, updated_at: new Date().toISOString() }).eq('id', id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error del servidor'
    }, { status: 500 })
  }
}

