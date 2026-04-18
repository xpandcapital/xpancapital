import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae';

const SEARCHABLE_FIELDS = [
  'nombre_completo', 'correo_contacto', 'puesto_postula', 
  'proyecto_interesado', 'lugar_residencia', 'estado'
];

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);

    const empresaId = searchParams.get('empresa_id') || EMPRESA_ID;
    const estado = searchParams.get('estado');
    const search = searchParams.get('search');

    let query = supabase
      .from('postulantes')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('creado_en', { ascending: false });

    if (estado) query = query.eq('estado', estado);

    if (search) {
      query = query.or(`nombre_completo.ilike.%${search}%,correo_contacto.ilike.%${search}%,puesto_postula.ilike.%${search}%,lugar_residencia.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API Error] /api/postulantes:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const empresaId = body.empresa_id || EMPRESA_ID;

    // Map old fields to new fields for backward compatibility
    const mapped = {
      empresa_id: empresaId,
      nombre_completo: body.nombre_completo || body.nombre || '',
      correo_contacto: body.correo_contacto || body.email || '',
      puesto_postula: body.puesto_postula || body.puesto || '',
      celular_contacto: body.celular_contacto || body.telefono || '',
      estado: body.estado || 'nuevo',
      // New fields - pass through directly
      apodo_preferido: body.apodo_preferido,
      fecha_nacimiento: body.fecha_nacimiento,
      estado_civil: body.estado_civil,
      lugar_residencia: body.lugar_residencia,
      tiempo_residencia: body.tiempo_residencia,
      personas_cargo: body.personas_cargo,
      apoyo_familiar: body.apoyo_familiar,
      licencia_vehiculo: body.licencia_vehiculo,
      transporte_trabajo: body.transporte_trabajo,
      acceso_tecnologia: body.acceso_tecnologia,
      disponibilidad_inmediata: body.disponibilidad_inmediata,
      disponibilidad_viaje: body.disponibilidad_viaje,
      disponibilidad_horarios: body.disponibilidad_horarios,
      compromisos_horarios: body.compromisos_horarios,
      horario_preferido: body.horario_preferido,
      condicion_medica: body.condicion_medica,
      nivel_estudios: body.nivel_estudios,
      capacitaciones_recientes: body.capacitaciones_recientes,
      herramientas_dominadas: body.herramientas_dominadas,
      cv_archivo: body.cv_archivo,
      check_portafolio: body.check_portafolio,
      link_portafolio: body.link_portafolio,
      aspiracion_salarial: body.aspiracion_salarial,
      experiencia_reciente: body.experiencia_reciente,
      motivo_cambio_empleo: body.motivo_cambio_empleo,
      resolucion_problemas: body.resolucion_problemas,
      manejo_errores: body.manejo_errores,
      trabajo_equipo: body.trabajo_equipo,
      preferencia_trabajo: body.preferencia_trabajo,
      descripcion_tres_palabras: body.descripcion_tres_palabras,
      manejo_estres: body.manejo_estres,
      manejo_cambios: body.manejo_cambios,
      areas_mejora: body.areas_mejora,
      actualizacion_profesional: body.actualizacion_profesional,
      pasatiempos: body.pasatiempos,
      conocimiento_empresa: body.conocimiento_empresa,
      porque_contratar: body.porque_contratar,
      motivacion_laboral: body.motivacion_laboral,
      motivacion_largo_plazo: body.motivacion_largo_plazo,
      roles_disfrutados: body.roles_disfrutados,
      preguntas_candidato: body.preguntas_candidato,
      informacion_adicional: body.informacion_adicional,
      proyecto_interesado: body.proyecto_interesado,
      calificacion: body.calificacion,
      fecha_entrevista: body.fecha_entrevista,
      entrevista_tipo: body.entrevista_tipo,
      entrevista_notas: body.entrevista_notas,
    };

    const { data, error } = await supabase
      .from('postulantes')
      .insert(mapped)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API Error] /api/postulantes:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const body = await request.json();
    const { ...updates } = body;
    updates.actualizado_en = new Date().toISOString();

    const { data, error } = await supabase
      .from('postulantes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Auto-create team member when postulante is accepted
    if (updates.estado === 'aceptado' && data) {
      const postulante = data;
      // Check if advisor already exists for this postulante
      const { data: existingAdvisor } = await supabase
        .from('advisors')
        .select('id')
        .eq('postulante_id', postulante.id)
        .single();

      if (!existingAdvisor) {
        await supabase
          .from('advisors')
          .insert({
            name: postulante.nombre_completo || postulante.nombre || 'Sin nombre',
            email: postulante.correo_contacto || postulante.email || '',
            phone: postulante.celular_contacto || postulante.telefono || '',
            phone_code: '+593',
            postulante_id: postulante.id,
            aceptado_en: new Date().toISOString(),
            is_active: true,
            notes: `Creado automáticamente desde postulante aceptado. Puesto: ${postulante.puesto_postula || 'N/A'}`,
          });
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API Error] /api/postulantes:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const { error } = await supabase.from('postulantes').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Error] /api/postulantes:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}