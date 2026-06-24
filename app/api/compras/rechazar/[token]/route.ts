import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const siteUrl = request.nextUrl.origin
  const redirectBase = `${siteUrl}/compras/aprobada`

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Verificar token
    const { data: approvalToken, error: tokenError } = await supabase
      .from('compra_approval_tokens')
      .select('id, compra_id, accion, usado_en, expira_en')
      .eq('token', token)
      .maybeSingle()

    if (tokenError || !approvalToken) {
      return NextResponse.redirect(`${redirectBase}?result=error&reason=token_invalido`)
    }

    if (approvalToken.usado_en) {
      return NextResponse.redirect(`${redirectBase}?result=error&reason=token_ya_usado`)
    }

    if (new Date(approvalToken.expira_en) < new Date()) {
      return NextResponse.redirect(`${redirectBase}?result=error&reason=token_expirado`)
    }

    // 2. Obtener la compra
    const { data: compra, error: compraError } = await supabase
      .from('compras')
      .select('id, estado')
      .eq('id', approvalToken.compra_id)
      .single()

    if (compraError || !compra) {
      return NextResponse.redirect(`${redirectBase}?result=error&reason=compra_no_encontrada`)
    }

    if (compra.estado !== 'pendiente') {
      return NextResponse.redirect(`${redirectBase}?result=error&reason=compra_ya_procesada`)
    }

    // 3. Marcar compra como cancelada
    const { error: updateError } = await supabase
      .from('compras')
      .update({ estado: 'cancelado', actualizado_en: new Date().toISOString() })
      .eq('id', compra.id)

    if (updateError) {
      console.error('[rechazar] Error actualizando compra:', updateError)
      return NextResponse.redirect(`${redirectBase}?result=error&reason=error_actualizando`)
    }

    // 4. Insertar log
    await supabase.from('compras_logs').insert({
      compra_id: compra.id,
      user_id: null,
      estado_anterior: 'pendiente',
      estado_nuevo: 'cancelado',
      notas: 'Rechazado mediante link mágico',
    })

    // 5. Marcar token como usado
    await supabase
      .from('compra_approval_tokens')
      .update({ accion: 'rechazado', usado_en: new Date().toISOString() })
      .eq('id', approvalToken.id)

    console.log(`[rechazar] Compra ${compra.id} rechazada mediante link mágico`)
    return NextResponse.redirect(`${redirectBase}?result=rejected&id=${compra.id}`)

  } catch (err) {
    console.error('[rechazar] Error:', err)
    return NextResponse.redirect(`${redirectBase}?result=error&reason=error_interno`)
  }
}
