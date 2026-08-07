import { supabase } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Obtener balance de coins
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'user_id requerido' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('xpand_coins')
      .eq('id', userId)
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      data: { balance: data?.xpand_coins || 0 } 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 })
  }
}
