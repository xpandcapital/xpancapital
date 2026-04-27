import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase()
    const userId = params.id
    const { amount, reason } = await request.json()

    if (!userId || amount === undefined || !reason) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('blis_coins, empresa_id')
      .eq('id', userId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const newBalance = profile.blis_coins + amount
    const tipo = amount > 0 ? 'admin_credito' : 'admin_debito'

    const { error: bovedaError } = await supabase
      .from('boveda_transacciones')
      .insert({
        user_id: userId,
        empresa_id: profile.empresa_id,
        tipo,
        monto: Math.abs(amount),
        balance_antes: profile.blis_coins,
        balance_despues: newBalance,
        descripcion: reason
      })

    if (bovedaError) {
      console.error('Error inserting boveda transaction:', bovedaError)
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ blis_coins: newBalance })
      .eq('id', userId)

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      newBalance,
      transaction: {
        id: `TX-${Date.now()}`,
        type: tipo === 'admin_credito' ? 'Ganancia' : 'Gasto',
        amount,
        description: reason,
        date: new Date().toISOString()
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
