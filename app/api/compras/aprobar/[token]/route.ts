import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createUserAndNotify } from '@/lib/email/createUserAndNotify'
import { assignCoursesToUser } from '@/lib/courses/assignCourses'
import { generateSecurePassword } from '@/lib/crypto'

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
      .select('id, compra_id, accion, usado_en, expira_en, creado_en')
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
      .select('*')
      .eq('id', approvalToken.compra_id)
      .single()

    if (compraError || !compra) {
      return NextResponse.redirect(`${redirectBase}?result=error&reason=compra_no_encontrada`)
    }

    if (compra.estado !== 'pendiente') {
      return NextResponse.redirect(`${redirectBase}?result=error&reason=compra_ya_procesada`)
    }

    // 3. Marcar compra como completada
    const { error: updateError } = await supabase
      .from('compras')
      .update({ estado: 'completado', actualizado_en: new Date().toISOString() })
      .eq('id', compra.id)

    if (updateError) {
      console.error('[aprobar] Error actualizando compra:', updateError)
      return NextResponse.redirect(`${redirectBase}?result=error&reason=error_actualizando`)
    }

    // 4. Insertar log
    await supabase.from('compras_logs').insert({
      compra_id: compra.id,
      user_id: null,
      estado_anterior: 'pendiente',
      estado_nuevo: 'completado',
      notas: 'Aprobado mediante link mágico',
    })

    // 5. Notificar al cliente y asignar cursos
    const meta = (compra.metadata || {}) as Record<string, unknown>
    const email = (meta.email_cliente as string) || ''
    const nombreCompleto = (meta.nombre_cliente as string) || 'Cliente'
    const nombreParts = nombreCompleto.trim().split(/\s+/)
    const nombre = nombreParts[0] || 'Cliente'
    const apellido = nombreParts.slice(1).join(' ') || ''
    const productos = (meta.productos as Array<any>) || []

    if (email && productos.length > 0) {
      const prodNames = productos.map((p: any) => p.nombre || 'Producto')
      const prodPrices = productos.map((p: any) => ({
        nombre: p.nombre || 'Producto',
        precio: (p.precio_unitario || compra.monto_usd || 0).toFixed(2),
        cantidad: p.cantidad || 1,
        categoria: p.productType || '',
        imagen: p.imagen || '',
      }))

      const esInvitadoOriginal = !!(meta.es_invitado) || !compra.user_id

      let passwordParaEmail = ''
      if (esInvitadoOriginal && compra.user_id) {
        passwordParaEmail = generateSecurePassword()
        const { error: passError } = await supabase.auth.admin.updateUserById(compra.user_id, { password: passwordParaEmail })
        if (passError) {
          console.error('[aprobar] Error actualizando contraseña:', passError.message)
          passwordParaEmail = ''
        }
      }

      const createResult = await createUserAndNotify({
        email, nombre, apellido,
        isGuest: esInvitadoOriginal,
        productos: prodNames,
        total: `${(compra.monto_usd || 0).toFixed(2)} USD`,
        metodo_pago: compra.metodo_pago || 'Manual',
        productPrices: prodPrices,
        newUserPassword: passwordParaEmail || undefined,
      }).catch((err) => {
        console.error('[aprobar] Error en createUserAndNotify:', err)
        return { userId: null, isNewUser: false, tempPassword: '' }
      })

      const userId = createResult.userId
      const effectiveUserId = compra.user_id || userId

      if (userId && !compra.user_id) {
        await supabase.from('compras').update({ user_id: userId }).eq('id', compra.id)
      }

      if (effectiveUserId) {
        await assignCoursesToUser(supabase, productos, email, effectiveUserId, nombre)
      }
    }

    // 6. Marcar token como usado
    await supabase
      .from('compra_approval_tokens')
      .update({ accion: 'aprobado', usado_en: new Date().toISOString() })
      .eq('id', approvalToken.id)

    console.log(`[aprobar] Compra ${compra.id} aprobada mediante link mágico`)
    return NextResponse.redirect(`${redirectBase}?result=success&id=${compra.id}`)

  } catch (err) {
    console.error('[aprobar] Error:', err)
    return NextResponse.redirect(`${redirectBase}?result=error&reason=error_interno`)
  }
}
