import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase()
    const userId = params.id

    const { data, error } = await supabase
      .from('client_automations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ success: true, data: [], error: error.message })
    }

    const automations = (data || []).map((a: any) => ({
      id: a.id,
      name: a.nombre || a.name || 'Automation',
      description: a.descripcion || a.description || '',
      trigger: a.trigger_type || a.trigger || 'manual',
      status: a.status === 'active' ? 'active' : 'paused',
      last_run: a.last_run || a.lastRun || null
    }))

    return NextResponse.json({ success: true, data: automations })
  } catch (err: any) {
    return NextResponse.json({ success: true, data: [], error: err.message }, { status: 500 })
  }
}
