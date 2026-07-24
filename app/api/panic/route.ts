import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() { return createClient(supabaseUrl, supabaseServiceKey) }

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { user_id, motivo, atencion } = await request.json()

    if (!user_id || !motivo) {
      return NextResponse.json({ error: 'user_id y motivo requeridos' }, { status: 400 })
    }

    const hoy = new Date().toISOString().split('T')[0]

    // Verificar límite de 5 eventos por día
    const { count } = await supabase
      .from('panic_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .gte('creado_en', `${hoy}T00:00:00Z`)

    const eventosHoy = count || 0
    const bloqueado = eventosHoy >= 5

    // Obtener datos del estudiante
    const { data: profile } = await supabase
      .from('profiles')
      .select('nombre, apellido, email, empresa_id')
      .eq('id', user_id)
      .single()

    const nombreEstudiante = profile ? [profile.nombre, profile.apellido].filter(Boolean).join(' ') : 'Estudiante'

    // Insertar evento
    const { error: insertError } = await supabase
      .from('panic_events')
      .insert({
        user_id,
        empresa_id: profile?.empresa_id || null,
        motivo,
        atencion: atencion || 'profesor',
        notificacion_enviada: !bloqueado,
      })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Enviar notificación solo si no está bloqueado
    if (!bloqueado) {
      const atencionLabel = atencion === 'psicologo' ? 'Psicólogo' : atencion === 'ambos' ? 'Profesor y Psicólogo' : 'Profesor'

      try {
        // Obtener admins y superadmins de la empresa para notificar
        const { data: admins } = await supabase
          .from('profiles')
          .select('id')
          .eq('empresa_id', profile?.empresa_id || '')
          .in('rol', ['admin', 'superadmin'])

        if (admins && admins.length > 0) {
          // Insertar notificaciones directamente con service role (sin pasar por API auth)
          const notificaciones = admins.map(a => ({
            user_id: a.id,
            empresa_id: profile?.empresa_id || null,
            tipo: 'alerta',
            titulo: '🚨 Alerta de Pánico',
            mensaje: `${nombreEstudiante} ha solicitado ayuda.\n\nMotivo: "${motivo}"\nRequiere atención de: ${atencionLabel}`,
            link: `/superadmin/usuarios/${user_id}`,
            destinatario_tipo: 'miembro',
            leida: false,
          }))

          await supabase.from('notificaciones').insert(notificaciones)
        }
      } catch { /* silencioso */ }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
