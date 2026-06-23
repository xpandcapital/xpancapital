import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'
import { createClient } from '@/lib/supabase/server'
import { sendTemplateEmail } from '@/lib/email/sendTemplateEmail'
import { generateSecurePassword } from '@/lib/crypto'

interface CreateUserParams {
  email: string
  nombre: string
  apellido?: string
  productos: string[]
  total: string
  metodo_pago: string
  empresa_id?: string
  telefono?: string
  isGuest?: boolean
  newUserPassword?: string
  productPrices?: Array<{ nombre: string; precio: string; cantidad?: number; categoria?: string; imagen?: string }>
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
          id: userId, email, nombre: params.nombre, apellido: params.apellido || '',
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
      tempPassword = generateSecurePassword()
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
          id: userId, email, nombre: params.nombre, apellido: params.apellido || '',
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

  // Si el caller (ej: checkout) ya creó al usuario en auth, usar su contraseña
  if (params.isGuest && userId && !isNewUser && params.newUserPassword) {
    isNewUser = true
    tempPassword = params.newUserPassword
    console.log('[createUserAndNotify] Usando password generada externamente (caller ya creó el usuario)')
  }

  // 4. Enviar email unificado (con o sin password según tipo de usuario)
  const nombresList = params.productos
    .map(p => `<li style="margin-bottom:6px;font-size:14px;color:#e5e7eb;">✅ ${p}</li>`)
    .join('')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blis-corp.com'

  // La contraseña temporal solo se incluye para usuarios NUEVOS.
  // Si es invitado pero su email ya existe, no se modifica su contraseña y se usa
  // la plantilla de usuario logueado (ya tiene cuenta y puede acceder con sus credenciales).
  const esInvitadoNuevo = params.isGuest && isNewUser && !!tempPassword

  const evento = esInvitadoNuevo
    ? 'transaccion_compra_completada_invitado'
    : 'transaccion_compra_completada_logueado'

  const extraVars: Record<string, string> = {}
  if (esInvitadoNuevo) {
    extraVars.password_temporal = tempPassword
    extraVars.enlace_crear_cuenta = `${siteUrl}/login`
    console.log('[createUserAndNotify] Invitado nuevo: incluyendo password_temporal:', tempPassword.substring(0, 3) + '***')
  } else if (params.isGuest && userId) {
    console.log('[createUserAndNotify] Invitado existente (no se modifica contraseña). userId:', userId)
  }

  // Normalizar total para la plantilla (el receipt ya agrega el signo $)
  const totalLimpio = params.total.replace(/^\$/, '').replace(/\s*USD\s*$/i, '').trim()

  const emailVars = {
    nombre: params.nombre,
    apellido: params.apellido || '',
    email,
    productos: `<ul style="margin:0;padding:0;list-style:none;">${nombresList}</ul>`,
    total: totalLimpio,
    subtotal: totalLimpio,
    metodo_pago: params.metodo_pago,
    fecha_compra: new Date().toLocaleDateString('es-PE', { timeZone: 'America/Lima', day: 'numeric', month: 'long', year: 'numeric' }),
    enlace_acceso: `${siteUrl}/miembros`,
    descuento_monto: '0.00',
    cupon: '',
    ...extraVars,
  }

  console.log('[createUserAndNotify] Enviando email:', evento, '| isGuest:', params.isGuest, '| isNewUser:', isNewUser, '| tempPassword presente:', !!tempPassword, '| variables keys:', Object.keys(emailVars))
  await sendTemplateEmail({
    evento,
    to: email,
    variables: emailVars,
    products: params.productPrices || params.productos.map(p => ({ nombre: p, precio: '0', categoria: '' })),
  })

  return { userId, isNewUser, tempPassword }
}
