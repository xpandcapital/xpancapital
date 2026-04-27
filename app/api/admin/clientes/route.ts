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
          ultimo_login
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
        ultimo_login
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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    const clientsWithAddresses = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { data: addresses } = await supabase
          .from('direcciones')
          .select('*')
          .eq('user_id', profile.id)
        
        return {
          ...profile,
          addresses: addresses || []
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
    console.error('Admin clientes error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
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
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin delete cliente error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}