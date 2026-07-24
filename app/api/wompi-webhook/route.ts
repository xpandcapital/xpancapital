import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() { return createClient(supabaseUrl, supabaseServiceKey) }

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    const event = body.event
    const transaction = body.data?.transaction

    if (event !== 'transaction.updated' || !transaction) {
      return NextResponse.json({ received: true })
    }

    if (transaction.status !== 'APPROVED') {
      return NextResponse.json({ received: true, skipped: transaction.status })
    }

    // Buscar compra por wompi_transaction_id en metadata
    const { data: compras, error } = await supabase
      .from('compras')
      .select('*')
      .eq('metadata->>wompi_transaction_id', transaction.id)
      .eq('estado', 'pendiente')
      .limit(1)

    if (error || !compras || compras.length === 0) {
      return NextResponse.json({ received: true, not_found: true })
    }

    const compra = compras[0]

    // Actualizar estado
    await supabase
      .from('compras')
      .update({
        estado: 'completado',
        transaction_id: transaction.id,
        metadata: { ...(compra.metadata || {}), wompi_status: 'APPROVED', wompi_webhook: true },
      })
      .eq('id', compra.id)

    // Enviar email y asignar cursos
    try {
      const { createUserAndNotify } = await import('@/lib/email/createUserAndNotify')
      await createUserAndNotify({
        email: compra.metadata?.email_cliente || '',
        nombre: compra.metadata?.nombre_cliente || 'Cliente',
        productos: compra.metadata?.productos || [],
        compraId: compra.id,
      } as any)
    } catch (e) { console.error('[wompi-webhook] Error notificando:', e) }

    return NextResponse.json({ received: true, completed: true })
  } catch (error: any) {
    console.error('[wompi-webhook]', error)
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 })
  }
}
