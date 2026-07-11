export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { createClient } from '@supabase/supabase-js'
import { CertificateDocument } from '@/components/certificados/CertificateDocument'
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
    const certificadoId = searchParams.get('id')

    if (!certificadoId) {
      return NextResponse.json({ error: 'ID del certificado requerido' }, { status: 400 })
    }

    const { data: certificado, error: certError } = await supabase
      .from('certificados')
      .select(`
        *,
        curso:cursos(id, nombre),
        plantilla:certificado_plantillas(*)
      `)
      .eq('id', certificadoId)
      .single()

    if (certError || !certificado) {
      return NextResponse.json({ error: 'Certificado no encontrado' }, { status: 404 })
    }

    const { data: user } = await supabase
      .from('profiles')
      .select('nombre, apellido')
      .eq('id', certificado.user_id)
      .single()

    if (!certificado.plantilla) {
      const { data: defaultTemplate } = await supabase
        .from('certificado_plantillas')
        .select('*')
        .eq('empresa_id', DEFAULT_EMPRESA_ID)
        .eq('activo', true)
        .single()

      certificado.plantilla = defaultTemplate
    }

    const template = certificado.plantilla
    const certificateData = {
      nombre: certificado.nombre || `${user?.nombre || ''} ${user?.apellido || ''}`.trim(),
      cursoNombre: certificado.curso_nombre || certificado.curso?.nombre || 'Curso',
      fechaEmision: certificado.fecha_emision,
      codigoVerificacion: certificado.codigo_verificacion,
      horas: certificado.horas || 0
    }

    const doc = CertificateDocument({ 
      template: {
        ...template,
        ancho: template.ancho || 297,
        alto: template.alto || 210,
        color_fondo: template.color_fondo || '#0a0a0a',
        color_primario: template.color_primario || '#B10D24',
        color_secundario: template.color_secundario || '#10B981',
        color_texto: template.color_texto || '#ffffff',
        color_texto_secundario: template.color_texto_secundario || '#9ca3af',
        fuente_titulo: template.fuente_titulo || 'Inter',
        fuente_cuerpo: template.fuente_cuerpo || 'Inter',
        tamano_titulo: template.tamano_titulo || 48,
        tamano_cuerpo: template.tamano_cuerpo || 16,
        posicion_nombre: template.posicion_nombre || { x: 50, y: 45 },
        posicion_curso: template.posicion_curso || { x: 50, y: 55 },
        posicion_fecha: template.posicion_fecha || { x: 30, y: 80 },
        posicion_codigo: template.posicion_codigo || { x: 85, y: 90 },
        posicion_logo: template.posicion_logo || { x: 50, y: 15 },
        posicion_firma: template.posicion_firma || { x: 70, y: 75 },
        texto_titulo: template.texto_titulo || 'CERTIFICADO',
        texto_subtitulo: template.texto_subtitulo || 'Se certifica que',
        texto_completado: template.texto_completado || 'ha completado satisfactoriamente el curso',
        texto_fecha: template.texto_fecha || 'Fecha de emisión',
        texto_firma: template.texto_firma || 'Director Académico'
      },
      data: certificateData
    })

    const stream = await renderToStream(doc)
    const chunks: Uint8Array[] = []
    
    for await (const chunk of stream as AsyncIterable<Uint8Array>) {
      chunks.push(chunk)
    }
    
    const buffer = Buffer.concat(chunks)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificado-${certificado.codigo_verificacion}.pdf"`
      }
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Error al generar el PDF' }, { status: 500 })
  }
}
