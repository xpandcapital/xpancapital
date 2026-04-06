import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// POST - Agregar coins a un usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, monto, tipo, descripcion, referencia_id, referencia_tipo } = body

    if (!user_id || !monto || !tipo) {
      return NextResponse.json({ 
        success: false, 
        error: 'user_id, monto y tipo son requeridos' 
      }, { status: 400 })
    }

    // Iniciar transacción
    const { error: updateError } = await supabase.rpc('add_coins', {
      p_user_id: user_id,
      p_monto: monto
    })

    // Si no existe la función RPC, usar actualización directa
    if (updateError) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('blis_coins')
        .eq('id', user_id)
        .single()

      const currentCoins = profile?.blis_coins || 0

      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ blis_coins: currentCoins + monto })
        .eq('id', user_id)

      if (updateProfileError) {
        return NextResponse.json({ 
          success: false, 
          error: updateProfileError.message 
        }, { status: 400 })
      }
    }

    // Registrar transacción
    const { error: transactionError } = await supabase
      .from('boveda_transacciones')
      .insert({
        user_id,
        tipo,
        monto,
        descripcion: descripcion || `${tipo === 'lectura' ? 'Recompensa por lectura' : tipo}`,
        referencia_id,
        referencia_tipo
      })

    if (transactionError) {
      console.error('Error registrando transacción:', transactionError)
    }

    // Obtener nuevo balance
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('blis_coins')
      .eq('id', user_id)
      .single()

    return NextResponse.json({ 
      success: true, 
      data: { balance: updatedProfile?.blis_coins || 0 } 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 })
  }
}