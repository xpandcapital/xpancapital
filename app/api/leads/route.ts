import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'
import { createNotionPage } from '@/lib/integrations/notion'
import { logger } from '@/lib/utils/logger'
import { verifyTurnstileToken } from '@/lib/bot-protection'
import { cleanPhone } from '@/lib/phone'

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.blis-corp.com'

async function notifyAsesorViaWhatsApp(asesorId: string, lead: any) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: asesor } = await supabase.from('asesores').select('whatsapp').eq('id', asesorId).maybeSingle()
    if (!asesor?.whatsapp) return
    const { sendWhatsApp } = await import('@/lib/whatsapp')
    const msg = `🔔 *Nuevo Lead*\n\n*${lead.nombre}*\n📧 ${lead.email || 'Sin email'}\n📱 ${lead.telefono || 'Sin teléfono'}\n💰 ${lead.presupuesto || 'No especificado'}\n\n👉 ${appUrl}/superadmin/leads`
    await sendWhatsApp({ number: asesor.whatsapp, message: msg, empresaId: lead.empresa_id || DEFAULT_EMPRESA_ID })
  } catch {}
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Función para enviar notificaciones
async function sendNotifications(
  lead: Record<string, unknown>,
  campana: Record<string, unknown> | null,
  asesor: Record<string, unknown> | null
) {
  logger.debug('[NOTIFICATION] Nuevo lead:', {
    lead: lead.nombre,
    email: lead.email,
    campana: campana?.nombre || 'Sin campaña',
    asesor: asesor?.nombre || 'Sin asesor'
  })
  
  // Si hay campaña configurada para notificar
  if (campana) {
    // Notificar por email
    if (campana.notificar_email && Array.isArray(campana.emails_notificacion)) {
      for (const email of campana.emails_notificacion as string[]) {
        logger.debug(`[EMAIL] Enviando a ${email}: Nuevo lead - ${lead.nombre}`)
        // TODO: Implementar envío real con Resend/SendGrid
      }
    }
    
    // Notificar por WhatsApp
    if (campana.notificar_whatsapp && Array.isArray(campana.whatsapp_notificacion)) {
      for (const phone of campana.whatsapp_notificacion as string[]) {
        logger.debug(`[WHATSAPP] Enviando a ${phone}: Nuevo lead - ${lead.nombre}`)
        // TODO: Implementar envío real con Twilio/WhatsApp API
      }
    }
    
    // Sincronizar con Notion
    if (campana.notion_sync && campana.notion_database_id) {
      try {
        // Obtener API key de Notion desde la configuración
        const { data: integracion } = await getSupabase()
          .from('integraciones')
          .select('config')
          .eq('tipo', 'notion')
          .eq('activa', true)
          .single()
        
        const notionApiKey = integracion?.config?.api_key
        
        if (notionApiKey) {
          const result = await createNotionPage(
            {
              apiKey: notionApiKey,
              databaseId: campana.notion_database_id as string
            },
            {
              nombre: lead.nombre as string,
              email: lead.email as string,
              telefono: lead.telefono as string,
              whatsapp: lead.whatsapp as string,
              ciudad: lead.ciudad as string,
              presupuesto: lead.presupuesto as string,
              interes: lead.interes as string,
              mensaje: lead.mensaje as string,
              origen: lead.origen as string,
              campana: campana.nombre as string,
              asesor: asesor?.nombre as string
            }
          )
          
          if (result.success) {
            logger.debug(`[NOTION] Lead sincronizado: ${result.pageId}`)
          } else {
            logger.error(`[NOTION] Error: ${result.error}`)
          }
        } else {
          logger.warn('[NOTION] No hay API key configurada')
        }
      } catch (error) {
        logger.error('[NOTION] Error al sincronizar:', error)
      }
    }
  }
  
  // Si hay asesor asignado
  if (asesor) {
    if (asesor.whatsapp) {
      logger.debug(`[WHATSAPP] Notificando asesor ${asesor.nombre}: ${asesor.whatsapp}`)
    }
    if (asesor.email) {
      logger.debug(`[EMAIL] Notificando asesor ${asesor.nombre}: ${asesor.email}`)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    // Verificación Turnstile
    const token = body.cf_turnstile_response
    const { data: siteConfig } = await supabase.from('site_config').select('security_config').eq('empresa_id', DEFAULT_EMPRESA_ID).single()
    const bp = siteConfig?.security_config?.bot_protection
    if (bp?.habilitado && bp?.rutas?.some((r: { ruta: string; habilitado: boolean }) => r.habilitado && r.ruta === '/api/leads')) {
      const result = await verifyTurnstileToken(token, bp.secret_key)
      if (!result.success) return NextResponse.json({ success: false, error: 'Verificación de seguridad fallida' }, { status: 400 })
    }

    const { 
      nombre, 
      email, 
      telefono, 
      whatsapp,
      ciudad,
      presupuesto,
      interes,
      mensaje,
      datos,
      // Campos de campaña y asesor
      campana_id,
      asesor_id,
      template_id,
      // Campos de tracking
      fuente = 'formulario_web',
      utm_source,
      utm_medium,
      utm_campaign
    } = body

    const tel = cleanPhone(telefono || whatsapp, 'PE');

    if (!nombre || (!email && !telefono)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Nombre y email o teléfono son requeridos' 
      }, { status: 400 })
    }

    // Verificar si ya existe el lead por email o teléfono
    let existingQuery = supabase
      .from('leads')
      .select('id')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
    
    if (email) {
      existingQuery = existingQuery.eq('email', email)
    } else if (telefono) {
      existingQuery = existingQuery.eq('telefono', telefono)
    }

    const { data: existingLead } = await existingQuery.single()

    if (existingLead) {
      // Actualizar lead existente
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          nombre: nombre || undefined,
          telefono: tel || telefono || undefined,
          whatsapp: whatsapp || undefined,
          ciudad: ciudad || undefined,
          presupuesto: presupuesto || undefined,
          interes: interes || undefined,
          mensaje: mensaje || undefined,
          datos: datos || undefined,
          campana_id: campana_id || undefined,
          asesor_id: asesor_id || undefined,
          actualizado_en: new Date().toISOString()
        })
        .eq('id', existingLead.id)

      if (updateError) {
        console.error('Error updating lead:', updateError)
      }

      return NextResponse.json({ 
        success: true, 
        data: { id: existingLead.id, is_new: false },
        message: 'Lead actualizado correctamente'
      })
    }

    // Crear nuevo lead
    const { data: newLead, error } = await supabase
      .from('leads')
      .insert({
        empresa_id: DEFAULT_EMPRESA_ID,
        nombre,
        email,
        telefono: tel || telefono || null,
        whatsapp,
        ciudad,
        presupuesto,
        interes,
        mensaje,
        datos,
        campana_id,
        asesor_id,
        template_id,
        fuente,
        utm_source,
        utm_medium,
        utm_campaign,
        estado: 'nuevo',
        creado_en: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating lead:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Error al guardar lead' 
      }, { status: 500 })
    }

    // Obtener campaña y asesor para notificaciones
    let campana = null
    let asesor = null

    // Notificar asesor por WhatsApp si existe
    if (newLead && asesor_id) {
      notifyAsesorViaWhatsApp(asesor_id, newLead).catch(() => {})
    }

    if (campana_id) {
      const { data: campanaData } = await supabase
        .from('campanas')
        .select('*')
        .eq('id', campana_id)
        .single()
      campana = campanaData
    }

    if (asesor_id) {
      const { data: asesorData } = await supabase
        .from('asesores')
        .select('*')
        .eq('id', asesor_id)
        .single()
      asesor = asesorData
    }

    // Enviar notificaciones (async, no bloquea la respuesta)
    sendNotifications(newLead, campana, asesor).catch(console.error)

    return NextResponse.json({ 
      success: true, 
      data: { id: newLead.id, is_new: true },
      message: 'Lead creado correctamente'
    })

  } catch (error) {
    console.error('Error in leads API:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error del servidor' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const estado = searchParams.get('estado')
    const campana_id = searchParams.get('campana_id')
    const asesor_id = searchParams.get('asesor_id')
    const search = searchParams.get('search')
    const fecha_desde = searchParams.get('fecha_desde')
    const fecha_hasta = searchParams.get('fecha_hasta')

    const offset = (page - 1) * limit

    let query = supabase
      .from('leads')
      .select(`
        *,
        campana:campanas(id, nombre),
        asesor:asesores(id, nombre, email, telefono),
        template:templates(id, nombre, tipo_contenido)
      `, { count: 'exact' })
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .order('creado_en', { ascending: false })
      .range(offset, offset + limit - 1)

    if (estado) {
      query = query.eq('estado', estado)
    }

    if (campana_id) {
      query = query.eq('campana_id', campana_id)
    }

    if (asesor_id) {
      query = query.eq('asesor_id', asesor_id)
    }

    if (search) {
      query = query.or(`nombre.ilike.%${search}%,email.ilike.%${search}%,telefono.ilike.%${search}%`)
    }

    if (fecha_desde) {
      query = query.gte('creado_en', fecha_desde)
    }

    if (fecha_hasta) {
      query = query.lte('creado_en', fecha_hasta)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Error del servidor' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    
    const { id, estado, notas, etiquetas, asesor_id } = body
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID requerido' 
      }, { status: 400 })
    }

    const updates: Record<string, unknown> = { actualizado_en: new Date().toISOString() }
    
    if (estado) {
      updates.estado = estado
      if (estado === 'contactado') {
        updates.contactado_en = new Date().toISOString()
      } else if (estado === 'cliente') {
        updates.convertido_en = new Date().toISOString()
      }
    }
    
    if (notas !== undefined) updates.notas = notas
    if (etiquetas !== undefined) updates.etiquetas = etiquetas
    if (asesor_id !== undefined) updates.asesor_id = asesor_id

    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    if (data && data.asesor_id && estado) {
      notifyAsesorViaWhatsApp(data.asesor_id as string, data).catch(() => {})
    }

    return NextResponse.json({ 
      success: true, 
      data 
    })
  } catch (error) {
    console.error('Error updating lead:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error del servidor' 
    }, { status: 500 })
  }
}