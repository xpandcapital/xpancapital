import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'
import { sendTemplateEmail } from '@/lib/email/sendTemplateEmail'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cron diario: felicita a los clientes que cumplen años hoy usando la plantilla
// con estilos configurada en /superadmin/correo (evento: empleado_cumpleanos).
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const empresaId = DEFAULT_EMPRESA_ID

    const hoy = new Date()
    const mes = hoy.getUTCMonth() + 1
    const dia = hoy.getUTCDate()
    const anio = hoy.getUTCFullYear()

    const { data: perfiles, error } = await supabase
      .from('profiles')
      .select('id, nombre, apellido, email, fecha_nacimiento, cumpleanos_auto_regalo')
      .eq('empresa_id', empresaId)
      .not('fecha_nacimiento', 'is', null)
      .not('email', 'is', null)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const cumpleHoy = (perfiles || []).filter((p: any) => {
      if (p.cumpleanos_auto_regalo === false) return false
      const f = new Date(p.fecha_nacimiento)
      if (isNaN(f.getTime())) return false
      return (f.getUTCMonth() + 1) === mes && f.getUTCDate() === dia
    })

    let enviados = 0
    const errores: string[] = []

    for (const p of cumpleHoy) {
      // Evitar enviar dos veces en el mismo año
      const { data: ya } = await supabase
        .from('cumpleanos_enviados')
        .select('id')
        .eq('user_id', p.id)
        .eq('anio', anio)
        .maybeSingle()
      if (ya) continue

      const ok = await sendTemplateEmail({
        evento: 'empleado_cumpleanos',
        empresa_id: empresaId,
        to: p.email,
        variables: {
          nombre_empleado: p.nombre || '',
          apellido_empleado: p.apellido || '',
          departamento: '',
          puesto: 'Miembro',
          nombre: p.nombre || '',
        },
      })

      if (ok) {
        await supabase.from('cumpleanos_enviados').insert({ user_id: p.id, anio })
        enviados++
      } else {
        errores.push(p.email)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        fecha: `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`,
        candidatos: cumpleHoy.length,
        enviados,
        errores,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
