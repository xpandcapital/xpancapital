import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/api-auth'
import { decrypt } from '@/app/superadmin/correo/_lib/crypto'
import { connectImap, listFolders } from '@/app/superadmin/correo/_lib/imapClient'

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
export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const cuentaId = searchParams.get('cuenta_id')

  if (!cuentaId) return NextResponse.json({ error: 'cuenta_id requerido' }, { status: 400 })

  try {
    const { data: cuenta } = await supabase
      .from('email_cuentas')
      .select('*, servidor:email_servidores(*)')
      .eq('id', cuentaId)
      .eq('user_id', auth.userId)
      .single()

    if (!cuenta) return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })

    const servidor = (cuenta as any).servidor
    if (!servidor) return NextResponse.json({ error: 'Servidor no configurado' }, { status: 404 })

    const client = await connectImap({
      host: servidor.imap_host,
      port: servidor.imap_port,
      secure: servidor.imap_secure,
      user: cuenta.email,
      pass: decrypt(cuenta.password_enc),
    })

    const folders = await listFolders(client)
    await client.logout()

    const folderList = folders
      .filter(f => f.subscribed)
      .map(f => ({
        path: f.path,
        name: f.name,
        flags: Array.from(f.flags),
      }))

    return NextResponse.json(folderList)
  } catch (error: any) {
    console.error('[folders] Error:', error)
    return NextResponse.json({ error: error.message || 'Error al listar carpetas' }, { status: 500 })
  }
}

