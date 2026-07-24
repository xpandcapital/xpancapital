import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { decryptApiKey } from '@/lib/api-crypto'
import { getTransaction } from '@/lib/wompi/client'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() { return createClient(supabaseUrl, supabaseServiceKey) }

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { ordenId } = await request.json()

    if (!ordenId) {
      return NextResponse.json({ error: 'ordenId requerido' }, { status: 400 })
    }

    // Buscar compra
    const { data: compra, error } = await supabase
      .from('compras')
      .select('*')
      .eq('id', ordenId)
      .single()

    if (error || !compra) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    if (compra.estado === 'completado') {
      return NextResponse.json({ success: true, already_completed: true })
    }

    const wompiTxId = compra.metadata?.wompi_transaction_id
    if (!wompiTxId) {
      return NextResponse.json({ error: 'Sin ID de transacción Wompi' }, { status: 400 })
    }

    // Obtener keys para verificar estado en Wompi
    const { data: keys } = await supabase
      .from('api_keys')
      .select('key_name, key_value')
      .in('key_name', ['wompi_private_key'])
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .or(`user_id.is.null,is_global.eq.true`)

    const privateKey = decryptApiKey(keys?.find((k: any) => k.key_name === 'wompi_private_key')?.key_value || '')
    const environment = process.env.WOMPI_ENV || 'sandbox'

    const wompiRes = await getTransaction(wompiTxId, privateKey, environment)

    if (wompiRes.data.status === 'APPROVED') {
      // Actualizar compra a completada
      await supabase
        .from('compras')
        .update({
          estado: 'completado',
          transaction_id: wompiTxId,
          metadata: { ...compra.metadata, wompi_status: 'APPROVED' },
        })
        .eq('id', ordenId)

      // Enviar email y asignar cursos
      try {
        const productos = compra.metadata?.productos || []
        const { createUserAndNotify } = await import('@/lib/email/createUserAndNotify')
        await (createUserAndNotify as any)({
          email: compra.metadata?.email_cliente || '',
          nombre: compra.metadata?.nombre_cliente || 'Cliente',
          productos,
          compraId: ordenId,
        })
      } catch (e) { console.error('[wompi-confirm] Error notificando:', e) }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, status: wompiRes.data.status })
  } catch (error: any) {
    console.error('[wompi-confirm]', error)
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 })
  }
}
