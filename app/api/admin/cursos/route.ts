import { supabase } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const all = searchParams.get('all')
    const limit = parseInt(searchParams.get('limit') || '100')

    let query = supabase.from('cursos').select('*').eq('empresa_id', DEFAULT_EMPRESA_ID).order('creado_en', { ascending: false })

    if (id) {
      const { data, error } = await supabase.from('cursos').select('*').eq('id', id).eq('empresa_id', DEFAULT_EMPRESA_ID).single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, data })
    }

    if (all !== 'true') query = query.limit(limit)
    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id: _id, ...courseData } = body

    courseData.empresa_id = DEFAULT_EMPRESA_ID
    courseData.creado_en = new Date().toISOString()

    const { data, error } = await supabase.from('cursos').insert(courseData).select('*').single()

    if (error) {
      if (error.code === '23505') {
        const { data: existing } = await supabase.from('cursos').select('*').eq('slug', courseData.slug).eq('empresa_id', DEFAULT_EMPRESA_ID).single()
        return NextResponse.json({ success: true, data: existing || null, producto_id: null })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Gestionar producto en tienda si se vinculó explícitamente
    let producto_id = null
    const categoriaCursos = await supabase.from('producto_categorias').select('id').eq('slug', 'cursos').maybeSingle()
    const categoriaId = categoriaCursos?.data?.id || null

    if (courseData.vender_en_tienda && data && courseData.link_producto_id) {
      // Vincular curso a un producto existente elegido por el admin (manual)
      await supabase.from('productos').update({ curso_id: data.id, tipo: 'servicio', categoria_id: categoriaId || undefined }).eq('id', courseData.link_producto_id)
      await supabase.from('productos').update({ curso_id: null }).eq('curso_id', data.id).neq('id', courseData.link_producto_id)
      producto_id = courseData.link_producto_id
    } else if (courseData.vender_en_tienda === false && data) {
      // Desvincular producto si existe
      const { data: existingProduct } = await supabase.from('productos').select('id').eq('curso_id', data.id).maybeSingle()
      if (existingProduct?.id) {
        await supabase.from('productos').update({ activo: false, curso_id: null }).eq('id', existingProduct.id)
      }
    }

    return NextResponse.json({ success: true, data, producto_id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, vender_en_tienda, producto_id: _pid, link_producto_id, precio_comparacion, descuento_porcentaje, ...updates } = body

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    if (precio_comparacion !== undefined) updates.precio_comparacion = precio_comparacion
    if (descuento_porcentaje !== undefined) updates.descuento_porcentaje = descuento_porcentaje

    let { data, error } = await supabase.from('cursos').update(updates).eq('id', id).select('*').single()

    if (error) {
      // Si el update falla por slug duplicado, reintentar sin slug
      if (error.code === '23505' && updates.slug) {
        const { slug, ...rest } = updates
        rest.slug = `${slug}-${Date.now().toString(36)}`
        const retry = await supabase.from('cursos').update(rest).eq('id', id).select('*').single()
        if (retry.error) return NextResponse.json({ error: retry.error.message }, { status: 500 })
        data = retry.data
      } else {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    if (!data) return NextResponse.json({ success: true, data: null, producto_id: null })

    // Gestionar producto en tienda solo si se vinculó explícitamente (sin auto-crear)
    let producto_id = null
    const categoriaCursos = await supabase.from('producto_categorias').select('id').eq('slug', 'cursos').maybeSingle()
    const categoriaId = categoriaCursos?.data?.id || null

    if (vender_en_tienda && data && link_producto_id) {
      await supabase.from('productos').update({ curso_id: data.id, tipo: 'servicio', categoria_id: categoriaId || undefined }).eq('id', link_producto_id)
      await supabase.from('productos').update({ curso_id: null }).eq('curso_id', data.id).neq('id', link_producto_id)
      producto_id = link_producto_id
    } else if (vender_en_tienda === false && data) {
      const { data: existingProduct } = await supabase.from('productos').select('id').eq('curso_id', data.id).maybeSingle()
      if (existingProduct?.id) {
        await supabase.from('productos').update({ activo: false, curso_id: null }).eq('id', existingProduct.id)
      }
    }

    return NextResponse.json({ success: true, data, producto_id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    const { error } = await supabase.from('cursos').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
