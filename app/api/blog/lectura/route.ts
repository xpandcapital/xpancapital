import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// GET - Obtener progreso de lectura
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const postId = searchParams.get('post_id')

    if (!userId || !postId) {
      return NextResponse.json({ 
        success: false, 
        error: 'user_id y post_id son requeridos' 
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('blog_lecturas')
      .select('*')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: data || null })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 })
  }
}

// POST - Registrar lectura y otorgar recompensa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, post_id, tiempo_segundos, completado, coins_cantidad } = body

    if (!user_id || !post_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'user_id y post_id son requeridos' 
      }, { status: 400 })
    }

    // Verificar si ya existe registro
    const { data: existing } = await supabase
      .from('blog_lecturas')
      .select('*')
      .eq('user_id', user_id)
      .eq('post_id', post_id)
      .maybeSingle()

    if (existing) {
      // Ya existe, no otorgar coins doble vez
      return NextResponse.json({ 
        success: true, 
        data: existing,
        message: 'Lectura ya registrada' 
      })
    }

    // Crear nuevo registro de lectura
    const { data: lectura, error: lecturaError } = await supabase
      .from('blog_lecturas')
      .insert({
        user_id,
        post_id,
        tiempo_segundos: tiempo_segundos || 60,
        completado: completado || true,
        recompensa_otorgada: true
      })
      .select()
      .single()

    if (lecturaError) {
      return NextResponse.json({ 
        success: false, 
        error: lecturaError.message 
      }, { status: 400 })
    }

    // Otorgar coins al usuario
    const cantidad = coins_cantidad ||5
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('blis_coins')
      .eq('id', user_id)
      .single()

    const currentCoins = profile?.blis_coins || 0

    await supabase
      .from('profiles')
      .update({ blis_coins: currentCoins + cantidad })
      .eq('id', user_id)

    // Registrar transacción
    await supabase
      .from('boveda_transacciones')
      .insert({
        user_id,
        tipo: 'lectura',
        monto: cantidad,
        descripcion: 'Recompensa por lectura de artículo',
        referencia_id: post_id,
        referencia_tipo: 'blog_post'
      })

    otorgarPuntosLectura(user_id).catch(err => console.error('[gamificacion] Error otorgando puntos:', err))

    return NextResponse.json({ 
      success: true, 
      data: { 
        lectura,
        coins_otorgados: cantidad 
      } 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 })
  }
}

// POST handler — se ejecuta después del registro de lectura exitoso
// (otorga puntos de gamificación)
async function otorgarPuntosLectura(userId: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: profile } = await supabase
      .from('profiles')
      .select('empresa_id')
      .eq('id', userId)
      .single()

    if (!profile?.empresa_id) return

    await fetch(`${supabaseUrl.replace('/rest/v1', '')}/api/gamificacion/otorgar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        empresa_id: profile.empresa_id,
        tipo: 'lectura_blog',
        referencia_tipo: 'blog_lecturas',
        descripcion: 'Lectura de artículo',
      }),
    })
  } catch (err) { console.error('[gamificacion] Error otorgando puntos:', err) }
}

// PUT - Actualizar progreso de lectura
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, post_id, tiempo_segundos, completado } = body

    if (!user_id || !post_id || tiempo_segundos === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: 'user_id, post_id y tiempo_segundos son requeridos' 
      }, { status: 400 })
    }

    // Check if record exists
    const { data: existing } = await supabase
      .from('blog_lecturas')
      .select('id, completado, recompensa_otorgada')
      .eq('user_id', user_id)
      .eq('post_id', post_id)
      .single()

    let result
    if (existing) {
      // Update only tiempo and optionally completado
      const updates: any = { tiempo_segundos }
      if (completado !== undefined) updates.completado = completado
      
      result = await supabase
        .from('blog_lecturas')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      // Insert new record
      result = await supabase
        .from('blog_lecturas')
        .insert({
          user_id,
          post_id,
          tiempo_segundos,
          completado: completado || false,
          recompensa_otorgada: false
        })
        .select()
        .single()
    }

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 })
  }
}