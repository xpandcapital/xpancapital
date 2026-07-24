import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { zona_horaria, user_id } = await request.json()
    if (!zona_horaria || !user_id) return NextResponse.json({ error: 'zona_horaria y user_id requeridos' }, { status: 400 })

    const { error } = await supabase
      .from('profiles')
      .update({ zona_horaria })
      .eq('id', user_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
