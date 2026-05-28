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
  productPrices?: Array<{ nombre: string; precio: string; cantidad?: number; categoria?: string }>
}

interface CreateUserResult {
  userId: string | null
  isNewUser: boolean
  tempPassword: string
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

  // Fallback: buscar en auth si no encontró en profiles
  if (!userId) {
    try {
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find(u => u.email === email)
      if (existingUser) userId = existingUser.id
      console.log('[createUserAndNotify] Usuario encontrado en auth:', !!userId)
    } catch (e) {
      console.error('[createUserAndNotify] Error en listUsers:', e)
    }
  }

  // 2. Crear nuevo usuario si no existe
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
      } else if (createError?.status === 422 || createError?.message?.includes('already')) {
        // Ya existe en auth pero no en profiles — buscar id
        console.log('[createUserAndNotify] Usuario ya existe en auth, buscando id...')
        try {
          const { data: existingUsers } = await supabase.auth.admin.listUsers()
          const existingUser = existingUsers?.users?.find(u => u.email === email)
          if (existingUser) {
            userId = existingUser.id
            console.log('[createUserAndNotify] ID recuperado de auth:', userId)
          }
        } catch {}
      } else if (createError) {
        console.error('[createUserAndNotify] Error creando usuario:', createError)
      }
    } catch (e) {
      console.error('[createUserAndNotify] Error creando usuario:', e)
    }
  }

  // 3. Enviar email unificado (con o sin password según tipo de usuario)
  const nombresList = params.productos
    .map(p => `<li style="margin-bottom:6px;font-size:14px;color:#e5e7eb;">✅ ${p}</li>`)
    .join('')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blis-corp.com'

  const evento = userId
    ? 'transaccion_compra_completada_logueado'
    : 'transaccion_compra_completada_invitado'

  const extraVars: Record<string, string> = {}
  if (isNewUser && tempPassword) {
    extraVars.password_temporal = tempPassword
    console.log('[createUserAndNotify] Usuario nuevo, incluyendo password_temporal')
  }

  console.log('[createUserAndNotify] Enviando email:', evento)
  await sendTemplateEmail({
    evento,
    to: email,
    variables: {
      nombre: params.nombre, email,
      productos: `<ul style="margin:0;padding:0;list-style:none;">${nombresList}</ul>`,
      total: params.total, metodo_pago: params.metodo_pago,
      fecha_compra: new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }),
      enlace_acceso: `<a href="${siteUrl}/miembros" target="_blank">Acceder a Mis Productos →</a>`,
      ...extraVars,
    },
    products: params.productPrices || params.productos.map(p => ({ nombre: p, precio: '0', categoria: '' })),
  })

  return { userId, isNewUser, tempPassword }
}
