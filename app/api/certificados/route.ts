import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

let _supabaseUrl: string | null = null
let _supabaseServiceKey: string | null = null
let _baseOrigin: string | null = null

function getEnv() {
  if (!_supabaseUrl) {
    _supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    _supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    _baseOrigin = _supabaseUrl.replace('/rest/v1', '')
  }
  return { supabaseUrl: _supabaseUrl, supabaseServiceKey: _supabaseServiceKey!, baseOrigin: _baseOrigin! }
}

function getSupabase() {
  const { supabaseUrl, supabaseServiceKey } = getEnv()
  return createClient(supabaseUrl, supabaseServiceKey)
}

function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'CERT-'
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
    if (i === 3 || i === 7) code += '-'
  }
  return code
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const codigo = searchParams.get('codigo')

    if (codigo) {
      const { data: certificado, error } = await supabase
        .from('certificados')
        .select(`
          *,
          user:profiles(id, nombre, apellido, avatar_url),
          curso:cursos(id, nombre)
        `)
        .eq('codigo_verificacion', codigo)
        .single()

      if (error || !certificado) {
        return NextResponse.json({ valid: false, error: 'Certificado no encontrado' }, { status: 404 })
      }

      return NextResponse.json({ valid: true, data: certificado })
    }

    if (!user_id) {
      return NextResponse.json({ error: 'user_id o codigo requerido' }, { status: 400 })
    }

    const { data: certificados, error } = await supabase
      .from('certificados')
      .select(`
        *,
        curso:cursos(id, nombre, slug)
      `)
      .eq('user_id', user_id)
      .order('fecha_emision', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: certificados })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { user_id, curso_id, nombre } = body

    if (!user_id || !nombre) {
      return NextResponse.json({ error: 'user_id y nombre son requeridos' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('certificados')
      .select('id')
      .eq('user_id', user_id)
      .eq('curso_id', curso_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Ya existe un certificado para este curso' }, { status: 400 })
    }

    const { data: user } = await supabase
      .from('profiles')
      .select('empresa_id')
      .eq('id', user_id)
      .single()

    const verificationCode = generateVerificationCode()

    const { data, error } = await supabase
      .from('certificados')
      .insert({
        user_id,
        curso_id,
        nombre,
        codigo_verificacion: verificationCode
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Registrar intento de certificado y otorgar puntos
    if (curso_id && user?.empresa_id) {
      registrarIntentoYCertificado(data, user.empresa_id).catch(() => {})
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

async function registrarIntentoYCertificado(
  certificado: { id: string; user_id: string; curso_id?: string },
  empresaId: string
) {
  try {
    const supabase = getSupabase()

    const { data: config } = await supabase
      .from('gamificacion_config')
      .select('*')
      .eq('empresa_id', empresaId)
      .single()

    if (!config || !config.activo) return

    const { data: intentosPrevios } = await supabase
      .from('certificado_intentos')
      .select('ciclo, intento_en_ciclo, bloqueado')
      .eq('user_id', certificado.user_id)
      .eq('curso_id', certificado.curso_id)
      .order('creado_en', { ascending: false })

    // Puntos del curso (si tiene configurado, sino usa el global)
    let puntosBaseCurso = config.puntos_certificado_base
    if (certificado.curso_id) {
      const { data: curso } = await supabase
        .from('cursos')
        .select('puntos_certificado')
        .eq('id', certificado.curso_id)
        .single()
      if (curso?.puntos_certificado !== undefined && curso.puntos_certificado !== null) puntosBaseCurso = curso.puntos_certificado
    }

    let ciclo = 1
    let intentoEnCiclo = 1

    if (intentosPrevios?.length) {
      const ultimo = intentosPrevios[0]
      if (ultimo.bloqueado) {
        ciclo = ultimo.ciclo + 1
        intentoEnCiclo = 1
      } else {
        ciclo = ultimo.ciclo
        intentoEnCiclo = Math.min(ultimo.intento_en_ciclo + 1, config.max_intentos_certificado)
      }
    }

    const puntos =
      puntosBaseCurso -
      config.puntos_certificado_decremento_intento * (intentoEnCiclo - 1) -
      config.puntos_certificado_decremento_bloqueo * (ciclo - 1)

    const puntosFinal = Math.max(puntos, 0)

    const { error: intentoErr } = await supabase
      .from('certificado_intentos')
      .insert({
        certificado_id: certificado.id,
        user_id: certificado.user_id,
        curso_id: certificado.curso_id,
        ciclo,
        intento_en_ciclo: intentoEnCiclo,
        puntos_otorgados: puntosFinal,
        bloqueado: intentoEnCiclo >= config.max_intentos_certificado,
      })

    if (intentoErr) {
      console.error('[certificados] Error registrando intento:', intentoErr.message)
      return
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://xpancapital.vercel.app'
    await fetch(`${appUrl}/api/gamificacion/otorgar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: certificado.user_id,
        empresa_id: empresaId,
        tipo: 'certificado',
        referencia_tipo: 'certificados',
        referencia_id: certificado.id,
        descripcion: `Certificado emitido (ciclo ${ciclo}, intento ${intentoEnCiclo})`,
        puntos_override: puntosFinal,
      }),
    })
  } catch (err) {
    console.error('[certificados] Error en registrarIntento:', err)
  }
}