import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { userId, permisos_adicionales, rol } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}

    if (permisos_adicionales !== undefined) {
      updates.permisos_adicionales = permisos_adicionales
    }

    if (rol) {
      updates.rol = rol
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
    }

    updates.actualizado_en = new Date().toISOString()

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (rol) {
      const { error: syncError } = await supabase.auth.admin.updateUserById(
        userId,
        { app_metadata: { rol, empresa_id: data.empresa_id } }
      )
      if (syncError) {
        console.warn('[Permisos API] Error syncing app_metadata:', syncError.message)
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[API Error] /api/admin/permisos PATCH:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}