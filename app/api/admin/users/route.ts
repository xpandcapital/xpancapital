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

    const id = searchParams.get('id')

    if (id) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nombre, apellido, email, telefono, rol, xpand_coins, total_referidos, creado_en, avatar_url, puntos_cursos, puntos_comunidad, puntos_blog')
        .eq('id', id)
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    }

    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('per_page') || searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const rol = searchParams.get('rol')
    const empresaId = searchParams.get('empresa_id') || DEFAULT_EMPRESA_ID

    let query = supabase
      .from('profiles')
      .select('id, nombre, apellido, email, telefono, rol, xpand_coins, total_referidos, creado_en, avatar_url, puntos_cursos, puntos_comunidad, puntos_blog', { count: 'exact' })
      .eq('empresa_id', empresaId)
      .order('creado_en', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1)

    if (search) {
      query = query.or(`nombre.ilike.%${search}%,apellido.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (rol) {
      query = query.eq('rol', rol)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      total: count,
      totalPages: Math.ceil((count || 0) / perPage),
      page,
      perPage
    })
  } catch (error) {
    console.error('Admin users error:', error)
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
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Admin update user error:', error)
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
      .from('profiles')
      .delete()
      .eq('id', id)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin delete user error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}