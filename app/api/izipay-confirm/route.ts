import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ordenId } = body as { ordenId: string }

    if (!ordenId) {
      return NextResponse.json({ success: false, error: 'Falta ordenId' }, { status: 400 })
    }

    const supabase = createClient()

    const { error } = await supabase
      .from('compras')
      .update({
        estado: 'completado',
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', ordenId)

    if (error) {
      console.error('[Izipay Confirm] Error:', error)
      return NextResponse.json({ success: false, error: 'Error al actualizar' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Izipay Confirm] Error:', err)
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
