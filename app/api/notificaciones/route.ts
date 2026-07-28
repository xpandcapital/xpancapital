import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as sharedSupabaseAdmin } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/supabase/api-auth'

function getSupabaseAdmin() {
  return sharedSupabaseAdmin
}

async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
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

    const supabaseAdmin = getSupabaseAdmin()
    const empresaId = auth?.empresaId || searchParams.get('empresa_id')

    if (unread === 'true') {
      if (!userId) return NextResponse.json({ success: true, count: 0 })

      // Notificaciones directas al user
      const { count: directCount, error: directErr } = await supabaseAdmin
        .from('notificaciones')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('leida', false)

      if (directErr) return NextResponse.json({ success: false, error: directErr.message }, { status: 500 })

      // Notificaciones por rol (para admins)
      let roleCount = 0
      if (auth?.rol === 'superadmin' || auth?.rol === 'admin') {
        const { count: rCount, error: roleErr } = await supabaseAdmin
          .from('notificaciones')
          .select('id', { count: 'exact', head: true })
          .eq('destinatario_tipo', 'por_rol')
          .contains('destinatario_ids', [auth.rol])
          .eq('leida', false)

        if (!roleErr) roleCount = rCount || 0
      }

      return NextResponse.json({ success: true, count: (directCount || 0) + roleCount })
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
      const { data: directNotifs, error: directErr } = await supabaseAdmin
        .from('notificaciones')
        .select('*')
        .eq('user_id', userId)
        .order('creado_en', { ascending: false })
        .limit(limit)

      if (directErr) return NextResponse.json({ success: false, error: directErr.message }, { status: 500 })

      let allNotifications = directNotifs || []

      // Incluir notificaciones por rol si es admin/superadmin
      if (auth?.rol === 'superadmin' || auth?.rol === 'admin') {
        const { data: roleNotifs } = await supabaseAdmin
          .from('notificaciones')
          .select('*')
          .eq('destinatario_tipo', 'por_rol')
          .contains('destinatario_ids', [auth.rol])
          .order('creado_en', { ascending: false })
          .limit(limit)

        if (roleNotifs) {
          allNotifications = [...allNotifications, ...roleNotifs]
          allNotifications.sort((a: any, b: any) =>
            new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime()
          )
          allNotifications = allNotifications.slice(0, limit)
        }
      }

      const unreadCount = allNotifications.filter((n: any) => !n.leida).length
      return NextResponse.json({
        success: true,
        notifications: allNotifications,
        unreadCount
      })
    }

    return NextResponse.json({ success: false, error: 'Parámetros requeridos' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json()
    const { user_id, titulo, mensaje } = body

    if (!user_id || !titulo) {
      return NextResponse.json({ error: 'user_id y titulo requeridos' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('notificaciones')
      .insert({
        user_id,
        empresa_id: auth.empresaId,
        titulo,
        mensaje,
        leida: false,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
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
    const supabaseAdmin = getSupabaseAdmin()

    if (body.marcar_todas) {
      await supabaseAdmin
        .from('notificaciones')
        .update({ leida: true, leida_en: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('leida', false)

      // También marcar notificaciones por rol del admin
      if (auth?.rol === 'superadmin' || auth?.rol === 'admin') {
        await supabaseAdmin
          .from('notificaciones')
          .update({ leida: true, leida_en: new Date().toISOString() })
          .eq('destinatario_tipo', 'por_rol')
          .contains('destinatario_ids', [auth.rol])
          .eq('leida', false)
      }

      return NextResponse.json({ success: true })
    }

    if (body.id) {
      const isAdmin = auth?.rol === 'superadmin' || auth?.rol === 'admin'
      let query = supabaseAdmin
        .from('notificaciones')
        .update({ leida: true, leida_en: new Date().toISOString() })
        .eq('id', body.id)

      if (!isAdmin) {
        query = query.eq('user_id', userId)
      }

      await query
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

    const supabaseAdmin = getSupabaseAdmin()

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
