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

    return NextResponse.json({ success: true, data })
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
    const { id, ...updates } = body

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
        return NextResponse.json({ success: true, data: retryData })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
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