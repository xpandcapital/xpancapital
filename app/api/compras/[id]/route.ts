import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() { return createClient(supabaseUrl, supabaseServiceKey) }

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getSupabase()

    const { data: orden } = await supabase
      .from('compras')
      .select('estado, metadata, metodo_pago')
      .eq('id', id)
      .maybeSingle()

    if (!orden) {
      return NextResponse.json({ success: false, error: 'Orden no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, orden })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
