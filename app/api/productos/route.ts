import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    
    const categoriaId = searchParams.get('categoria_id')
    const slug = searchParams.get('slug')
    const destacado = searchParams.get('destacado')
    const limite = searchParams.get('limite')
    const all = searchParams.get('all') // Para superadmin

    let query = supabase
      .from('productos')
      .select(`
        *,
        categoria:producto_categorias(id, nombre, slug, icono),
        curso:cursos(id, nombre)
      `)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .order('creado_en', { ascending: false })

    if (all !== 'true') {
      query = query.eq('activo', true).eq('visible_en_tienda', true)
    }

    if (slug) {
      query = query.eq('slug', slug)
      const { data, error } = await query.single()
      
      if (error) {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
      }
      
      // Buscar short link asociado
      let shortSlug: string | null = null
      const { data: shortLink } = await supabase
        .from('short_links')
        .select('codigo')
        .eq('url_destino', `/tienda/producto/${slug}`)
        .single()
      if (shortLink) shortSlug = shortLink.codigo

      return NextResponse.json({ success: true, data, shortSlug })
    }

    if (categoriaId) {
      query = query.eq('categoria_id', categoriaId)
    }

    if (destacado === 'true') {
      query = query.eq('destacado', true)
    }

    if (limite) {
      query = query.limit(parseInt(limite))
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // ── Incluir short links asociados ──────────────────────────────────────────
    const shortLinksMap: Record<string, string> = {}
    if (data && data.length > 0) {
      const productoUrls = data.map((p: any) => `/tienda/producto/${p.slug}`)
      const { data: shortLinks } = await supabase
        .from('short_links')
        .select('codigo, url_destino')
        .in('url_destino', productoUrls)
      if (shortLinks) {
        for (const sl of shortLinks) {
          const slugMatch = sl.url_destino.match(/\/tienda\/producto\/(.+)$/)
          if (slugMatch) shortLinksMap[slugMatch[1]] = sl.codigo
        }
      }
    }

    return NextResponse.json({ success: true, data, shortLinksMap })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    const {
      nombre,
      slug,
      descripcion,
      contenido,
      metodo_pago = 'ambos',
      precio_coins,
      precio_usd,
      tipo = 'digital',
      categoria_id,
      imagen_principal,
      galeria,
      stock = 0,
      stock_ilimitado = true,
      archivo_url,
      activo = false, // Inicia como borrador
      destacado = false,
      sku,
      sku_prefix,
      is_auto_sku,
      precio_comparacion,
      descuento_porcentaje,
      descuento_hasta,
      tipo_descuento = 'porcentaje',
      stock_bajo_nivel,
      es_perecedero,
      fecha_compra,
      fecha_vencimiento,
      manejo_perecedero,
      lote_uid,
      meta_descripcion,
      meta_titulo,
      curso_id,
      precios_multimoneda,
      estado = 'borrador' // Estado inicial
    } = body

    if (!nombre || !slug) {
      return NextResponse.json({ error: 'Nombre y slug son requeridos' }, { status: 400 })
    }

    // Build insert object - SIEMPRE inicia como borrador
    const insertData: any = {
      empresa_id: DEFAULT_EMPRESA_ID,
      nombre,
      slug,
      descripcion,
      contenido,
      metodo_pago,
      precio_coins: precio_coins || 0,
      precio_usd: precio_usd || 0,
      tipo: tipo || 'digital',
      categoria_id,
      imagen_principal,
      galeria,
      stock: stock || 0,
      stock_ilimitado: stock_ilimitado ?? true,
      archivo_url,
      activo: activo ?? false,
      destacado: destacado ?? false,
      estado: activo ? 'activo' : 'borrador',
      // Campos opcionales con valores por defecto
      sku: sku || null,
      sku_prefix: sku_prefix || 'SKU',
      is_auto_sku: is_auto_sku ?? true,
      precio_comparacion: precio_comparacion || null,
      descuento_porcentaje: descuento_porcentaje || null,
      descuento_hasta: descuento_hasta || null,
      tipo_descuento: tipo_descuento || 'porcentaje',
      stock_bajo_nivel: stock_bajo_nivel || 10,
      es_perecedero: es_perecedero || false,
      fecha_compra: fecha_compra || null,
      fecha_vencimiento: fecha_vencimiento || null,
      manejo_perecedero: manejo_perecedero || null,
      lote_uid: lote_uid || null,
      meta_descripcion: meta_descripcion || null,
      meta_titulo: meta_titulo || null,
      curso_id: curso_id || null,
      precios_multimoneda: precios_multimoneda || {}
    }

    const { data, error } = await supabase
      .from('productos')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // ── Crear enlace corto automático ────────────────────────────────────────
    let shortSlug: string | null = null
    try {
      const productoUrl = `/tienda/producto/${slug}`
      const { data: existingLink } = await supabase
        .from('short_links')
        .select('codigo')
        .eq('url_destino', productoUrl)
        .single()

      if (existingLink) {
        shortSlug = existingLink.codigo
      } else {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
        let codigo = ''
        let intentos = 0
        while (intentos < 10) {
          codigo = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
          const { data: dupe } = await supabase
            .from('short_links')
            .select('id')
            .eq('codigo', codigo)
            .single()
          if (!dupe) break
          intentos++
        }
        const { error: shortError } = await supabase
          .from('short_links')
          .insert({ codigo, url_destino: productoUrl })
        if (!shortError) shortSlug = codigo
      }
    } catch { /* non-blocking */ }

    return NextResponse.json({ success: true, data, shortSlug })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    // ── Si cambia el slug, actualizar el short_link asociado ──────────────────
    if (updates.slug) {
      // Obtener el slug anterior
      const { data: prevProduct } = await supabase
        .from('productos')
        .select('slug')
        .eq('id', id)
        .single()

      if (prevProduct?.slug && prevProduct.slug !== updates.slug) {
        const oldUrl = `/tienda/producto/${prevProduct.slug}`
        const newUrl = `/tienda/producto/${updates.slug}`
        const { data: existingLink } = await supabase
          .from('short_links')
          .select('codigo')
          .eq('url_destino', oldUrl)
          .single()
        if (existingLink) {
          await supabase
            .from('short_links')
            .update({ url_destino: newUrl })
            .eq('codigo', existingLink.codigo)
        }
      }
    }

    // ── Si vincula a un curso, sincronizar bidireccionalmente ──────────────────
    if (updates.curso_id) {
      // Quitar curso_id de otros productos que apuntaran al mismo curso (1:1)
      await supabase
        .from('productos')
        .update({ curso_id: null })
        .eq('curso_id', updates.curso_id)
        .eq('empresa_id', DEFAULT_EMPRESA_ID)
        .neq('id', id)

      // Asegurar tipo y categoría compatibles con curso
      const { data: catCursos } = await supabase
        .from('producto_categorias')
        .select('id')
        .eq('slug', 'cursos')
        .eq('empresa_id', DEFAULT_EMPRESA_ID)
        .maybeSingle()

      if (!updates.tipo) updates.tipo = 'servicio'
      if (!updates.categoria_id && catCursos?.id) updates.categoria_id = catCursos.id
    }

    const { data, error } = await supabase
      .from('productos')
      .update(updates)
      .eq('id', id)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .select(`*, categoria:producto_categorias(id, nombre, slug)`)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Buscar short link actualizado
    let shortSlug: string | null = null
    if (data?.slug) {
      const { data: shortLink } = await supabase
        .from('short_links')
        .select('codigo')
        .eq('url_destino', `/tienda/producto/${data.slug}`)
        .single()
      if (shortLink) shortSlug = shortLink.codigo
    }

    return NextResponse.json({ success: true, data, shortSlug })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}