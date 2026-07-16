import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { cleanPhone } from '@/lib/phone'
import { notifyAsesor, NTemplates } from '@/lib/notifications'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'


export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const slug = url.pathname.split('/').filter(Boolean).pop()
    if (!slug) return NextResponse.json({ error: 'Slug requerido' }, { status: 400 })

    const body = await request.json()

    // Buscar formulario por slug (solo publicados)
    const { data: form, error: formErr } = await supabase
      .from('formularios')
      .select('*')
      .eq('slug', slug)
      .eq('estado', 'publicado')
      .single()

    if (formErr || !form) {
      return NextResponse.json({ error: 'Formulario no encontrado' }, { status: 404 })
    }

    const empresaId = form.empresa_id || DEFAULT_EMPRESA_ID

    // Mapear campos del formulario → datos del lead
    const campos = form.campos || []
    const nombre = body.nombre || body.name || body.f_name || ''
    const email = body.email || body.f_email || ''
    const telefono = cleanPhone(body.telefono || body.phone || body.f_phone, 'PE') || body.telefono || body.phone || null
    const whatsapp = cleanPhone(body.whatsapp || body.f_whatsapp, 'PE') || body.whatsapp || null

    // El resto de campos van a datos JSONB
    const datos: Record<string, any> = {}
    for (const campo of campos) {
      const key = campo.key || campo.name || campo.label
      if (!key) continue
      const val = body[key]
      if (val !== undefined && !['nombre', 'name', 'f_name', 'email', 'f_email', 'telefono', 'phone', 'f_phone', 'whatsapp'].includes(key)) {
        datos[key] = val
      }
    }

    const campana_id = form.campana_id || null
    let asesor_id = null

    // Si el formulario pertenece a una campaña, heredar asesor de la campaña
    if (campana_id) {
      const { data: campana } = await supabase
        .from('campanas').select('asesor_id').eq('id', campana_id).single()
      if (campana?.asesor_id) asesor_id = campana.asesor_id
    }

    // Crear lead
    const { data: lead, error: leadErr } = await supabase
      .from('leads')
      .insert({
        empresa_id: empresaId,
        campana_id,
        asesor_id,
        nombre: nombre || 'Sin nombre',
        email: email || null,
        telefono,
        whatsapp,
        datos,
        estado: 'nuevo',
        fuente: 'formulario_web',
        origen: form.nombre || slug,
      })
      .select()
      .single()

    if (leadErr) {
      return NextResponse.json({ error: leadErr.message }, { status: 500 })
    }

    // Incrementar contador de respuestas
    await supabase
      .from('formularios')
      .update({ respuestas: (form.respuestas || 0) + 1 })
      .eq('id', form.id)

    // Notificar asesor si existe
    if (asesor_id && lead) {
      const t = NTemplates.nuevo_lead(lead)
      notifyAsesor(asesor_id, t.titulo, t.mensaje, t.link).catch(() => {})
    }

    // Procesar pasos de flujo (webhook, email, redirect)
    let redirectUrl: string | null = null
    if (form.pasos_flujo && Array.isArray(form.pasos_flujo)) {
      for (const paso of form.pasos_flujo) {
        if (paso.tipo === 'redirect' && paso.url) {
          redirectUrl = paso.url
        }
        if (paso.tipo === 'webhook' && paso.url) {
          fetch(paso.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lead, form: { id: form.id, nombre: form.nombre } }),
          }).catch(() => {})
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: { lead_id: lead.id, redirectUrl },
    })
  } catch (error) {
    console.error('[Formulario Submit] Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
