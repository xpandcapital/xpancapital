import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'
import { createClient } from '@/lib/supabase/server'
import { sendTemplateEmail } from '@/lib/email/sendTemplateEmail'

function generatePassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

interface CreateUserParams {
  email: string
  nombre: string
  productos: string[]
  total: string
  metodo_pago: string
  empresa_id?: string
  telefono?: string
  isGuest?: boolean
  productPrices?: Array<{ nombre: string; precio: string; cantidad?: number; categoria?: string }>
}

interface CreateUserResult {
  userId: string | null
  isNewUser: boolean
  tempPassword: string
}

async function findAuthUserByEmail(supabase: ReturnType<typeof createClient>, email: string): Promise<{ id: string } | null> {
  try {
    const { data, error } = await supabase.auth.admin.listUsers()
    if (error) {
      console.error('[createUserAndNotify] Error listando usuarios de auth:', error.message)
      return null
    }
    const found = data?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
    return found ? { id: found.id } : null
  } catch (e) {
    console.error('[createUserAndNotify] Error buscando en auth.users:', e)
    return null
  }
}

export async function createUserAndNotify(params: CreateUserParams): Promise<CreateUserResult> {
  console.log('[createUserAndNotify] Iniciando para:', params.email)
  const supabase = createClient()
  const empresa_id = params.empresa_id || DEFAULT_EMPRESA_ID
  const email = params.email.toLowerCase()
  let userId: string | null = null
  let isNewUser = false
  let tempPassword = ''

  // 1. Buscar si ya existe usuario con ese email (directo en profiles)
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    if (profile) userId = profile.id
    console.log('[createUserAndNotify] Usuario encontrado en profiles:', !!userId)
  } catch (e) {
    console.error('[createUserAndNotify] Error buscando en profiles:', e)
  }

  // 2. Si no está en profiles, buscar en auth.users (puede pasar tras borrados parciales)
  if (!userId) {
    const authUser = await findAuthUserByEmail(supabase, email)
    if (authUser) {
      userId = authUser.id
      console.log('[createUserAndNotify] Usuario encontrado en auth.users:', userId)
      // Reconstruir perfil faltante
      try {
        await supabase.from('profiles').upsert({
          id: userId, email, nombre: params.nombre,
          telefono: params.telefono || '', empresa_id,
          creado_en: new Date().toISOString(),
        }, { onConflict: 'id' })
      } catch (e) {
        console.error('[createUserAndNotify] Error reconstruyendo perfil:', e)
      }
    }
  }

  // 3. Crear nuevo usuario si no existe en ningún lado
  if (!userId) {
    try {
      tempPassword = generatePassword()
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { nombre: params.nombre, telefono: params.telefono || '' },
      })

      if (!createError && newUser.user?.id) {
        userId = newUser.user.id
        isNewUser = true
        console.log('[createUserAndNotify] Usuario nuevo creado:', userId)

        await supabase.from('profiles').upsert({
          id: userId, email, nombre: params.nombre,
          telefono: params.telefono || '', empresa_id,
          creado_en: new Date().toISOString(),
        }, { onConflict: 'id' })
      } else if (createError) {
        console.error('[createUserAndNotify] Error creando usuario:', createError?.message)
      }
    } catch (e) {
      console.error('[createUserAndNotify] Error creando usuario:', e)
    }
  }

  // 4. Enviar email unificado (con o sin password según tipo de usuario)
  const nombresList = params.productos
    .map(p => `<li style="margin-bottom:6px;font-size:14px;color:#e5e7eb;">✅ ${p}</li>`)
    .join('')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blis-corp.com'

  // Solo enviamos plantilla de invitado (con password_temporal) cuando el invitado es NUEVO.
  // Si el invitado ya tenía cuenta, enviamos la plantilla de logueado.
  const evento = (params.isGuest && isNewUser)
    ? 'transaccion_compra_completada_invitado'
    : 'transaccion_compra_completada_logueado'

  const extraVars: Record<string, string> = {}
  if (isNewUser && tempPassword) {
    extraVars.password_temporal = tempPassword
    extraVars.enlace_crear_cuenta = `${siteUrl}/login`
    console.log('[createUserAndNotify] Usuario nuevo invitado, incluyendo password_temporal')
  }

  console.log('[createUserAndNotify] Enviando email:', evento, '| isGuest:', params.isGuest, '| isNewUser:', isNewUser)
  await sendTemplateEmail({
    evento,
    to: email,
    variables: {
      nombre: params.nombre, email,
      productos: `<ul style="margin:0;padding:0;list-style:none;">${nombresList}</ul>`,
      total: params.total, subtotal: params.total,
      metodo_pago: params.metodo_pago,
      fecha_compra: new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }),
      enlace_acceso: `${siteUrl}/miembros`,
      descuento_monto: '0.00',
      cupon: '',
      ...extraVars,
    },
    products: params.productPrices || params.productos.map(p => ({ nombre: p, precio: '0', categoria: '' })),
  })

  return { userId, isNewUser, tempPassword }
}
