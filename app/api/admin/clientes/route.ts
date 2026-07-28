import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)

    const id = searchParams.get('id')
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('per_page') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const tier = searchParams.get('tier') || ''

    if (id) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          id,empresa_id,email,nombre,apellido,avatar_url,telefono,rol,blis_coins,total_compras,total_gastado_usd,total_referidos,creado_en,
          pais,region,ciudad,
          tipo_cuenta,empresa_nombre,empresa_ruc,empresa_rep_legal,
          tipo_documento,numero_documento,fecha_nacimiento,
          estado_civil,profesion,educacion,
          verificado,verificado_en,
          nivel_id,
          coins_totales_ganados,coins_totales_gastados,coins_expiran,
          ha_comprado,
          recibir_newsletter,recibir_push,idioma,tema,courier_preferido,codigo_referido,referido_por,
          notas_internas,es_caso_dificil,
          cumpleanos_auto_regalo,recordatorio_inactividad,
          cuenta_congelada,cuenta_fusionada_con,
          ultimo_login,
          puntos_cursos,puntos_comunidad,puntos_blog
        `)
        .eq('id', id)
        .single()

      if (error || !profile) {
        return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
      }

      const { data: addresses } = await supabase
        .from('direcciones')
        .select('*')
        .eq('user_id', profile.id)

      return NextResponse.json({
        success: true,
        data: { ...profile, addresses: addresses || [] }
      })
    }

    let query = supabase
      .from('profiles')
      .select(`
        id,empresa_id,email,nombre,apellido,avatar_url,telefono,rol,blis_coins,total_compras,total_gastado_usd,total_referidos,creado_en,
        pais,region,ciudad,
        tipo_cuenta,empresa_nombre,empresa_ruc,empresa_rep_legal,
        tipo_documento,numero_documento,fecha_nacimiento,
        estado_civil,profesion,educacion,
        verificado,verificado_en,
        nivel_id,
        coins_totales_ganados,coins_totales_gastados,coins_expiran,
        ha_comprado,
        recibir_newsletter,recibir_push,idioma,tema,courier_preferido,codigo_referido,referido_por,
        notas_internas,es_caso_dificil,
        cumpleanos_auto_regalo,recordatorio_inactividad,
        cuenta_congelada,cuenta_fusionada_con,
        ultimo_login,
        puntos_cursos,puntos_comunidad,puntos_blog
      `, { count: 'exact' })
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .order('creado_en', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1)
    
    if (search) {
      query = query.or(`nombre.ilike.%${search}%,apellido.ilike.%${search}%,email.ilike.%${search}%`)
    }
    
    if (status === 'Verificado') {
      query = query.eq('verificado', true)
    } else if (status === 'Premium') {
      query = query.eq('ha_comprado', true)
    }
    
    const { data: profiles, error, count } = await query
    
    if (error) {
      console.error('[Admin Clientes] Error DB:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    const clientsWithAddresses = await Promise.all(
      (profiles || []).map(async (profile) => {
        try {
          const { data: addresses } = await supabase
            .from('direcciones')
            .select('*')
            .eq('user_id', profile.id)
          
          return {
            ...profile,
            addresses: addresses || []
          }
        } catch {
          return { ...profile, addresses: [] }
        }
      })
    )
    
    return NextResponse.json({
      success: true,
      data: clientsWithAddresses,total: count,
      totalPages: Math.ceil((count || 0) / perPage),
      page,
      perPage
    })
  } catch (error) {
    console.error('[Admin Clientes] Error general:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Error del servidor: ' + (error instanceof Error ? error.message : 'desconocido') }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { id, addresses, ...updates } = body
    
    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }
    
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          actualizado_en: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }
    
    if (addresses && Array.isArray(addresses)) {
      await supabase
        .from('direcciones')
        .delete()
        .eq('user_id', id)
      
      for (const addr of addresses) {
        if (addr.direccion && addr.ciudad) {
          await supabase
            .from('direcciones')
            .insert({
              user_id: id,
              tipo: addr.tipo || 'envio',
              etiqueta: addr.etiqueta || '',
              direccion: addr.direccion,
              ciudad: addr.ciudad,
              region: addr.region,
              codigo_postal: addr.codigo_postal,
              pais: addr.pais || 'PE',
              es_principal: addr.es_principal || false,
              acceso_dificil: addr.acceso_dificil || false
            })
        }
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin update cliente error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    // 1. Verificar que el cliente existe
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', id)
      .maybeSingle()

    if (profileError) {
      console.error('[admin/clientes DELETE] Error buscando perfil:', profileError.message)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    if (!profile) {
      // Si no hay perfil, intentar eliminar de auth de todos modos
      await supabase.auth.admin.deleteUser(id).catch((e) => {
        console.error('[admin/clientes DELETE] Error eliminando usuario de auth:', e.message)
      })
      return NextResponse.json({ success: true })
    }

    // 2. Limpiar tablas relacionadas comunes (ignorar errores de tablas inexistentes)
    const relatedTables = [
      'direcciones',
      'carrito',
      'favoritos',
      'usuario_cursos',
      'usuario_biblioteca',
      'certificados',
      'compra_items',
      'compras',
      'notificaciones',
      'push_subscriptions',
      'security_logs',
      'login_history',
      'postulantes',
      'formulario_respuestas',
      'email_event_logs',
    ]

    const cleanupResults = await Promise.allSettled(
      relatedTables.map(async (table) => {
        try {
          const { error } = await supabase.from(table).delete().eq('user_id', id)
          if (error && !error.message?.includes('does not exist')) {
            console.warn(`[admin/clientes DELETE] Error limpiando ${table}:`, error.message)
          }
        } catch (e) {
          console.warn(`[admin/clientes DELETE] Excepción limpiando ${table}:`, e)
        }
      })
    )

    console.log(
      '[admin/clientes DELETE] Tablas relacionadas limpiadas:',
      cleanupResults.filter(r => r.status === 'fulfilled').length,
      'de',
      cleanupResults.length
    )

    // 3. Eliminar de profiles
    const { error: deleteProfileError } = await supabase.from('profiles').delete().eq('id', id)
    if (deleteProfileError) {
      console.error('[admin/clientes DELETE] Error eliminando profiles:', deleteProfileError.message)
      return NextResponse.json(
        { error: `No se pudo eliminar el perfil: ${deleteProfileError.message}` },
        { status: 500 }
      )
    }

    // 4. Eliminar de Auth (service role)
    const { error: authError } = await supabase.auth.admin.deleteUser(id)
    if (authError) {
      console.error('[admin/clientes DELETE] Error eliminando usuario de auth:', authError.message)
      // No fallamos la operación si el perfil ya fue eliminado; puede reintentarse después
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin delete cliente error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}