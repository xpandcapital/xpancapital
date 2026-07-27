import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Email inválido' }, { status: 400 })
    }

    const { data: existing } = await supabase.from('leads').select('id').eq('email', email).maybeSingle()
    if (existing) {
      return NextResponse.json({ success: true, message: 'Ya estás suscrito' })
    }

    const { error } = await supabase.from('leads').insert({
      empresa_id: DEFAULT_EMPRESA_ID,
      nombre: email.split('@')[0],
      email,
      datos: { origen: 'newsletter_footer', fecha: new Date().toISOString() },
      estado: 'nuevo',
    })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: true, message: 'Ya estás suscrito' })
      }
      throw error
    }

    return NextResponse.json({ success: true, message: 'Suscripción exitosa' })
  } catch (err) {
    console.error('[newsletter] Error:', err)
    return NextResponse.json({ success: false, error: 'Error al suscribir' }, { status: 500 })
  }
}
