import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

let _cachedSupabase: ReturnType<typeof createClient> | null = null
function getSupabase() {
  if (_cachedSupabase) return _cachedSupabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  _cachedSupabase = createClient(supabaseUrl, supabaseServiceKey)
  return _cachedSupabase
}

const supabase = new Proxy({} as any, {
  get(_: any, prop: string) {
    return getSupabase()[prop]
  }
})
// GET - Obtener un post por slug (con contenido)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get('empresa_id')
    const estado = searchParams.get('estado')
    const categoria = searchParams.get('categoria')
    const slug = searchParams.get('slug')
    const id = searchParams.get('id')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Si se solicita un post específico por slug o id
    if (slug || id) {
      const queryBuilder = supabase
        .from('blog_posts')
        .select('id, empresa_id, titulo, slug, contenido, extracto, seo_title, seo_description, imagen_portada, imagen_alt, estado, publicado_en, creado_en, es_premium, precio_coins, recompensa_segundos, recompensa_coins, vistas, tiempo_lectura_minutos, categoria_id, contrasena, visibilidad, sin_recompensa')

      const { data: post, error: singleError } = slug
        ? await queryBuilder.eq('slug', slug).single()
        : await queryBuilder.eq('id', id).single()

      if (singleError) {
        return NextResponse.json({ success: false, error: singleError.message }, { status: 400 })
      }

      // Obtener categoría
      let categoriaData = null
      if (post?.categoria_id) {
        const { data: cat } = await supabase
          .from('blog_categorias')
          .select('id, nombre, slug')
          .eq('id', post.categoria_id)
          .single()
        categoriaData = cat
      }

      return NextResponse.json({ 
        success: true, 
        data: [{ ...post, categoria: categoriaData }] 
      })
    }

    // Listar posts (sin contenido completo para performance)
    let query = supabase
      .from('blog_posts')
      .select('id, titulo, slug, extracto, imagen_portada, imagen_alt, estado, publicado_en, es_premium, precio_coins, recompensa_segundos, recompensa_coins, vistas, tiempo_lectura_minutos, creado_en, categoria_id, visibilidad, sin_recompensa', { count: 'exact' })
      .order('publicado_en', { ascending: false })

    if (empresaId) {
      query = query.eq('empresa_id', empresaId)
    }
    if (estado) {
      query = query.eq('estado', estado)
    }
    if (categoria) {
      query = query.eq('categoria_id', categoria)
    }

    query = query.range(offset, offset + limit - 1)

    const { data: posts, error, count } = await query

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    // Obtener categorías por separado
    const categoriaIds = [...new Set(posts?.map(p => p.categoria_id).filter(Boolean) || [])]
    const { data: categorias } = await supabase
      .from('blog_categorias')
      .select('id, nombre, slug')
      .in('id', categoriaIds)

    const categoriaMap = new Map(categorias?.map(c => [c.id, c]) || [])

    // Combinar datos
    const postsWithCategoria = posts?.map(post => ({
      ...post,
      categoria: post.categoria_id ? categoriaMap.get(post.categoria_id) || null : null
    })) || []

    return NextResponse.json({ success: true, data: postsWithCategoria, count })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// POST - Crear nuevo post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      empresa_id,
      titulo,
      slug,
      contenido,
      extracto,
      seo_title,
      seo_description,
      imagen_portada,
      imagen_alt,
      categoria_id,
      autor_id,
      estado,
      es_premium,
      metodo_pago,
      precio_coins,
      precio_usd,
      recompensa_segundos,
      recompensa_coins,
      contrasena,
      visibilidad,
      sin_recompensa,
      tags
    } = body

    // Generar slug si no se proporciona
    const generatedSlug = slug || titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Insertar post
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .insert({
        empresa_id,
        titulo,
        slug: generatedSlug,
        contenido,
        extracto: extracto?.substring(0, 200),
        seo_title,
        seo_description,
        imagen_portada,
        imagen_alt,
        categoria_id,
        autor_id,
        estado: estado || 'borrador',
        publicado_en: estado === 'publicado' ? new Date().toISOString() : null,
        es_premium: es_premium || false,
        metodo_pago: metodo_pago || 'coins',
        precio_coins: precio_coins || 0,
        precio_usd: precio_usd || 0,
        recompensa_segundos: recompensa_segundos || 60,
        recompensa_coins: recompensa_coins || 5,
        contrasena: contrasena || null,
        visibilidad: visibilidad || 'publico',
        sin_recompensa: sin_recompensa || false
      })
      .select()
      .single()

    if (postError) {
      return NextResponse.json({ success: false, error: postError.message }, { status: 400 })
    }

    // Insertar tags si existen
    if (tags && tags.length > 0 && empresa_id) {
      for (const tagName of tags) {
        // Buscar o crear tag
        const { data: existingTag } = await supabase
          .from('blog_tags')
          .select('id')
          .eq('empresa_id', empresa_id)
          .eq('nombre', tagName)
          .single()

        let tagId = existingTag?.id

        if (!tagId) {
          const tagSlug = tagName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')

          const { data: newTag } = await supabase
            .from('blog_tags')
            .insert({
              empresa_id,
              nombre: tagName,
              slug: tagSlug
            })
            .select()
            .single()
          
          tagId = newTag?.id
        }

        if (tagId && post?.id) {
          await supabase
            .from('blog_posts_tags')
            .insert({
              post_id: post.id,
              tag_id: tagId
            })
        }
      }
    }

    revalidateTag('blog-posts');
    return NextResponse.json({ success: true, data: post })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// PUT - Actualizar post
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, tags, empresa_id, ...updates } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 })
    }

    // Si se actualiza el estado a publicado
    if (updates.estado === 'publicado' && !updates.publicado_en) {
      updates.publicado_en = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    // Actualizar tags si se enviaron
    if (tags && Array.isArray(tags) && empresa_id) {
      // Eliminar relaciones existentes
      await supabase.from('blog_posts_tags').delete().eq('post_id', id)
      
      for (const tagName of tags) {
        if (!tagName || typeof tagName !== 'string') continue
        // Buscar o crear tag
        const { data: existingTag } = await supabase
          .from('blog_tags')
          .select('id')
          .eq('empresa_id', empresa_id)
          .eq('nombre', tagName)
          .single()

        let tagId = existingTag?.id
        if (!tagId) {
          const tagSlug = tagName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
          const { data: newTag } = await supabase
            .from('blog_tags')
            .insert({ empresa_id, nombre: tagName, slug: tagSlug })
            .select()
            .single()
          tagId = newTag?.id
        }
        if (tagId) {
          await supabase.from('blog_posts_tags').insert({ post_id: id, tag_id: tagId })
        }
      }
    }

    revalidateTag('blog-posts');
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// DELETE - Eliminar post
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 })
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    revalidateTag('blog-posts');
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
