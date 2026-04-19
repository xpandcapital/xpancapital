// API para sincronizar auth_metadata desde la cola de sincronización
// Lee de auth_sync_queue y actualiza app_metadata en auth.users
// Se puede llamar manualmente o como cron job
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Leer registros pendientes de la cola de sincronización
    const { data: pending, error: queueError } = await supabase
      .from('auth_sync_queue')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: true })
      .limit(50)

    if (queueError) {
      // Si la tabla no existe, sincronizar directamente desde profiles
      return await syncAllProfiles(supabase)
    }

    if (!pending || pending.length === 0) {
      // No hay registros en la cola — sincronizar directamente desde profiles
      return await syncAllProfiles(supabase)
    }

    let processed = 0
    let errors = 0

    for (const record of pending) {
      const { user_id, action, data } = record

      if (action === 'update_app_metadata') {
        const { error: updateError } = await supabase.auth.admin.updateUserById(user_id, {
          app_metadata: {
            rol: data.rol || 'usuario',
            empresa_id: data.empresa_id || undefined,
            permisos_adicionales: data.permisos_adicionales || {},
          }
        })

        if (updateError) {
          console.error(`Error actualizando metadata para ${user_id}:`, updateError.message)
          errors++
          continue
        }

        // Marcar como procesado
        await supabase
          .from('auth_sync_queue')
          .update({ processed: true, processed_at: new Date().toISOString() })
          .eq('id', record.id)

        processed++
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      errors,
      total: pending.length,
    })
  } catch (error) {
    console.error('[API Error] /api/admin/sync-auth-metadata:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// Sincronización directa desde profiles cuando no hay cola
async function syncAllProfiles(supabase: ReturnType<typeof createClient>) {
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, rol, empresa_id, permisos_adicionales')

  if (profilesError || !profiles) {
    return NextResponse.json({ error: 'Error leyendo profiles' }, { status: 500 })
  }

  let processed = 0
  let errors = 0

  for (const profile of profiles) {
    const { error } = await supabase.auth.admin.updateUserById(profile.id, {
      app_metadata: {
        rol: profile.rol || 'usuario',
        empresa_id: profile.empresa_id || undefined,
        permisos_adicionales: profile.permisos_adicionales || {},
      }
    })

    if (error) {
      errors++
    } else {
      processed++
    }
  }

  return NextResponse.json({
    success: true,
    processed,
    errors,
    total: profiles.length,
    method: 'direct_profiles_sync',
  })
}

// GET: Sincronizar un usuario específico por ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'user_id es requerido' }, { status: 400 })
    }

    const supabase = createClient()

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, rol, empresa_id, permisos_adicionales')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      app_metadata: {
        rol: profile.rol || 'usuario',
        empresa_id: profile.empresa_id || undefined,
        permisos_adicionales: profile.permisos_adicionales || {},
      }
    })

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user_id: userId,
      app_metadata: {
        rol: profile.rol,
        empresa_id: profile.empresa_id,
        permisos_adicionales: profile.permisos_adicionales,
      }
    })
  } catch (error) {
    console.error('[API Error] /api/admin/sync-auth-metadata:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}