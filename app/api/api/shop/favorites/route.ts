import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('user_id')
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'user_id requerido' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Error de configuración' }, { status: 500 })
    }

    const { data, error } = await supabaseAdmin
      .from('favoritos')
      .select(`
        id,
        producto_id,
        agregado_en,
        productos!inner(id, titulo, imagenes, precio, precio_usd)
      `)
      .eq('user_id', userId)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const favorites = (data || []).map((item: any) => ({
      id: item.producto_id,
      title: item.productos?.titulo || '',
      image: item.productos?.imagenes?.[0] || '',
      price: item.productos?.precio || item.productos?.precio_usd || 0,
      agregado_en: item.agregado_en
    }))

    return NextResponse.json({ 
      success: true, 
      favorites 
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, products } = body
    
    if (!user_id) {
      return NextResponse.json({ success: false, error: 'user_id requerido' }, { status: 400 })
    }

    if (!Array.isArray(products)) {
      return NextResponse.json({ success: false, error: 'Formato inválido' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Error de configuración' }, { status: 500 })
    }

    const { data: currentFavorites } = await supabaseAdmin
      .from('favoritos')
      .select('producto_id')
      .eq('user_id', user_id)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)

    const currentIds = currentFavorites?.map((f: any) => f.producto_id) || []
    const toRemove = currentIds.filter((id: string) => !products.includes(id))
    const toAdd = products.filter((id: string) => !currentIds.includes(id))

    if (toRemove.length > 0) {
      await supabaseAdmin
        .from('favoritos')
        .delete()
        .eq('user_id', user_id)
        .eq('empresa_id', DEFAULT_EMPRESA_ID)
        .in('producto_id', toRemove)
    }

    if (toAdd.length > 0) {
      const insertData = toAdd.map(producto_id => ({
        user_id,
        empresa_id: DEFAULT_EMPRESA_ID,
        producto_id,
        agregado_en: new Date().toISOString()
      }))

      await supabaseAdmin
        .from('favoritos')
        .insert(insertData)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}