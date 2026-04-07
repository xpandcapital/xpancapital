import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    // Log environment check
    console.log('🔍 Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceKey,
      empresaId: DEFAULT_EMPRESA_ID
    })

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing Supabase configuration',
        details: { hasUrl: !!supabaseUrl, hasKey: !!supabaseServiceKey }
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all')

    console.log('📊 Fetching categories for empresa:', DEFAULT_EMPRESA_ID)

    // Simple query without filters first
    let query = supabase
      .from('producto_categorias')
      .select('*')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)

    if (all !== 'true') {
      query = query.eq('activo', true)
    }

    query = query.order('orden', { ascending: true })

    const { data, error } = await query

    if (error) {
      console.error('❌ Error fetching categories:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code
      }, { status: 500 })
    }

    console.log('✅ Categories fetched:', data?.length || 0)
    return NextResponse.json({ success: true, data: data || [] })
  } catch (err) {
    console.error('❌ Unexpected error in GET:', err)
    return NextResponse.json({ 
      success: false, 
      error: 'Server error', 
      details: err instanceof Error ? err.message : String(err) 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing Supabase configuration' 
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const body = await request.json()
    console.log('📥 POST body:', body)

    const { nombre, slug, descripcion, icono, color, sku_prefix, orden } = body

    if (!nombre) {
      return NextResponse.json({ 
        success: false, 
        error: 'El nombre es requerido' 
      }, { status: 400 })
    }

    // Generate slug
    const generatedSlug = slug || nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    console.log('📝 Generated slug:', generatedSlug)

    // Check if exists
    const { data: existing, error: checkError } = await supabase
      .from('producto_categorias')
      .select('id')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .eq('slug', generatedSlug)
      .maybeSingle()

    if (checkError) {
      console.error('❌ Error checking existing:', checkError)
    }

    if (existing) {
      return NextResponse.json({ 
        success: false, 
        error: 'Ya existe una categoría con ese nombre' 
      }, { status: 400 })
    }

    // Get max orden
    const { data: maxOrdenData } = await supabase
      .from('producto_categorias')
      .select('orden')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .order('orden', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextOrden = orden ?? ((maxOrdenData?.orden ?? -1) + 1)

    console.log('📝 Creating with orden:', nextOrden)

    // Insert
    const insertData = {
      empresa_id: DEFAULT_EMPRESA_ID,
      nombre,
      slug: generatedSlug,
      descripcion: descripcion || null,
      icono: icono || null,
      color: color || '#71717a',
      sku_prefix: sku_prefix || generatedSlug.substring(0, 3).toUpperCase(),
      orden: nextOrden,
      activo: true
    }

    console.log('📝 Insert data:', insertData)

    const { data, error } = await supabase
      .from('producto_categorias')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating category:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 })
    }

    console.log('✅ Category created:', data)
    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('❌ Unexpected error in POST:', err)
    return NextResponse.json({ 
      success: false, 
      error: 'Server error',
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: 'Missing configuration' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID es requerido' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('producto_categorias')
      .update(updates)
      .eq('id', id)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('❌ Error in PUT:', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: 'Missing configuration' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID es requerido' }, { status: 400 })
    }

    const { error } = await supabase
      .from('producto_categorias')
      .delete()
      .eq('id', id)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)

    if (error) {
      console.error('❌ Error deleting:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ Error in DELETE:', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
