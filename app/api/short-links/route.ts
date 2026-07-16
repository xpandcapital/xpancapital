import { supabase } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function generarCodigo(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function slugValido(s: string): boolean {
  return /^[a-z0-9]{3,20}$/.test(s)
}

// GET - Obtener todos los enlaces (admin)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('short_links')
      .select('*')
      .order('creado_en', { ascending: false })
      .limit(100)

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error' }, { status: 500 })
  }
}

// POST - Crear enlace corto
export async function POST(request: NextRequest) {
  try {
    const { url, codigo: customCodigo } = await request.json()
    if (!url) {
      return NextResponse.json({ success: false, error: 'URL requerida' }, { status: 400 })
    }

    // Si ya existe, devolver el existente
    const { data: existing } = await supabase
      .from('short_links')
      .select('codigo')
      .eq('url_destino', url)
      .single()

    if (existing) {
      return NextResponse.json({ success: true, codigo: existing.codigo, existente: true })
    }

    // Usar código personalizado si es válido y no está en uso
    let codigo = ''
    if (customCodigo && slugValido(customCodigo.toLowerCase())) {
      const { data: dupe } = await supabase
        .from('short_links')
        .select('id')
        .eq('codigo', customCodigo.toLowerCase())
        .single()
      if (dupe) {
        return NextResponse.json({ success: false, error: 'Ese código ya está en uso, elige otro' }, { status: 400 })
      }
      codigo = customCodigo.toLowerCase()
    } else {
      // Generar aleatorio
      let intentos = 0
      while (intentos < 10) {
        codigo = generarCodigo()
        const { data: dupe } = await supabase
          .from('short_links')
          .select('id')
          .eq('codigo', codigo)
          .single()
        if (!dupe) break
        intentos++
      }
    }

    const { error } = await supabase
      .from('short_links')
      .insert({ codigo, url_destino: url })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, codigo })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Actualizar código de un enlace
export async function PUT(request: NextRequest) {
  try {
    const { url, nuevo_codigo } = await request.json()
    if (!url || !nuevo_codigo) {
      return NextResponse.json({ success: false, error: 'URL y nuevo_codigo requeridos' }, { status: 400 })
    }
    const code = nuevo_codigo.toLowerCase()
    if (!slugValido(code)) {
      return NextResponse.json({ success: false, error: 'Código inválido (3-20 caracteres, solo letras y números)' }, { status: 400 })
    }

    // Verificar que el nuevo código no esté en uso por otro link
    const { data: dupe } = await supabase
      .from('short_links')
      .select('id, url_destino')
      .eq('codigo', code)
      .single()

    if (dupe && dupe.url_destino !== url) {
      return NextResponse.json({ success: false, error: 'Ese código ya está en uso' }, { status: 400 })
    }

    // Eliminar link viejo y crear nuevo
    await supabase.from('short_links').delete().eq('url_destino', url)
    await supabase.from('short_links').insert({ codigo: code, url_destino: url })

    return NextResponse.json({ success: true, codigo: code })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error' }, { status: 500 })
  }
}

// DELETE - Eliminar enlace
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const codigo = searchParams.get('codigo')
    if (!codigo) return NextResponse.json({ success: false, error: 'Código requerido' }, { status: 400 })

    await supabase.from('short_links').delete().eq('codigo', codigo)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Error' }, { status: 500 })
  }
}

