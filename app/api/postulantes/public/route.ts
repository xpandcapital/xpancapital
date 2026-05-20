import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { verifyTurnstileToken } from '@/lib/bot-protection'

const EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    // Verificación Turnstile
    const serviceSupabase = createServiceClient(supabaseUrl, supabaseServiceKey)
    const token = body.cf_turnstile_response
    const { data: siteConfig } = await serviceSupabase.from('site_config').select('security_config').eq('empresa_id', EMPRESA_ID).single()
    const bp = siteConfig?.security_config?.bot_protection
    if (bp?.habilitado && bp?.rutas?.some((r: { ruta: string; habilitado: boolean }) => r.habilitado && r.ruta === '/api/postulantes/public')) {
      const result = await verifyTurnstileToken(token, bp.secret_key)
      if (!result.success) return NextResponse.json({ error: 'Verificación de seguridad fallida' }, { status: 400 })
    }

    const { respuestas, ...fields } = body

    const correo = fields.correo_contacto || fields.email || ''
    if (!correo) {
      return NextResponse.json({ error: 'Correo electrónico es requerido' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('postulantes')
      .select('id')
      .eq('correo_contacto', correo)
      .eq('empresa_id', EMPRESA_ID)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Ya existe una postulación con este correo electrónico', existingId: existing.id }, { status: 409 })
    }

    const postulanteData: Record<string, any> = {
      empresa_id: EMPRESA_ID,
      nombre_completo: fields.nombre_completo || '',
      correo_contacto: correo,
      celular_contacto: fields.celular_contacto || '',
      puesto_trabajo_id: fields.puesto_trabajo_id || null,
      puesto_postula: fields.puesto_postula || '',
      estado: 'nuevo',
    }

    const flatFields = [
      'apodo_preferido', 'fecha_nacimiento', 'estado_civil', 'lugar_residencia',
      'tiempo_residencia', 'personas_cargo', 'apoyo_familiar', 'licencia_vehiculo',
      'transporte_trabajo', 'acceso_tecnologia', 'disponibilidad_inmediata',
      'disponibilidad_viaje', 'disponibilidad_horarios', 'compromisos_horarios',
      'horario_preferido', 'condicion_medica', 'nivel_estudios', 'capacitaciones_recientes',
      'herramientas_dominadas', 'cv_archivo', 'check_portafolio', 'link_portafolio',
      'aspiracion_salarial', 'experiencia_reciente', 'motivo_cambio_empleo',
      'resolucion_problemas', 'manejo_errores', 'trabajo_equipo', 'preferencia_trabajo',
      'descripcion_tres_palabras', 'manejo_estres', 'manejo_cambios', 'areas_mejora',
      'actualizacion_profesional', 'pasatiempos', 'conocimiento_empresa', 'porque_contratar',
      'motivacion_laboral', 'motivacion_largo_plazo', 'roles_disfrutados',
      'preguntas_candidato', 'informacion_adicional',
    ]

    for (const key of flatFields) {
      if (fields[key] !== undefined && fields[key] !== '') {
        postulanteData[key] = fields[key]
      }
    }

    const { data: postulante, error: postulanteError } = await supabase
      .from('postulantes')
      .insert(postulanteData)
      .select()
      .single()

    if (postulanteError) {
      return NextResponse.json({ error: postulanteError.message }, { status: 500 })
    }

    if (respuestas && respuestas.length > 0 && fields.puesto_trabajo_id) {
      const respuestaRows = respuestas.map((r: { pregunta_id: string; valor: string }) => ({
        postulante_id: postulante.id,
        pregunta_id: r.pregunta_id,
        puesto_id: fields.puesto_trabajo_id,
        valor: r.valor || '',
      }))

      const { error: respError } = await supabase
        .from('postulante_respuestas')
        .insert(respuestaRows)

      if (respError) {
        console.error('Error saving respuestas:', respError)
      }
    }

    return NextResponse.json({ success: true, data: postulante })
  } catch (error: any) {
    console.error('[API Error] /api/postulantes/public:', error)
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}