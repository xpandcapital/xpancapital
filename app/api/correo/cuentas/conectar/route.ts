// @ts-nocheck
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/api-auth'
import { encrypt, decrypt } from '@/app/superadmin/correo/_lib/crypto'
import { connectImap } from '@/app/superadmin/correo/_lib/imapClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
    }

    const dominio = email.split('@')[1]?.toLowerCase()
    if (!dominio) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    const { data: servidor, error: serverError } = await supabase
      .from('email_servidores')
      .select('*')
      .eq('empresa_id', auth.empresaId)
      .eq('dominio', dominio)
      .maybeSingle()

    if (serverError || !servidor) {
      return NextResponse.json({
        error: `No hay servidor configurado para el dominio @${dominio}. Contacta al administrador.`
      }, { status: 404 })
    }

    const client = await connectImap({
      host: servidor.imap_host,
      port: servidor.imap_port,
      secure: servidor.imap_secure,
      user: email,
      pass: password,
    })

    const folders: string[] = []
    for await (const f of client.list()) {
      if (f.subscribed) folders.push(f.path)
    }

    await client.logout()

    const { data: cuentaExistente } = await supabase
      .from('email_cuentas')
      .select('id')
      .eq('user_id', auth.userId)
      .eq('email', email)
      .maybeSingle()

    if (cuentaExistente) {
      await supabase
        .from('email_cuentas')
        .update({
          password_enc: encrypt(password),
          last_sync: new Date().toISOString(),
        })
        .eq('id', cuentaExistente.id)
    } else {
      await supabase
        .from('email_cuentas')
        .insert([{
          servidor_id: servidor.id,
          user_id: auth.userId,
          email,
          password_enc: encrypt(password),
          nombre_mostrado: auth.email?.split('@')[0] || email.split('@')[0],
          last_sync: new Date().toISOString(),
        }])
    }

    return NextResponse.json({
      success: true,
      servidor: servidor.nombre,
      dominio: servidor.dominio,
      folders,
      email,
    })
  } catch (error: any) {
    console.error('[conectar] Error:', error)
    const msg = error.message || 'Error de conexión'
    if (msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND')) {
      return NextResponse.json({ error: 'No se pudo conectar al servidor IMAP. Verifica que el host y puerto sean correctos.' }, { status: 502 })
    }
    if (msg.includes('Authentication') || msg.includes('LOGIN') || msg.includes('AUTHENTICATIONFAILED')) {
      return NextResponse.json({ error: 'Credenciales incorrectas. Verifica tu email y contraseña.' }, { status: 401 })
    }
    if (msg.includes('certificate') || msg.includes('SSL') || msg.includes('TLS')) {
      return NextResponse.json({ error: 'Error de seguridad SSL/TLS. Verifica la configuración del servidor.' }, { status: 502 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
