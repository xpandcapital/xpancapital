import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
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

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}