import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

const MISSING_COLS_PATTERNS = ['certificado_template_id', 'imagen_principal', 'schema cache']

function stripMissingCols(data: Record<string, any>): Record<string, any> {
  const clean = { ...data }
  delete clean.certificado_template_id
  delete clean.imagen_principal
  return clean
}

function isMissingColError(error: { message?: string }): boolean {
  return MISSING_COLS_PATTERNS.some(p => error.message?.includes(p))
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    }

    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .order('creado_en', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Buscar productos vinculados (curso_id → producto.id + nombre)
    const linkedProductos = await supabase
      .from('productos')
      .select('id, curso_id, nombre')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .not('curso_id', 'is', null)

    const productMap = new Map()
    linkedProductos?.data?.forEach((p: any) => productMap.set(p.curso_id, { id: p.id, nombre: p.nombre }))

    const dataWithLinks = data.map(c => {
      const linked = productMap.get(c.id)
      return {
        ...c,
        linked_product_id: linked?.id || null,
        linked_product_name: linked?.nombre || null
      }
    })

    return NextResponse.json({ success: true, data: dataWithLinks })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    let {
      nombre, slug, descripcion, modulos, precio_coins, precio_usd,
      max_intentos, nota_aprobacion, certificado_template_id, imagen_principal,
      para_equipo, activo = true
    } = body

    if (!nombre || !slug) {
      return NextResponse.json({ error: 'Nombre y slug son requeridos' }, { status: 400 })
    }

    const { data: existingSlug } = await supabase
      .from('cursos')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    const insertData: Record<string, any> = {
      empresa_id: DEFAULT_EMPRESA_ID,
      nombre, slug, descripcion,
      modulos: modulos || [],
      precio_coins: precio_coins || 0,
      precio_usd: precio_usd || 0,
      max_intentos: max_intentos || 3,
      nota_aprobacion: nota_aprobacion || 70,
      para_equipo, activo
    }

    if (certificado_template_id) insertData.certificado_template_id = certificado_template_id
    if (imagen_principal) insertData.imagen_principal = imagen_principal

    const { data, error } = await supabase
      .from('cursos')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      if (isMissingColError(error)) {
        const cleanData = stripMissingCols(insertData)
        const { data: retryData, error: retryError } = await supabase
          .from('cursos')
          .insert(cleanData)
          .select()
          .single()

        if (retryError) {
          return NextResponse.json({ error: retryError.message }, { status: 500 })
        }
        return NextResponse.json({ success: true, data: retryData })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { id, vender_en_tienda, producto_id: _pid, link_producto_id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    if (updates.slug) {
      const { data: existing } = await supabase
        .from('cursos')
        .select('id')
        .eq('slug', updates.slug)
        .neq('id', id)
        .single()

      if (existing) {
        updates.slug = `${updates.slug}-${Date.now().toString(36)}`
      }
    }

    const { data, error } = await supabase
      .from('cursos')
      .update(updates)
      .eq('id', id)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .select()
      .single()

    if (error) {
      if (isMissingColError(error)) {
        const cleanUpdates = stripMissingCols(updates)
        const { data: retryData, error: retryError } = await supabase
          .from('cursos')
          .update(cleanUpdates)
          .eq('id', id)
          .eq('empresa_id', DEFAULT_EMPRESA_ID)
          .select()
          .single()

        if (retryError) {
          return NextResponse.json({ error: retryError.message }, { status: 500 })
        }
        return NextResponse.json({ success: true, data: retryData, producto_id: null })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Gestionar producto en tienda según toggle
    let producto_id = null
    const categoriaCursos = await supabase
      .from('producto_categorias')
      .select('id')
      .eq('slug', 'cursos')
      .maybeSingle()

    const categoriaId = categoriaCursos?.data?.id || null

    if (vender_en_tienda && data) {
      if (link_producto_id) {
        // Vincular curso a un producto existente elegido por el admin
        await supabase
          .from('productos')
          .update({ curso_id: data.id, tipo: 'servicio', categoria_id: categoriaId || undefined })
          .eq('id', link_producto_id)

        // Quitar curso_id de cualquier otro producto que apuntara a este curso
        await supabase
          .from('productos')
          .update({ curso_id: null })
          .eq('curso_id', data.id)
          .neq('id', link_producto_id)

        producto_id = link_producto_id
      } else {
        // UPSERT producto vinculado al curso (auto-crear)
        const productData = {
          empresa_id: DEFAULT_EMPRESA_ID,
          curso_id: data.id,
          nombre: data.nombre || 'Curso',
          precio_usd: data.precio_usd || 0,
          precio_coins: data.precio_coins || 0,
          imagen_principal: data.imagen_principal || null,
          tipo: 'servicio',
          activo: data.activo || false,
          categoria_id: categoriaId,
        }

        // Buscar si ya existe un producto vinculado
        const { data: existingProduct } = await supabase
          .from('productos')
          .select('id')
          .eq('curso_id', data.id)
          .maybeSingle()

        if (existingProduct) {
          await supabase.from('productos').update(productData).eq('id', existingProduct.id)
          producto_id = existingProduct.id
        } else {
          const slug = data.slug || data.nombre?.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          const { data: newProduct } = await supabase
            .from('productos')
            .insert({ ...productData, slug })
            .select('id')
            .single()
          if (newProduct) producto_id = newProduct.id
        }
      }
    } else if (vender_en_tienda === false) {
      // Desactivar y desvincular producto si existe
      const { data: existingProduct } = await supabase
        .from('productos')
        .select('id')
        .eq('curso_id', data.id)
        .maybeSingle()
      if (existingProduct) {
        await supabase.from('productos').update({ activo: false, curso_id: null }).eq('id', existingProduct.id)
      }
    }

    return NextResponse.json({ success: true, data, producto_id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 })
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
      .from('cursos')
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