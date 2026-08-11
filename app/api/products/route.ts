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
    
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit')
    
    let query = supabase
      .from('productos')
      .select(`
        id,
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
        imagen_alt,
        galeria,
        stock,
        stock_ilimitado,
        activo,
        destacado,
        creado_en,
        actualizado_en,
        producto_categorias ( id, nombre, slug )
      `)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .eq('activo', true)
      .order('destacado', { ascending: false })
      .order('creado_en', { ascending: false })
    
    if (category) {
      query = query.eq('categoria_id', category)
    }
    
    if (type) {
      query = query.eq('tipo', type)
    }
    
    if (featured === 'true') {
      query = query.eq('destacado', true)
    }
    
    if (limit) {
      query = query.limit(parseInt(limit))
    }
    
    const { data, error } = await query
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    const products = (data || []).map((p: any) => ({
      id: p.id,
      title: p.nombre,
      slug: p.slug,
      category: p.producto_categorias?.nombre || 'General',
      categoryId: p.categoria_id,
      productType: p.tipo === 'digital' ? 'curso' : p.tipo === 'fisico' ? 'kit' : p.tipo,
      price: Number(p.precio_usd) || 0,
      coinsPrice: p.precio_coins || 0,
      originalPrice: undefined,
      rating: 4.8,
      sales: '+0',
      image: p.imagen_principal || '/images/placeholder.svg',
      images: Array.isArray(p.galeria) ? p.galeria : [],
      description: p.descripcion || '',
      content: p.contenido || '',
      isHot: p.destacado,
      stock: p.stock_ilimitado ? undefined : p.stock,
      isCourse: p.tipo === 'digital',
      metodoPago: p.metodo_pago,
      reviews: []
    }))
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    
    const { nombre, slug, descripcion, precio_usd, precio_coins, tipo, categoria_id, imagen_principal, galeria, stock, stock_ilimitado, destacado } = body
    
    if (!nombre || !slug) {
      return NextResponse.json({ error: 'Nombre y slug son requeridos' }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from('productos')
      .insert({
        empresa_id: DEFAULT_EMPRESA_ID,
        nombre,
        slug,
        descripcion,
        precio_usd: precio_usd || 0,
        precio_coins: precio_coins || 0,
        tipo: tipo || 'digital',
        categoria_id,
        imagen_principal,
        galeria: galeria || [],
        stock: stock || 0,
        stock_ilimitado: stock_ilimitado ?? true,
        activo: true,
        destacado: destacado ?? false
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}