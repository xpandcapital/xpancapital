import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthUser } from '@/lib/supabase/api-auth'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

let _cachedSupabase: ReturnType<typeof createClient> | null = null
function getSupabase() {
  if (_cachedSupabase) return _cachedSupabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  _cachedSupabase = createClient(supabaseUrl, supabaseServiceKey)
  return _cachedSupabase
}

const supabaseAdmin = new Proxy({} as any, {
  get(_: any, prop: string) {
    return getSupabase()[prop]
  }
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get('empresa_id') || DEFAULT_EMPRESA_ID
    const historial = searchParams.get('historial')

    if (historial === 'true') {
      const { data, error } = await supabaseAdmin
        .from('transmisiones')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('creado_en', { ascending: false })
        .limit(50)

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    }

    const { data, error } = await supabaseAdmin
      .from('transmisiones')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('activo', true)
      .gt('fin', new Date().toISOString())
      .order('creado_en', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth?.userId) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { titulo, subtitulo, link, texto_boton, duracion_minutos, paginas, tipo, color, productos_ids } = body

    if (!link || !duracion_minutos) {
      return NextResponse.json({ success: false, error: 'Link y duración requeridos' }, { status: 400 })
    }

    const inicio = new Date().toISOString()
    const fin = new Date(Date.now() + duracion_minutos * 60 * 1000).toISOString()

    // Desactivar cualquier transmisión activa previa
    await supabaseAdmin
      .from('transmisiones')
      .update({ activo: false, actualizado_en: new Date().toISOString() })
      .eq('empresa_id', auth.empresaId!)
      .eq('activo', true)

    const { data, error } = await supabaseAdmin
      .from('transmisiones')
      .insert({
        empresa_id: auth.empresaId!,
        tipo: tipo || 'publica',
        titulo: titulo || 'Estamos en vivo',
        subtitulo: subtitulo || null,
        link,
        texto_boton: texto_boton || 'Ver Transmisión',
        activo: true,
        duracion_minutos,
        inicio,
        fin,
        color: color || 'verde',
        paginas: paginas || ['landing', 'tienda', 'blog', 'miembros'],
        productos_ids: productos_ids || [],
        creado_por: auth.userId,
        creado_en: inicio,
        actualizado_en: inicio,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth?.userId) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { id, cancelar, extender_minutos } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 })
    }

    const ahora = new Date().toISOString()

    if (cancelar) {
      const { error } = await supabaseAdmin
        .from('transmisiones')
        .update({ activo: false, actualizado_en: ahora })
        .eq('id', id)
        .eq('empresa_id', auth.empresaId!)

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: { activo: false } })
    }

    if (extender_minutos && extender_minutos > 0) {
      const { data: transmision } = await supabaseAdmin
        .from('transmisiones')
        .select('fin, duracion_minutos')
        .eq('id', id)
        .eq('empresa_id', auth.empresaId!)
        .single()

      if (!transmision) {
        return NextResponse.json({ success: false, error: 'Transmisión no encontrada' }, { status: 404 })
      }

      const finActual = new Date(transmision.fin)
      const nuevoFin = new Date(finActual.getTime() + extender_minutos * 60 * 1000).toISOString()
      const nuevaDuracion = (transmision.duracion_minutos || 0) + extender_minutos

      const { error } = await supabaseAdmin
        .from('transmisiones')
        .update({ fin: nuevoFin, duracion_minutos: nuevaDuracion, actualizado_en: ahora })
        .eq('id', id)
        .eq('empresa_id', auth.empresaId!)

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: { fin: nuevoFin } })
    }

    return NextResponse.json({ success: false, error: 'Acción requerida: cancelar o extender_minutos' }, { status: 400 })
  } catch {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth?.userId) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('transmisiones')
      .delete()
      .eq('id', id)
      .eq('empresa_id', auth.empresaId!)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
