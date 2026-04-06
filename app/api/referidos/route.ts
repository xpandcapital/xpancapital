import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Generate a unique referral code
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// GET - Get referral info for a user
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json({ error: 'user_id es requerido' }, { status: 400 })
    }

    // Get user's referral code and stats
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, codigo_referido, total_referidos, blis_coins')
      .eq('id', user_id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // If user doesn't have a referral code, generate one
    let referralCode = profile.codigo_referido
    if (!referralCode) {
      referralCode = generateReferralCode()
      await supabase
        .from('profiles')
        .update({ codigo_referido: referralCode })
        .eq('id', user_id)
    }

    // Get referrals list
    const { data: referrals } = await supabase
      .from('referidos')
      .select(`
        id,
        referido_id,
        estado,
        codigo_referido,
        creado_en,
        referido:profiles!referidos_referido_id_fkey(id, nombre, apellido, avatar_url, creado_en)
      `)
      .eq('referidor_id', user_id)
      .order('creado_en', { ascending: false })

    // Get commissions
    const { data: commissions } = await supabase
      .from('referidos_comisiones')
      .select('*')
      .eq('referidor_id', user_id)
      .order('creado_en', { ascending: false })
      .limit(50)

    // Get total coins earned from referrals
    const { data: totalCommission } = await supabase
      .from('referidos_comisiones')
      .select('monto')
      .eq('referidor_id', user_id)
      .eq('pagado', true)

    const totalEarned = totalCommission?.reduce((sum, c) => sum + (c.monto || 0), 0) || 0

    return NextResponse.json({
      success: true,
      data: {
        referralCode,
        referralLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://blis-corp.com'}?ref=${referralCode}`,
        totalReferrals: profile.total_referidos || 0,
        totalEarned,
        referrals: referrals || [],
        commissions: commissions || []
      }
    })
  } catch (error) {
    console.error('Error getting referral info:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Register a new referral (when someone uses a referral code)
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { user_id, referral_code } = body

    if (!user_id || !referral_code) {
      return NextResponse.json({ error: 'user_id y referral_code son requeridos' }, { status: 400 })
    }

    // Find the referrer by code
    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select('id, empresa_id')
      .eq('codigo_referido', referral_code)
      .single()

    if (referrerError || !referrer) {
      return NextResponse.json({ error: 'Código de referido inválido' }, { status: 400 })
    }

    // Check if user is trying to refer themselves
    if (referrer.id === user_id) {
      return NextResponse.json({ error: 'No puedes usar tu propio código de referido' }, { status: 400 })
    }

    // Check if user already has a referrer
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('referido_por')
      .eq('id', user_id)
      .single()

    if (existingUser?.referido_por) {
      return NextResponse.json({ error: 'Ya has usado un código de referido anteriormente' }, { status: 400 })
    }

    // Get company config for referral rewards
    const { data: config } = await supabase
      .from('empresa_config')
      .select('coins_referido')
      .eq('empresa_id', referrer.empresa_id)
      .single()

    const referralReward = config?.coins_referido || 50

    // Update user with referrer
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ referido_por: referrer.id })
      .eq('id', user_id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Create referral record
    const { error: referralError } = await supabase
      .from('referidos')
      .insert({
        empresa_id: referrer.empresa_id,
        referidor_id: referrer.id,
        referido_id: user_id,
        codigo_referido: referral_code,
        estado: 'activo'
      })
      .select()
      .single()

    if (referralError) {
      console.error('Error creating referral:', referralError)
    }

    // Update referrer's total_referrals count
    await supabase.rpc('incrementar_total_referidos', { user_id: referrer.id })

    // Give coins to referrer
    await supabase
      .from('profiles')
      .update({ blis_coins: supabase.rpc('increment', { row: referrer.id, column: 'blis_coins', amount: referralReward }) })
      .eq('id', referrer.id)

    // Create transaction for referrer
    await supabase
      .from('boveda_transacciones')
      .insert({
        empresa_id: referrer.empresa_id,
        user_id: referrer.id,
        tipo: 'bonus_referido',
        monto: referralReward,
        descripcion: `Bonus por referido: ${referral_code}`
      })

    // Create commission record
    await supabase
      .from('referidos_comisiones')
      .insert({
        empresa_id: referrer.empresa_id,
        referidor_id: referrer.id,
        referido_id: user_id,
        monto: referralReward,
        tipo: 'registro',
        pagado: true
      })

    return NextResponse.json({
      success: true,
      data: {
        message: 'Referido registrado exitosamente',
        reward: referralReward
      }
    })
  } catch {
    console.error('Error registering referral:')
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PUT - Validate referral code
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: 'Código es requerido' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, nombre, apellido')
      .eq('codigo_referido', code)
      .single()

    if (error || !data) {
      return NextResponse.json({ valid: false, message: 'Código inválido' })
    }

    return NextResponse.json({
      valid: true,
      referrer: {
        id: data.id,
        name: `${data.nombre || ''} ${data.apellido || ''}`.trim()
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}