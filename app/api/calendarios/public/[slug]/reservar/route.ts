import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notifyNewLead } from '@/lib/whatsapp'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

let _cachedSupabase: ReturnType<typeof createClient> | null = null
function getSupabase() {
  if (_cachedSupabase) return _cachedSupabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  _cachedSupabase = createClient(supabaseUrl, supabaseServiceKey)
  return _cachedSupabase
}

const supabase = new Proxy({} as any, {
  get(_: any, prop: string) {
    return getSupabase()[prop]
  }
})

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    if (!slug) return NextResponse.json({ error: 'Slug requerido' }, { status: 400 })

    const body = await request.json()
    const { nombre, email, telefono, fecha, hora_inicio, hora_fin, datos, lead_id } = body
    if (!fecha || !hora_inicio) {
      return NextResponse.json({ error: 'Fecha y hora requeridas' }, { status: 400 })
    }

    // Buscar calendario por slug
    const { data: calendario, error: calError } = await supabase
      .from('calendarios')
      .select('*, campana:campanas(id,tipo_captura,asesor_id,producto_id)')
      .eq('slug', slug)
      .single()
    if (calError || !calendario) {
      return NextResponse.json({ error: 'Calendario no encontrado' }, { status: 404 })
    }

    const empresaId = calendario.empresa_id || DEFAULT_EMPRESA_ID

    // Si viene lead_id, actualizar lead existente
    let lead = null
    if (lead_id) {
      const { data: existing } = await supabase.from('leads').select('id').eq('id', lead_id).single()
      if (existing) lead = existing
    }

    // Si no hay lead_id pero hay email, buscar lead existente
    if (!lead && email) {
      const { data: existing } = await supabase
        .from('leads').select('id').eq('email', email).eq('empresa_id', empresaId)
        .order('creado_en', { ascending: false }).limit(1).maybeSingle()
      if (existing) lead = existing
    }

    // Si no existe, crear lead nuevo
    if (!lead && (nombre || email)) {
      const { data: newLead, error: leadError } = await supabase
        .from('leads').insert({
          empresa_id: empresaId,
          campana_id: calendario.campana?.id || null,
          nombre: nombre || 'Sin nombre',
          email: email || null,
          telefono: telefono || null,
          estado: 'nuevo',
          fuente: 'calendario',
          datos: datos || {},
        }).select().single()
      if (!leadError && newLead) lead = newLead
    }

    // Validar disponibilidad
    if (lead) {
      const { count } = await supabase
        .from('reservas').select('id', { count: 'exact', head: true })
        .eq('calendario_id', calendario.id).eq('fecha', fecha)
        .eq('hora_inicio', hora_inicio).neq('estado', 'cancelada')
      if (count && count > 0) {
        return NextResponse.json({ error: 'Horario no disponible' }, { status: 409 })
      }
    }

    // Crear reserva
    const { data: reserva, error: resError } = await supabase
      .from('reservas').insert({
        empresa_id: empresaId,
        lead_id: lead?.id || null,
        calendario_id: calendario.id,
        fecha, hora_inicio, hora_fin: hora_fin || hora_inicio,
        estado: 'pendiente',
        datos: datos || {},
      }).select().single()
    if (resError || !reserva) {
      return NextResponse.json({ error: resError?.message || 'Error al crear reserva' }, { status: 500 })
    }

    // Notificar asesor por WhatsApp
    if (calendario.campana?.asesor_id && telefono) {
      const { data: asesor } = await supabase
        .from('asesores').select('whatsapp').eq('id', calendario.campana.asesor_id).single()
      if (asesor?.whatsapp) {
        notifyNewLead(nombre || 'Nuevo lead', email || '', telefono, asesor.whatsapp, undefined, empresaId).catch(() => {})
      }
    }

    // Si la campaña tiene producto, devolver URL de checkout
    let redirectUrl: string | null = null
    if (calendario.campana?.producto_id) {
      redirectUrl = `/tienda/producto?id=${calendario.campana.producto_id}&lead_id=${lead?.id || ''}&reserva_id=${reserva.id}&email=${encodeURIComponent(email || '')}`
    }

    return NextResponse.json({
      success: true,
      data: { lead, reserva, redirectUrl },
    })
  } catch (error) {
    console.error('[reservar] Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
