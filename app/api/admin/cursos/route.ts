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
      .select(`
        id,
        nombre,
        slug,
        descripcion,
        precio_coins,
        precio_usd,
        activo,
        para_equipo,
        creado_en,
        imagen_principal
      `)
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

    const {
      nombre,
      slug,
      descripcion,
      modulos,
      precio_coins,
      precio_usd,
      max_intentos,
      nota_aprobacion,
      certificado_template_id,
      para_equipo,
      activo = true
    } = body

    if (!nombre || !slug) {
      return NextResponse.json({ error: 'Nombre y slug son requeridos' }, { status: 400 })
    }

    // Build insert object - only include columns that exist
    const insertData: Record<string, any> = {
      empresa_id: DEFAULT_EMPRESA_ID,
      nombre,
      slug,
      descripcion,
      modulos: modulos || [],
      precio_coins: precio_coins || 0,
      precio_usd: precio_usd || 0,
      max_intentos: max_intentos || 3,
      nota_aprobacion: nota_aprobacion || 70,
      para_equipo,
      activo
    }

    // Only include certificado_template_id if provided (column may not exist yet)
    if (certificado_template_id) {
      insertData.certificado_template_id = certificado_template_id
    }

    const { data, error } = await supabase
      .from('cursos')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      // If certificado_template_id column doesn't exist, retry without it
      if (error.message?.includes('certificado_template_id') || error.message?.includes('schema cache')) {
        delete insertData.certificado_template_id
        const { data: retryData, error: retryError } = await supabase
          .from('cursos')
          .insert(insertData)
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

    const { data, error } = await supabase
      .from('cursos')
      .update(updates)
      .eq('id', id)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .select()
      .single()

    if (error) {
      // If certificado_template_id column doesn't exist, retry without it
      if (error.message?.includes('certificado_template_id') || error.message?.includes('schema cache')) {
        const { certificado_template_id, ...cleanUpdates } = updates
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