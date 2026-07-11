import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const empresaId = searchParams.get('empresa_id')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'user_id requerido' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: desbloqueados, error: desbloqErr } = await supabase
      .from('gamificacion_logros_usuarios')
      .select('*, logro:logro_id(id, nombre, descripcion, icono_svg, imagen_url, tipo, puntos_bonus)')
      .eq('user_id', userId)
      .order('desbloqueado_en', { ascending: false })

    if (desbloqErr) {
      return NextResponse.json({ success: false, error: desbloqErr.message }, { status: 400 })
    }

    const desbloqueadosIds = (desbloqueados || []).map(d => d.logro_id)
    const resolvedEmpresaId = empresaId || (desbloqueados?.[0]?.logro as any)?.empresa_id

    let disponibles: any[] = []
    if (resolvedEmpresaId) {
      const { data: allLogros, error: allErr } = await supabase
        .from('gamificacion_logros')
        .select('*')
        .eq('empresa_id', resolvedEmpresaId)
        .eq('activo', true)

      if (!allErr) {
        disponibles = (allLogros || []).filter(l => !desbloqueadosIds.includes(l.id))
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        desbloqueados: desbloqueados || [],
        disponibles,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
