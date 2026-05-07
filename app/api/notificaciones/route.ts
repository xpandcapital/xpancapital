import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthUser } from '@/lib/supabase/api-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !user) return null
    return user.id
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const admin = searchParams.get('admin')
    const unread = searchParams.get('unread')
    const limit = parseInt(searchParams.get('limit') || '50')

    const auth = await getAuthUser(request)
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    const tokenUserId = token ? await getUserIdFromToken(token) : null
    const userId = auth?.userId || tokenUserId

    if (!userId && (admin === 'true' || !unread)) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const empresaId = auth?.empresaId || searchParams.get('empresa_id')

    if (unread === 'true') {
      if (!userId) return NextResponse.json({ success: true, count: 0 })
      const { count, error } = await supabaseAdmin
        .from('notificaciones')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('leida', false)

      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, count: count || 0 })
    }

    if (admin === 'true') {
      let query = supabaseAdmin
        .from('notificaciones')
        .select('*', { count: 'exact' })
        .order('creado_en', { ascending: false })
        .limit(limit)

      if (empresaId) query = query.eq('empresa_id', empresaId)

      const { data, error, count } = await query
      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

      return NextResponse.json({ success: true, data, total: count || 0 })
    }

    if (userId) {
      const { data, error } = await supabaseAdmin
        .from('notificaciones')
        .select('*')
        .eq('user_id', userId)
        .order('creado_en', { ascending: false })
        .limit(limit)

      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

      const unreadCount = (data || []).filter((n: any) => !n.leida).length
      return NextResponse.json({
        success: true,
        notifications: data || [],
        unreadCount
      })
    }

    return NextResponse.json({ success: false, error: 'Parámetros requeridos' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    const tokenUserId = token ? await getUserIdFromToken(token) : null
    const userId = auth?.userId || tokenUserId
    if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json()
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    if (body.marcar_todas) {
      await supabaseAdmin
        .from('notificaciones')
        .update({ leida: true, leida_en: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('leida', false)
      return NextResponse.json({ success: true })
    }

    if (body.id) {
      await supabaseAdmin
        .from('notificaciones')
        .update({ leida: true, leida_en: new Date().toISOString() })
        .eq('id', body.id)
        .eq('user_id', userId)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: 'Parámetros requeridos' }, { status: 400 })
  } catch {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const all = searchParams.get('all')
    const auth = await getAuthUser(request)

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    if (all === 'true') {
      if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      await supabaseAdmin.from('notificaciones').delete().eq('empresa_id', auth.empresaId)
      return NextResponse.json({ success: true })
    }

    if (id) {
      if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      await supabaseAdmin.from('notificaciones').delete().eq('id', id)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: 'Parámetros requeridos' }, { status: 400 })
  } catch {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
