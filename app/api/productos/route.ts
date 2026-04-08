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
        categoria:producto_categorias(id, nombre, slug, icono)
      `)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .order('creado_en', { ascending: false })

    if (all !== 'true') {
      query = query.eq('activo', true)
    }

    if (slug) {
      query = query.eq('slug', slug)
      const { data, error } = await query.single()
      
      if (error) {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
      }
      
      return NextResponse.json({ success: true, data })
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

    return NextResponse.json({ success: true, data })
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
      estado = 'borrador' // Estado inicial
    } = body

    if (!nombre || !slug) {
      return NextResponse.json({ error: 'Nombre y slug son requeridos' }, { status: 400 })
    }

    // Build insert object with only fields that exist
    const insertData: any = {
      empresa_id: DEFAULT_EMPRESA_ID,
      nombre,
      slug,
      descripcion,
      contenido,
      metodo_pago,
      precio_coins,
      precio_usd,
      tipo,
      categoria_id,
      imagen_principal,
      galeria,
      stock,
      stock_ilimitado,
      archivo_url,
      activo: false,
      destacado
    }
    
    // Only add optional fields if they exist in the database
    // These will be ignored by Supabase if columns don't exist
    if (sku !== undefined) insertData.sku = sku
    if (sku_prefix !== undefined) insertData.sku_prefix = sku_prefix
    if (is_auto_sku !== undefined) insertData.is_auto_sku = is_auto_sku

    const { data, error } = await supabase
      .from('productos')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
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

    return NextResponse.json({ success: true, data })
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