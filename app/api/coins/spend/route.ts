import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

let _cachedSupabase: ReturnType<typeof createClient> | null = null
function getSupabase() {
  if (_cachedSupabase) return _cachedSupabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  _cachedSupabase = createClient(supabaseUrl, supabaseServiceKey)
  return _cachedSupabase
}

const supabase = new Proxy({} as any, {
  get(_: any, prop: string) {
    return getSupabase()[prop]
  }
})
// POST - Gastar coins de un usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, monto, tipo, descripcion, referencia_id, referencia_tipo } = body

    if (!user_id || !monto) {
      return NextResponse.json({ 
        success: false, 
        error: 'user_id y monto son requeridos' 
      }, { status: 400 })
    }

    // Verificar balance actual
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('blis_coins')
      .eq('id', user_id)
      .single()

    if (fetchError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario no encontrado' 
      }, { status: 404 })
    }

    const currentCoins = profile?.blis_coins || 0

    if (currentCoins < Math.abs(monto)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Saldo insuficiente' 
      }, { status: 400 })
    }

    // Actualizar balance
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ blis_coins: currentCoins - Math.abs(monto) })
      .eq('id', user_id)

    if (updateError) {
      return NextResponse.json({ 
        success: false, 
        error: updateError.message 
      }, { status: 400 })
    }

    // Registrar transacción
    const { error: transactionError } = await supabase
      .from('boveda_transacciones')
      .insert({
        user_id,
        tipo: tipo || 'canje',
        monto: -Math.abs(monto),
        descripcion: descripcion || 'Canje de coins',
        referencia_id,
        referencia_tipo
      })

    if (transactionError) {
      console.error('Error registrando transacción:', transactionError)
    }

    return NextResponse.json({ 
      success: true, 
      data: { balance: currentCoins - Math.abs(monto) } 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 })
  }
}
